const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Check if test users already exist
  const existingPatient = await prisma.user.findUnique({
    where: { email: 'tesnumber1@gmail.com' },
    include: { patientProfile: true }
  });

  const existingDoctor = await prisma.user.findUnique({
    where: { email: 'doctor@dentalization.com' },
    include: { doctorProfile: true }
  });

  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@dentalization.com' }
  });

  const hashedPassword = await bcrypt.hash('password123', 12);
  
  // Create test patient users and profiles
  if (!existingPatient) {
    // Create new patient users
    const testUser1 = await prisma.user.create({
      data: {
        email: 'tesnumber1@gmail.com',
        password: hashedPassword,
        role: 'PATIENT',
      },
    });

    const testUser2 = await prisma.user.create({
      data: {
        email: 'testnuber1@gmail.com',
        password: hashedPassword,
        role: 'PATIENT',
      },
    });

    // Create patient profile for the first test user
    await prisma.patientProfile.create({
      data: {
        userId: testUser1.id,
        firstName: 'Test',
        lastName: 'Patient',
        phone: '+6281234567890',
        dateOfBirth: new Date('1990-01-01'),
        address: 'Jl. Test No. 123, Jakarta',
        emergencyContact: 'Emergency Contact - +6281234567891',
        allergies: '',
        medicalHistory: '',
        profilePicture: null,
        profileComplete: false,
      },
    });

    // Create patient profile for the second test user
    await prisma.patientProfile.create({
      data: {
        userId: testUser2.id,
        firstName: 'Test',
        lastName: 'Patient',
        phone: '+6281234567890',
        birthDate: new Date('1990-01-01'),
        gender: 'MALE',
        address: 'Jl. Test No. 123, Jakarta',
        emergencyContactInfo: 'Emergency Contact - +6281234567891',
        allergies: '',
        medicalHistory: '',
        profilePhotoUrl: null,
        bpjsNumber: '',
        profileComplete: false,
      },
    });

    console.log('✅ Test patients created: tesnumber1@gmail.com / testnuber1@gmail.com');
  } else if (existingPatient && !existingPatient.patientProfile) {
    // Create profile for existing patient
    const existingPatient2 = await prisma.user.findUnique({
      where: { email: 'testnuber1@gmail.com' },
      include: { patientProfile: true }
    });

    if (!existingPatient.patientProfile) {
      await prisma.patientProfile.create({
        data: {
          userId: existingPatient.id,
          firstName: 'Test',
          lastName: 'Patient',
          phone: '+6281234567890',
          dateOfBirth: new Date('1990-01-01'),
        address: 'Jl. Test No. 123, Jakarta',
        emergencyContact: 'Emergency Contact - +6281234567891',
        allergies: '',
        medicalHistory: '',
        profilePicture: null,
          profileComplete: false,
        },
      });
    }

    if (existingPatient2 && !existingPatient2.patientProfile) {
      await prisma.patientProfile.create({
        data: {
          userId: existingPatient2.id,
          firstName: 'Test',
          lastName: 'Patient',
          phone: '+6281234567890',
          dateOfBirth: new Date('1990-01-01'),
           address: 'Jl. Test No. 123, Jakarta',
           emergencyContact: 'Emergency Contact - +6281234567891',
           allergies: '',
           medicalHistory: '',
           profilePicture: null,
          profileComplete: false,
        },
      });
    }

    console.log('✅ Patient profiles created for existing users');
  }

  // Create test doctor user and profile
  if (!existingDoctor) {
    // Create new doctor user
    const testDoctor = await prisma.user.create({
      data: {
        email: 'doctor@dentalization.com',
        password: hashedPassword,
        role: 'DOCTOR',
      },
    });

    // Create doctor profile
    await prisma.doctorProfile.create({
      data: {
        userId: testDoctor.id,
        firstName: 'Dr. Test',
        lastName: 'Doctor',
        phone: '+6281234567892',
        specialization: 'General Dentistry',
        licenseNumber: 'DRG001234567',
        experience: 5,
        education: 'Universitas Indonesia - Fakultas Kedokteran Gigi',
        bio: 'Experienced dentist specializing in general dentistry and oral health.',
        consultationFee: 150000,
        profileComplete: true,
      },
    });

    console.log('✅ Test doctor created: doctor@dentalization.com');
  } else if (existingDoctor && !existingDoctor.doctorProfile) {
    // Create profile for existing doctor
    await prisma.doctorProfile.create({
      data: {
        userId: existingDoctor.id,
        firstName: 'Dr. Test',
        lastName: 'Doctor',
        phone: '+6281234567892',
        specialization: 'General Dentistry',
        licenseNumber: 'DRG001234567',
        experience: 5,
        education: 'Universitas Indonesia - Fakultas Kedokteran Gigi',
         bio: 'Experienced dentist specializing in general dentistry and oral health.',
         consultationFee: 150000,
        profileComplete: true,
      },
    });

    console.log('✅ Doctor profile created for existing user');
  }

  // Create admin user
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: 'admin@dentalization.com',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('✅ Test admin created: admin@dentalization.com');
  }

  console.log('✅ Database seeding completed successfully!');
   console.log('📧 Patient: tesnumber1@gmail.com / testnuber1@gmail.com');
   console.log('📧 Doctor: doctor@dentalization.com');
   console.log('📧 Admin: admin@dentalization.com');
   console.log('🔑 Password for all: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
