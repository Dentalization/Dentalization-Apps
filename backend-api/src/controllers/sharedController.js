const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class SharedController {
  // Get user notifications
  async getNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20, isRead } = req.query;

      const where = {
        userId,
        ...(isRead !== undefined && { isRead: isRead === 'true' }),
      };

      const notifications = await prisma.notification.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: parseInt(limit),
      });

      const total = await prisma.notification.count({ where });
      const unreadCount = await prisma.notification.count({
        where: { userId, isRead: false },
      });

      res.json({
        success: true,
        data: {
          notifications,
          unreadCount,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching notifications',
      });
    }
  }

  // Mark notification as read
  async markNotificationRead(req, res) {
    try {
      const userId = req.user.id;
      const { notificationId } = req.params;

      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId,
        },
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
      }

      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });

      res.json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error) {
      console.error('Mark notification read error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating notification',
      });
    }
  }

  // Mark all notifications as read
  async markAllNotificationsRead(req, res) {
    try {
      const userId = req.user.id;

      await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      res.json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      console.error('Mark all notifications read error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating notifications',
      });
    }
  }

  // Get chat messages
  async getChatMessages(req, res) {
    try {
      const userId = req.user.id;
      const { otherUserId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      // Verify users can chat (must have appointment relationship)
      const canChat = await this.verifyCanChat(userId, otherUserId);
      if (!canChat) {
        return res.status(403).json({
          success: false,
          message: 'You cannot chat with this user',
        });
      }

      const messages = await prisma.chatMessage.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId },
          ],
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: parseInt(limit),
      });

      // Mark messages as read
      await prisma.chatMessage.updateMany({
        where: {
          senderId: otherUserId,
          receiverId: userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      res.json({
        success: true,
        data: {
          messages: messages.reverse(), // Return in chronological order
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
          },
        },
      });
    } catch (error) {
      console.error('Get chat messages error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching chat messages',
      });
    }
  }

  // Send chat message
  async sendChatMessage(req, res) {
    try {
      const senderId = req.user.id;
      const { receiverId } = req.params;
      const { message, messageType = 'TEXT' } = req.body;

      // Verify users can chat
      const canChat = await this.verifyCanChat(senderId, receiverId);
      if (!canChat) {
        return res.status(403).json({
          success: false,
          message: 'You cannot chat with this user',
        });
      }

      const chatMessage = await prisma.chatMessage.create({
        data: {
          senderId,
          receiverId,
          message,
          messageType,
        },
      });

      // Create notification for receiver
      await prisma.notification.create({
        data: {
          userId: receiverId,
          title: 'New Message',
          message: 'You have a new message',
          type: 'CHAT_MESSAGE',
          relatedId: chatMessage.id,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: chatMessage,
      });
    } catch (error) {
      console.error('Send chat message error:', error);
      res.status(500).json({
        success: false,
        message: 'Error sending message',
      });
    }
  }

  // Get chat contacts (users you can chat with)
  async getChatContacts(req, res) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;

      let contacts = [];

      if (userRole === 'PATIENT') {
        // Patients can chat with doctors they have appointments with
        contacts = await prisma.user.findMany({
          where: {
            role: 'DOCTOR',
            doctorAppointments: {
              some: {
                patientId: userId,
              },
            },
          },
          include: {
            doctorProfile: true,
          },
        });
      } else if (userRole === 'DOCTOR') {
        // Doctors can chat with their patients
        contacts = await prisma.user.findMany({
          where: {
            role: 'PATIENT',
            patientAppointments: {
              some: {
                doctorId: userId,
              },
            },
          },
          include: {
            patientProfile: true,
          },
        });
      }

      // Get last message for each contact
      const contactsWithLastMessage = await Promise.all(
        contacts.map(async (contact) => {
          const lastMessage = await prisma.chatMessage.findFirst({
            where: {
              OR: [
                { senderId: userId, receiverId: contact.id },
                { senderId: contact.id, receiverId: userId },
              ],
            },
            orderBy: {
              createdAt: 'desc',
            },
          });

          const unreadCount = await prisma.chatMessage.count({
            where: {
              senderId: contact.id,
              receiverId: userId,
              isRead: false,
            },
          });

          return {
            id: contact.id,
            profile: contact.patientProfile || contact.doctorProfile,
            role: contact.role,
            lastMessage,
            unreadCount,
          };
        })
      );

      res.json({
        success: true,
        data: contactsWithLastMessage,
      });
    } catch (error) {
      console.error('Get chat contacts error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching chat contacts',
      });
    }
  }

  // Verify if two users can chat with each other
  async verifyCanChat(userId1, userId2) {
    const appointment = await prisma.appointment.findFirst({
      where: {
        OR: [
          { patientId: userId1, doctorId: userId2 },
          { patientId: userId2, doctorId: userId1 },
        ],
      },
    });

    return !!appointment;
  }

  // Search users (doctors for patients, patients for doctors)
  async searchUsers(req, res) {
    try {
      const currentUserId = req.user.id;
      const currentUserRole = req.user.role;
      const { query, page = 1, limit = 20 } = req.query;

      if (!query || query.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters',
        });
      }

      let searchRole = currentUserRole === 'PATIENT' ? 'DOCTOR' : 'PATIENT';
      let profileField = searchRole === 'DOCTOR' ? 'doctorProfile' : 'patientProfile';

      const users = await prisma.user.findMany({
        where: {
          role: searchRole,
          status: 'ACTIVE',
          id: { not: currentUserId },
          OR: [
            {
              email: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              [profileField]: {
                firstName: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            },
            {
              [profileField]: {
                lastName: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            },
          ],
        },
        include: {
          [profileField]: true,
        },
        skip: (page - 1) * limit,
        take: parseInt(limit),
      });

      res.json({
        success: true,
        data: users.map(user => ({
          id: user.id,
          email: user.email,
          role: user.role,
          profile: user[profileField],
        })),
      });
    } catch (error) {
      console.error('Search users error:', error);
      res.status(500).json({
        success: false,
        message: 'Error searching users',
      });
    }
  }
}

module.exports = new SharedController();
