import 'dotenv/config';
import prisma from '../src/database/prisma.client.js';
import { Role } from '../src/generated/prisma/index.js';
import { BcryptUtil } from '../src/common/utils/bcrypt.util.js';

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set');
  }

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('ℹ️ Admin already exists, skipping seeding');
    return;
  }

  const hashedPassword = await BcryptUtil.hash(adminPassword);

  await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      role: Role.ADMIN,
      username: "admin"
    },
  });

  console.log('✅ Admin user created');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
