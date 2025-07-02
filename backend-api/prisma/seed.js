const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data (optional - be careful with this in production!)
    if (process.env.NODE_ENV === 'development') {
      console.log('🧹 Clearing existing data...');
      await prisma.chatMessage.deleteMany();
      await prisma.notification.deleteMany();
      await prisma.treatmentRecord.deleteMany();
      await prisma.photo.deleteMany();
      await prisma.appointment.deleteMany();
      await prisma.doctorAvailability.deleteMany();
      await prisma.session.deleteMany();
      await prisma.patientProfile.deleteMany();
      await prisma.doctorProfile.deleteMany();
      await prisma.user.deleteMany();
    }

    // Create sample admin user
    const adminPassword = await bcrypt.hash('admin123!', 12);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@dentalization.com',
        password: adminPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });
    console.log('✅ Created admin user:', admin.email);

    // Create sample doctors
    const doctor1Password = await bcrypt.hash('doctor123!', 12);
    const doctor1 = await prisma.user.create({
      data: {
        email: 'dr.smith@dentalization.com',
        password: doctor1Password,
        role: 'DOCTOR',
        status: 'ACTIVE',
        doctorProfile: {
          create: {
            firstName: 'John',
            lastName: 'Smith',
            phone: '+1234567890',
            specialization: 'General Dentistry',
            licenseNumber: 'DEN123456',
            yearsOfExperience: 10,
            education: 'DDS from Harvard School of Dental Medicine',
            bio: 'Experienced general dentist with a focus on preventive care and patient comfort.',
            clinicName: 'Smith Dental Care',
            clinicAddress: '123 Main St, City, State 12345',
          },
        },
      },
      include: {
        doctorProfile: true,
      },
    });
    console.log('✅ Created doctor:', doctor1.email);

    const doctor2Password = await bcrypt.hash('doctor123!', 12);
    const doctor2 = await prisma.user.create({
      data: {
        email: 'dr.johnson@dentalization.com',
        password: doctor2Password,
        role: 'DOCTOR',
        status: 'ACTIVE',
        doctorProfile: {
          create: {
            firstName: 'Sarah',
            lastName: 'Johnson',
            phone: '+1234567891',
            specialization: 'Orthodontics',
            licenseNumber: 'DEN789012',
            yearsOfExperience: 8,
            education: 'DDS from UCLA School of Dentistry',
            bio: 'Specialist in orthodontics and teeth alignment, helping patients achieve beautiful smiles.',
            clinicName: 'Johnson Orthodontics',
            clinicAddress: '456 Oak Ave, City, State 12345',
          },
        },
      },
      include: {
        doctorProfile: true,
      },
    });
    console.log('✅ Created doctor:', doctor2.email);

    // Create sample patients
    const patient1Password = await bcrypt.hash('patient123!', 12);
    const patient1 = await prisma.user.create({
      data: {
        email: 'patient1@example.com',
        password: patient1Password,
        role: 'PATIENT',
        status: 'ACTIVE',
        patientProfile: {
          create: {
            firstName: 'Alice',
            lastName: 'Wilson',
            phone: '+1234567892',
            dateOfBirth: new Date('1990-05-15'),
            address: '789 Pine St, City, State 12345',
            emergencyContact: 'Bob Wilson (Husband) - +1234567893',
            allergies: 'Penicillin',
            medicalHistory: 'No significant medical history',
          },
        },
      },
      include: {
        patientProfile: true,
      },
    });
    console.log('✅ Created patient:', patient1.email);

    const patient2Password = await bcrypt.hash('patient123!', 12);
    const patient2 = await prisma.user.create({
      data: {
        email: 'patient2@example.com',
        password: patient2Password,
        role: 'PATIENT',
        status: 'ACTIVE',
        patientProfile: {
          create: {
            firstName: 'Mike',
            lastName: 'Davis',
            phone: '+1234567894',
            dateOfBirth: new Date('1985-08-22'),
            address: '321 Elm St, City, State 12345',
            emergencyContact: 'Jane Davis (Wife) - +1234567895',
            medicalHistory: 'Diabetes Type 2, High Blood Pressure',
            medications: 'Metformin, Lisinopril',
          },
        },
      },
      include: {
        patientProfile: true,
      },
    });
    console.log('✅ Created patient:', patient2.email);

    // Create sample appointments
    const appointment1 = await prisma.appointment.create({
      data: {
        patientId: patient1.id,
        doctorId: doctor1.id,
        appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        reason: 'Regular checkup and cleaning',
        status: 'CONFIRMED',
        notes: 'Patient reported sensitivity in upper molars',
      },
    });
    console.log('✅ Created appointment for:', patient1.email);

    const appointment2 = await prisma.appointment.create({
      data: {
        patientId: patient2.id,
        doctorId: doctor2.id,
        appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
        reason: 'Orthodontic consultation',
        status: 'PENDING',
        notes: 'Patient interested in teeth alignment options',
      },
    });
    console.log('✅ Created appointment for:', patient2.email);

    // Create doctor availability (sample schedule)
    const availabilitySlots = [
      // Dr. Smith - Monday to Friday, 9 AM to 5 PM
      { doctorId: doctor1.id, dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
      { doctorId: doctor1.id, dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
      { doctorId: doctor1.id, dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
      { doctorId: doctor1.id, dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
      { doctorId: doctor1.id, dayOfWeek: 5, startTime: '09:00', endTime: '17:00' },
      
      // Dr. Johnson - Monday to Thursday, 10 AM to 6 PM
      { doctorId: doctor2.id, dayOfWeek: 1, startTime: '10:00', endTime: '18:00' },
      { doctorId: doctor2.id, dayOfWeek: 2, startTime: '10:00', endTime: '18:00' },
      { doctorId: doctor2.id, dayOfWeek: 3, startTime: '10:00', endTime: '18:00' },
      { doctorId: doctor2.id, dayOfWeek: 4, startTime: '10:00', endTime: '18:00' },
    ];

    await prisma.doctorAvailability.createMany({
      data: availabilitySlots,
    });
    console.log('✅ Created doctor availability schedules');

    // Create sample notifications
    await prisma.notification.createMany({
      data: [
        {
          userId: patient1.id,
          title: 'Appointment Confirmed',
          message: 'Your appointment with Dr. Smith has been confirmed for tomorrow.',
          type: 'APPOINTMENT_CONFIRMATION',
          relatedId: appointment1.id,
        },
        {
          userId: doctor2.id,
          title: 'New Appointment Request',
          message: 'You have a new appointment request from Mike Davis.',
          type: 'APPOINTMENT_REQUEST',
          relatedId: appointment2.id,
        },
        {
          userId: patient2.id,
          title: 'Welcome to Dentalization',
          message: 'Welcome to Dentalization! Your account has been created successfully.',
          type: 'GENERAL',
        },
      ],
    });
    console.log('✅ Created sample notifications');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Sample Accounts Created:');
    console.log('Admin: admin@dentalization.com / admin123!');
    console.log('Doctor: dr.smith@dentalization.com / doctor123!');
    console.log('Doctor: dr.johnson@dentalization.com / doctor123!');
    console.log('Patient: patient1@example.com / patient123!');
    console.log('Patient: patient2@example.com / patient123!');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('❌ Seeding failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
