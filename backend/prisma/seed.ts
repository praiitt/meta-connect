import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@metalconnect.com' } });
  
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        email: 'admin@metalconnect.com',
        password: hashedPassword,
        name: 'Admin User',
        phone: '1234567890',
        company: 'Metal Connect Admin',
        role: 'ADMIN',
        status: 'APPROVED',
      },
    });
    console.log('Admin user created (admin@metalconnect.com / admin123)');
  } else {
    console.log('Admin user already exists');
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });