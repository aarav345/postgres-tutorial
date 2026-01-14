// scripts/test-connection.ts
import { configDotenv } from 'dotenv';
configDotenv();


import prisma from "../database/prisma.client.js";




async function main() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL);

    
    await prisma.$connect();
    console.log('✅ Connected to database');

    const result = await prisma.$queryRaw`SELECT current_database(), current_user, version()`;
    console.log('📊 Database info:', result);

    // Test creating a user
    console.log('\n🔍 Testing user creation...');
    const testUser = await prisma.user.create({
      data: {
        email: 'test@test.com',
        password: 'hashedpassword',
        username: 'Test User',
        role: 'USER',
      },
    });
    console.log('✅ User created:', testUser);

    // Clean up
    await prisma.user.delete({
      where: { id: testUser.id },
    });
    console.log('✅ Test user deleted');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

await main();