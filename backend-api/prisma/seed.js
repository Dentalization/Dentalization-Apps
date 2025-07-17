const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Check if test user already exists
  let existingUser = await prisma.user.findUnique({
    where: { email: 'tesnumber1@gmail.com' }
  });

  if (!existingUser) {
    existingUser = await prisma.user.findUnique({
      where: { email: 'testnuber1@gmail.com' }
    });
  }

  if (existingUser) {
    console.log('✅ Test user already exists:', existingUser.email);
    return;
  }

  // Create test patient user with both email variants
  const hashedPassword = await bcrypt.hash('password123', 12);
  
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
      phoneNumber: '+6281234567890',
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

  // Create patient profile for the second test user
  await prisma.patientProfile.create({
    data: {
      userId: testUser2.id,
      firstName: 'Test',
      lastName: 'Patient',
      phoneNumber: '+6281234567890',
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

  console.log('✅ Test users created successfully!');
  console.log('📧 Email 1: tesnumber1@gmail.com');
  console.log('📧 Email 2: testnuber1@gmail.com');
  console.log('🔑 Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
