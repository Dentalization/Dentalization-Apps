const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class DoctorController {
  // Get doctor dashboard data
  async getDashboard(req, res) {
    try {
      const doctorId = req.user.id;

      // Get today's appointments
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayAppointments = await prisma.appointment.findMany({
        where: {
          doctorId,
          appointmentDate: {
            gte: today,
            lt: tomorrow,
          },
        },
        include: {
          patient: {
            include: {
              patientProfile: true,
            },
          },
        },
        orderBy: {
          appointmentDate: 'asc',
        },
      });

      // Get pending appointment requests
      const pendingAppointments = await prisma.appointment.findMany({
        where: {
          doctorId,
          status: 'PENDING',
        },
        include: {
          patient: {
            include: {
              patientProfile: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      });

      // Get recent patient photos requiring review
      const photosForReview = await prisma.photo.findMany({
        where: {
          analysisStatus: 'PENDING',
          patient: {
            patientAppointments: {
              some: {
                doctorId,
              },
            },
          },
        },
        include: {
          patient: {
            include: {
              patientProfile: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      });

      // Get statistics
      const stats = await this.getDoctorStats(doctorId);

      res.json({
        success: true,
        data: {
          todayAppointments,
          pendingAppointments,
          photosForReview,
          stats,
        },
      });
    } catch (error) {
      console.error('Doctor dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching dashboard data',
      });
    }
  }

  // Get doctor statistics
  async getDoctorStats(doctorId) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalPatients = await prisma.appointment.groupBy({
      by: ['patientId'],
      where: {
        doctorId,
      },
    });

    const monthlyAppointments = await prisma.appointment.count({
      where: {
        doctorId,
        createdAt: {
          gte: monthStart,
        },
      },
    });

    const completedAppointments = await prisma.appointment.count({
      where: {
        doctorId,
        status: 'COMPLETED',
      },
    });

    const pendingRequests = await prisma.appointment.count({
      where: {
        doctorId,
        status: 'PENDING',
      },
    });

    return {
      totalPatients: totalPatients.length,
      monthlyAppointments,
      completedAppointments,
      pendingRequests,
    };
  }

  // Update doctor profile
  async updateProfile(req, res) {
    try {
      const doctorId = req.user.id;
      const updateData = req.body;

      const updatedProfile = await prisma.doctorProfile.update({
        where: {
          userId: doctorId,
        },
        data: updateData,
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedProfile,
      });
    } catch (error) {
      console.error('Update doctor profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating profile',
      });
    }
  }

  // Get doctor's patients
  async getPatients(req, res) {
    try {
      const doctorId = req.user.id;
      const { search, page = 1, limit = 20 } = req.query;

      const where = {
        patientAppointments: {
          some: {
            doctorId,
          },
        },
        ...(search && {
          OR: [
            {
              patientProfile: {
                firstName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
            {
              patientProfile: {
                lastName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
            {
              email: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        }),
      };

      const patients = await prisma.user.findMany({
        where,
        include: {
          patientProfile: true,
          patientAppointments: {
            where: {
              doctorId,
            },
            orderBy: {
              appointmentDate: 'desc',
            },
            take: 1,
          },
        },
        skip: (page - 1) * limit,
        take: parseInt(limit),
      });

      const total = await prisma.user.count({ where });

      res.json({
        success: true,
        data: {
          patients: patients.map(patient => ({
            id: patient.id,
            email: patient.email,
            profile: patient.patientProfile,
            lastAppointment: patient.patientAppointments[0] || null,
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
      console.error('Get doctor patients error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching patients',
      });
    }
  }

  // Get patient details for doctor
  async getPatientDetails(req, res) {
    try {
      const doctorId = req.user.id;
      const { patientId } = req.params;

      // Verify doctor has access to this patient
      const hasAccess = await prisma.appointment.findFirst({
        where: {
          doctorId,
          patientId,
        },
      });

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this patient',
        });
      }

      const patient = await prisma.user.findUnique({
        where: { id: patientId },
        include: {
          patientProfile: true,
          patientAppointments: {
            where: { doctorId },
            orderBy: { appointmentDate: 'desc' },
          },
          photos: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found',
        });
      }

      res.json({
        success: true,
        data: {
          patient: {
            id: patient.id,
            email: patient.email,
            profile: patient.patientProfile,
          },
          appointments: patient.patientAppointments,
          recentPhotos: patient.photos,
        },
      });
    } catch (error) {
      console.error('Get patient details error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching patient details',
      });
    }
  }

  // Get doctor appointments
  async getAppointments(req, res) {
    try {
      const doctorId = req.user.id;
      const { status, date, page = 1, limit = 20 } = req.query;

      const where = {
        doctorId,
        ...(status && { status }),
        ...(date && {
          appointmentDate: {
            gte: new Date(date),
            lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
          },
        }),
      };

      const appointments = await prisma.appointment.findMany({
        where,
        include: {
          patient: {
            include: {
              patientProfile: true,
            },
          },
        },
        orderBy: {
          appointmentDate: 'asc',
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
      console.error('Get doctor appointments error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching appointments',
      });
    }
  }

  // Update appointment status
  async updateAppointmentStatus(req, res) {
    try {
      const doctorId = req.user.id;
      const { appointmentId } = req.params;
      const { status, notes } = req.body;

      const appointment = await prisma.appointment.findFirst({
        where: {
          id: appointmentId,
          doctorId,
        },
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found',
        });
      }

      const updatedAppointment = await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          status,
          notes,
          updatedAt: new Date(),
        },
        include: {
          patient: {
            include: {
              patientProfile: true,
            },
          },
        },
      });

      // Create notification for patient
      await prisma.notification.create({
        data: {
          userId: appointment.patientId,
          title: `Appointment ${status.toLowerCase()}`,
          message: `Your appointment has been ${status.toLowerCase()}`,
          type: 'APPOINTMENT_UPDATE',
          relatedId: appointmentId,
        },
      });

      res.json({
        success: true,
        message: 'Appointment updated successfully',
        data: updatedAppointment,
      });
    } catch (error) {
      console.error('Update appointment status error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating appointment',
      });
    }
  }

  // Add diagnosis/treatment notes
  async addTreatmentNotes(req, res) {
    try {
      const doctorId = req.user.id;
      const { appointmentId } = req.params;
      const { diagnosis, treatment, recommendations, nextAppointment } = req.body;

      const appointment = await prisma.appointment.findFirst({
        where: {
          id: appointmentId,
          doctorId,
        },
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found',
        });
      }

      const treatmentRecord = await prisma.treatmentRecord.create({
        data: {
          appointmentId,
          diagnosis,
          treatment,
          recommendations,
          nextAppointment: nextAppointment ? new Date(nextAppointment) : null,
        },
      });

      // Update appointment status to completed
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: 'COMPLETED' },
      });

      res.json({
        success: true,
        message: 'Treatment notes added successfully',
        data: treatmentRecord,
      });
    } catch (error) {
      console.error('Add treatment notes error:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding treatment notes',
      });
    }
  }

  // Set availability schedule
  async setAvailability(req, res) {
    try {
      const doctorId = req.user.id;
      const { availableSlots } = req.body; // Array of time slots

      // Delete existing availability
      await prisma.doctorAvailability.deleteMany({
        where: { doctorId },
      });

      // Create new availability slots
      const availability = await prisma.doctorAvailability.createMany({
        data: availableSlots.map(slot => ({
          doctorId,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: slot.isAvailable || true,
        })),
      });

      res.json({
        success: true,
        message: 'Availability updated successfully',
        data: availability,
      });
    } catch (error) {
      console.error('Set availability error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating availability',
      });
    }
  }
}

module.exports = new DoctorController();
