import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const metals = [
    { type: 'STEEL', price: 450 },
    { type: 'ALUMINIUM', price: 280 },
    { type: 'BRASS', price: 520 },
    { type: 'COPPER', price: 750 },
    { type: 'BRONZE', price: 420 },
    { type: 'IRON', price: 380 },
  ];

  for (const m of metals) {
    const existing = await prisma.metalPrice.findFirst({ where: { metalType: m.type } });
    if (!existing) {
      await prisma.metalPrice.create({
        data: {
          metalType: m.type,
          pricePerKg: m.price,
          effectiveDate: new Date(),
        }
      });
      console.log(`Created ${m.type} price: ${m.price}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
