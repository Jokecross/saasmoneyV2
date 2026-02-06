import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create app settings
  await prisma.appSettings.upsert({
    where: { id: "settings_1" },
    update: {},
    create: {
      id: "settings_1",
      oneOfOneCost: 50,
    },
  });

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@saasmoney.fr" },
    update: {},
    create: {
      email: "demo@saasmoney.fr",
      password: "demo123", // In production, hash this!
      name: "Marie Dupont",
      role: "user",
      coinsBalance: 150,
    },
  });

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@saasmoney.fr" },
    update: {},
    create: {
      email: "admin@saasmoney.fr",
      password: "admin123", // In production, hash this!
      name: "Admin SaaS",
      role: "admin",
      coinsBalance: 999,
    },
  });

  // Create HotSet types
  const hotsetTypes = [
    {
      id: "hotset_type_1",
      name: "Audit Express",
      description: "Un audit complet de ton SaaS en 60 minutes.",
      duration: 60,
    },
    {
      id: "hotset_type_2",
      name: "Refonte Offre",
      description: "Restructure ton offre commerciale pour maximiser les conversions.",
      duration: 90,
    },
    {
      id: "hotset_type_3",
      name: "Positionnement",
      description: "Trouve ta niche et différencie-toi.",
      duration: 60,
    },
    {
      id: "hotset_type_4",
      name: "Go-to-Market",
      description: "Stratégie de lancement complète.",
      duration: 120,
    },
  ];

  for (const type of hotsetTypes) {
    await prisma.hotsetType.upsert({
      where: { id: type.id },
      update: {},
      create: type,
    });
  }

  // Create One of One slots for the next 2 weeks
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let day = 1; day <= 14; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() + day);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    // Add 3 slots per day
    const hours = [10, 14, 16];
    for (const hour of hours) {
      const slotDate = new Date(date);
      slotDate.setHours(hour, 0, 0, 0);

      await prisma.oneOfOneSlot.create({
        data: {
          date: slotDate,
          duration: 30,
          isAvailable: true,
        },
      });
    }
  }

  // Create HotSet slots
  for (const type of hotsetTypes) {
    for (let day = 1; day <= 14; day++) {
      const date = new Date(today);
      date.setDate(date.getDate() + day);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      // One slot every 3 days per type
      if (day % 3 !== 0) continue;

      const slotDate = new Date(date);
      slotDate.setHours(9, 0, 0, 0);

      await prisma.hotsetSlot.create({
        data: {
          typeId: type.id,
          date: slotDate,
          isAvailable: true,
        },
      });
    }
  }

  // Give demo user some bonus coins
  await prisma.coinTransaction.create({
    data: {
      userId: demoUser.id,
      amount: 100,
      type: "credit",
      reason: "bonus",
      metadata: JSON.stringify({ note: "Bonus de bienvenue" }),
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log(`   - Demo user: demo@saasmoney.fr`);
  console.log(`   - Admin user: admin@saasmoney.fr`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

