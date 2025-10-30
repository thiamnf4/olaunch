import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Seeds some initial data so the app has something to work with after setup
async function main() {
  // Create a demo user (or reuse if already exists)
  const user = await prisma.user.upsert({
    where: { email: "demo@openlaunch.local" },
    update: {},
    create: { email: "demo@openlaunch.local" },
  });

  // Create a project for that user
  const project = await prisma.project.create({
    data: { name: "Demo Project", userId: user.id },
  });

  const env = await prisma.environment.create({
    data: { name: "development", projectId: project.id },
  });

  const flag = await prisma.flag.create({
    data: {
      key: "new_homepage",
      description: "Try the new homepage layout",
      enabled: true,
      percentage: 25,
      environmentId: env.id,
      variantJson: { color: "blue" },
    },
  });

  // Log the creation for audit history
  await prisma.auditLog.create({
    data: { flagId: flag.id, message: "Seeded demo flag" },
  });

  // Add a simple segment that can be linked to the flag
  await prisma.segment.create({
    data: {
      name: "us_users",
      ruleKey: "country",
      ruleValue: "US",
      flags: { connect: [{ id: flag.id }] }
    }
  });

  console.log("Seed complete");
}

main().finally(() => prisma.$disconnect());
