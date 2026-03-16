import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { value: 'USER', description: 'Обычный пользователь' },
    { value: 'ADMIN', description: 'Администратор' },
  ];

  for (const role of roles) {
    // upsert по value
    await prisma.role.upsert({
      where: { value: role.value },
      update: {
        description: role.description,
      },
      create: role,
    });
  }
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

