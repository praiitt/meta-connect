import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding categories...');

  const categories = [
    {
      name: 'Utensils',
      description: 'Spoons, forks, knives, and serving utensils'
    },
    {
      name: 'Cookware',
      description: 'Pots, pans, kadais, and cooking vessels'
    },
    {
      name: 'Serving Items',
      description: 'Plates, bowls, trays, and serving dishes'
    },
    {
      name: 'Storage',
      description: 'Containers, jars, and storage solutions'
    },
    {
      name: 'Accessories',
      description: 'Kitchen tools and accessories'
    }
  ];

  for (const category of categories) {
    const existing = await prisma.category.findFirst({
      where: { name: category.name }
    });

    if (existing) {
      console.log(`✓ Category "${category.name}" already exists`);
    } else {
      await prisma.category.create({
        data: category
      });
      console.log(`✓ Created category: ${category.name}`);
    }
  }

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
