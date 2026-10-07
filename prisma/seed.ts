import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const freeUser = await prisma.user.upsert({
    where: {
      email: "free@example.com",
    },
    update: {},
    create: {
      email: "free@example.com",
      name: "Free User",
      plan: "free",
    },
  });

  const premiumUser = await prisma.user.upsert({
    where: {
      email: "premium@example.com",
    },
    update: {},
    create: {
      email: "premium@example.com",
      name: "Premium User",
      plan: "premium",
    },
  });

  await prisma.goal.create({
    data: {
      userId: freeUser.id,
      name: "Emergency Fund",
      targetAmount: 1000,
      savedAmount: 1000,
      deadline: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: "active",
    },
  });

  await prisma.goal.create({
    data: {
      userId: premiumUser.id,
      name: "New Laptop",
      targetAmount: 2000,
      savedAmount: 2000,
      deadline: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: "active",
    },
  });

  await prisma.goal.create({
    data: {
      userId: freeUser.id,
      name: "Vacation",
      targetAmount: 1500,
      savedAmount: 700,
      deadline: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: "active",
    },
  });

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
