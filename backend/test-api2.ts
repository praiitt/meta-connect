import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  const currentPrice = await prisma.metalPrice.findFirst({
    orderBy: { effectiveDate: 'desc' },
  });
  console.log('Current Price:', currentPrice);

  const history = await prisma.metalPrice.findMany({
    orderBy: { effectiveDate: 'desc' },
    take: 30,
  });
  console.log('History:', history.length);
}
test().finally(() => prisma.$disconnect());
