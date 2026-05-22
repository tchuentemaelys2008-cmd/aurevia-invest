import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();

async function main() {
  // Seed passes
  const passes = [
    { name: "Aurevia Starter", price: 4000, dailyReturn: 5, duration: 30, color: "#3b6fd4", icon: "shield", description: "Idéal pour débuter, accès aux revenus journaliers" },
    { name: "Aurevia Pro", price: 8000, dailyReturn: 8, duration: 30, color: "#6c4de6", icon: "zap", description: "Pour les investisseurs confirmés, meilleurs rendements" },
    { name: "Aurevia Elite", price: 15000, dailyReturn: 12, duration: 30, color: "#e6874d", icon: "star", description: "Rendements élevés pour les experts, gains maximaux" },
    { name: "Aurevia VIP", price: 25000, dailyReturn: 18, duration: 30, color: "#e6d44d", icon: "crown", description: "Accès exclusif VIP, rendements premium garantis" },
  ];

  for (const pass of passes) {
    await prisma.pass.upsert({
      where: { id: pass.name },
      update: {},
      create: { ...pass, id: pass.name.toLowerCase().replace(/\s+/g, "-") },
    });
  }

  // Seed daily tasks
  const tasks = [
    { id: "task-login", title: "Se connecter", description: "Connectez-vous a votre compte", reward: 0.05, type: "LOGIN" },
    { id: "task-visit", title: "Visiter la page des passes", description: "Visitez la page des passes", reward: 0.05, type: "VISIT_PASSES" },
    { id: "task-share", title: "Partager avec 3 amis", description: "Partagez votre lien avec 3 amis", reward: 0.05, type: "SHARE" },
    { id: "task-social", title: "Suivre nos reseaux sociaux", description: "Suivez-nous sur les reseaux sociaux", reward: 0.05, type: "SOCIAL" },
    { id: "task-invite", title: "Inviter 1 ami", description: "Invitez un ami a rejoindre", reward: 0.10, type: "INVITE" },
  ];

  for (const task of tasks) {
    await prisma.dailyTask.upsert({
      where: { id: task.id },
      update: {},
      create: task,
    });
  }

  // Seed admin user
  const adminPassword = await bcrypt.hash("Admin@2024!", 12);
  await prisma.user.upsert({
    where: { email: "admin@aurevia.com" },
    update: {},
    create: {
      name: "Admin Aurevia",
      email: "admin@aurevia.com",
      password: adminPassword,
      role: "ADMIN",
      referralCode: nanoid(8).toUpperCase(),
      balance: 0,
    },
  });

  // Seed demo user
  const demoPassword = await bcrypt.hash("Demo@2024!", 12);
  await prisma.user.upsert({
    where: { email: "demo@aurevia.com" },
    update: {},
    create: {
      name: "Jean Dupont",
      email: "demo@aurevia.com",
      password: demoPassword,
      role: "USER",
      referralCode: nanoid(8).toUpperCase(),
      balance: 12450,
      totalEarnings: 2450,
      totalInvested: 10000,
    },
  });

  console.log("✅ Database seeded successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
