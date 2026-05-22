import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();

async function main() {
  // Seed passes
  const passes = [
    { name: "Aurevia Starter",  price:  4000, dailyReturn:  4, duration: 30, color: "#3b6fd4", icon: "shield", description: "Idéal pour débuter — revenus journaliers dès le premier jour" },
    { name: "Aurevia Bronze",   price: 10000, dailyReturn:  6, duration: 30, color: "#b87333", icon: "zap",    description: "Premier palier intermédiaire, rendements attractifs" },
    { name: "Aurevia Silver",   price: 25000, dailyReturn:  9, duration: 30, color: "#6c4de6", icon: "star",   description: "Accès Silver — meilleurs taux, priorité de support" },
    { name: "Aurevia Gold",     price: 50000, dailyReturn: 13, duration: 30, color: "#e6874d", icon: "trending-up", description: "Niveau Gold — rendements élevés pour les experts" },
    { name: "Aurevia Platinum", price: 75000, dailyReturn: 16, duration: 30, color: "#e6d44d", icon: "award",  description: "Statut Platinum — accès exclusif et gains premium" },
    { name: "Aurevia VIP",      price:100000, dailyReturn: 20, duration: 30, color: "#e6404d", icon: "crown",  description: "Niveau ultime — rendements maximum garantis, support dédié" },
  ];

  // Remove old passes and recreate fresh
  await prisma.pass.deleteMany({});
  for (const pass of passes) {
    const id = pass.name.toLowerCase().replace(/\s+/g, "-");
    await prisma.pass.create({ data: { ...pass, id } });
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
