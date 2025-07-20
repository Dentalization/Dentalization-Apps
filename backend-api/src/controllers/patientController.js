const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PatientController {
  // Get patient dashboard data
  async getDashboard(req, res) {
    try {
      const patientId = req.user.id;

      // Get upcoming appointments
      const upcomingAppointments = await prisma.appointment.findMany({
        where: {
          patientId,
          scheduledAt: {
            gte: new Date(),
          },
          status: {
            in: ['PENDING', 'CONFIRMED'],
          },
        },
        include: {
          doctor: {
            include: {
              doctorProfile: true,
            },
          },
        },
        orderBy: {
          scheduledAt: 'asc',
        },
        take: 5,
      });

      // Get recent photos
      const recentPhotos = await prisma.dentalPhoto.findMany({
        where: {
          patientId,
        },
        orderBy: {
          uploadedAt: 'desc',
        },
        take: 5,
      });

      // Get unread notifications
      const unreadNotifications = await prisma.notification.findMany({
        where: {
          userId: patientId,
          isRead: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      });

      res.json({
        success: true,
        data: {
          upcomingAppointments,
          recentPhotos,
          unreadNotifications,
          summary: {
            totalAppointments: upcomingAppointments.length,
            totalPhotos: recentPhotos.length,
            unreadCount: unreadNotifications.length,
          },
        },
      });
    } catch (error) {
      console.error('Patient dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching dashboard data',
      });
    }
  }

  // Update patient profile
  async updateProfile(req, res) {
    try {
      const patientId = req.user.id;
      const updateData = req.body;

      const updatedProfile = await prisma.patientProfile.update({
        where: {
          userId: patientId,
        },
        data: updateData,
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedProfile,
      });
    } catch (error) {
      console.error('Update patient profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating profile',
      });
    }
  }

  // Get patient appointments
  async getAppointments(req, res) {
    try {
      const patientId = req.user.id;
      const { status, page = 1, limit = 10 } = req.query;

      const where = {
        patientId,
        ...(status && { status }),
      };

      const appointments = await prisma.appointment.findMany({
        where,
        include: {
          doctor: {
            include: {
              doctorProfile: true,
            },
          },
        },
        orderBy: {
          scheduledAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: parseInt(limit),
      });

      const total = await prisma.appointment.count({ where });

      res.json({
        success: true,
        data: {
          appointments,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error('Get patient appointments error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching appointments',
      });
    }
  }

  // Book new appointment
  async bookAppointment(req, res) {
    try {
      const patientId = req.user.id;
      const { doctorId, appointmentDate, reason, notes } = req.body;

      // Check if doctor exists and is active
      const doctor = await prisma.user.findFirst({
        where: {
          id: doctorId,
          role: 'DOCTOR',
          status: 'ACTIVE',
        },
      });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found or not available',
        });
      }

      // Check if appointment slot is available
      const existingAppointment = await prisma.appointment.findFirst({
        where: {
          doctorId,
          scheduledAt: new Date(appointmentDate),
          status: {
            in: ['PENDING', 'CONFIRMED'],
          },
        },
      });

      if (existingAppointment) {
        return res.status(400).json({
          success: false,
          message: 'This time slot is already booked',
        });
      }

      const appointment = await prisma.appointment.create({
        data: {
          patientId,
          doctorId,
          scheduledAt: new Date(appointmentDate),
          reason,
          notes,
          status: 'PENDING',
        },
        include: {
          doctor: {
            include: {
              doctorProfile: true,
            },
          },
        },
      });

      // Create notification for doctor
      await prisma.notification.create({
        data: {
          userId: doctorId,
          title: 'New Appointment Request',
          message: `You have a new appointment request for ${new Date(appointmentDate).toLocaleDateString()}`,
          type: 'APPOINTMENT_REQUEST',
          relatedId: appointment.id,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Appointment booked successfully',
        data: appointment,
      });
    } catch (error) {
      console.error('Book appointment error:', error);
      res.status(500).json({
        success: false,
        message: 'Error booking appointment',
      });
    }
  }

  // Get patient photos
  async getPhotos(req, res) {
    try {
      const patientId = req.user.id;
      const { page = 1, limit = 20 } = req.query;

      const photos = await prisma.dentalPhoto.findMany({
        where: {
          patientId,
        },
        orderBy: {
          uploadedAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: parseInt(limit),
      });

      const total = await prisma.dentalPhoto.count({
        where: { patientId },
      });

      res.json({
        success: true,
        data: {
          photos,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error('Get patient photos error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching photos',
      });
    }
  }

  // Upload photo
  async uploadPhoto(req, res) {
    try {
      const patientId = req.user.id;
      const { description, tags } = req.body;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No photo file provided',
        });
      }

      // In a real app, you'd upload to cloud storage (Cloudinary, AWS S3, etc.)
      const photo = await prisma.dentalPhoto.create({
        data: {
          patientId,
          imageUrl: req.file.path, // This would be the cloud storage URL
          description,
          tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        },
      });

      res.status(201).json({
        success: true,
        message: 'Photo uploaded successfully',
        data: photo,
      });
    } catch (error) {
      console.error('Upload photo error:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading photo',
      });
    }
  }

  // Get available doctors
  async getAvailableDoctors(req, res) {
    try {
      const { specialization, page = 1, limit = 10 } = req.query;

      const where = {
        role: 'DOCTOR',
        status: 'ACTIVE',
        ...(specialization && {
          doctorProfile: {
            specialization: {
              contains: specialization,
              mode: 'insensitive',
            },
          },
        }),
      };

      const doctors = await prisma.user.findMany({
        where,
        include: {
          doctorProfile: true,
        },
        skip: (page - 1) * limit,
        take: parseInt(limit),
      });

      const total = await prisma.user.count({ where });

      res.json({
        success: true,
        data: {
          doctors: doctors.map(doctor => ({
            id: doctor.id,
            profile: doctor.doctorProfile,
            status: doctor.status,
          })),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error('Get available doctors error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching available doctors',
      });
    }
  }
}

module.exports = new PatientController();
