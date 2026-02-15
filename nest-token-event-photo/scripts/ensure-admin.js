const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

async function ensureAdmin() {
  const prisma = new PrismaClient();

  const adminName = process.env.ADMIN_NAME || 'Admin User';
  const adminEmail = process.env.ADMIN_EMAIL || 'test@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'TestAAA1#';
  const adminRole = 'admin';

  if (!adminPassword || adminPassword.length < 8) {
    throw new Error('ADMIN_PASSWORD must have at least 8 characters');
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      role: adminRole,
      passwordHash,
    },
    create: {
      name: adminName,
      email: adminEmail,
      role: adminRole,
      passwordHash,
    },
  });

  await prisma.$disconnect();
  console.log(`[ensure-admin] Admin ensured for ${adminEmail}`);
}

ensureAdmin().catch((error) => {
  console.error('[ensure-admin] Failed:', error.message);
  process.exit(1);
});

