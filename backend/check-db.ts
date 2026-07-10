import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const prices = await prisma.metalPrice.findMany();
  console.log('Metal Prices:', prices);
}
main().finally(() => prisma.$disconnect());
