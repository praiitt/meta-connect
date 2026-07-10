import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding initial metal price...');

  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!admin) {
    console.error('❌ No admin user found. Please seed users first.');
    return;
  }

  // Check if metal price already exists
  const existing = await prisma.metalPrice.findFirst();
  if (existing) {
    console.log('ℹ️  Metal price already exists. Skipping seed.');
    return;
  }

  const metalPrice = await prisma.metalPrice.create({
    data: {
      pricePerKg: 500.0, // ₹500 per kg as starting price
      effectiveDate: new Date(),
      createdBy: admin.id,
    },
  });

  console.log('✅ Created initial metal price:', metalPrice);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
