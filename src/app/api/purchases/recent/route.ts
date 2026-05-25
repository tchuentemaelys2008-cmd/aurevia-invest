export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const displayNames = [
  "Camille Durand",
  "Noah Kouassi",
  "Aminata Sow",
  "Hugo Morel",
  "Sarah Nguessan",
  "Ibrahim Diallo",
  "Lea Martin",
  "Yannick Fofana",
  "Mariam Traore",
  "Lucas Bernard",
  "Nadia Mensah",
  "Arnaud Mbarga",
];

const fallback = [
  { id: "live-1", user: "Camille Durand", pass: "Aurevia Gold", amount: 50000, createdAt: new Date().toISOString() },
  { id: "live-2", user: "Noah Kouassi", pass: "Aurevia Silver", amount: 25000, createdAt: new Date().toISOString() },
  { id: "live-3", user: "Aminata Sow", pass: "Aurevia VIP", amount: 100000, createdAt: new Date().toISOString() },
  { id: "live-4", user: "Hugo Morel", pass: "Aurevia Boost", amount: 8000, createdAt: new Date().toISOString() },
];

function cleanDisplayName(name: string, index: number) {
  const looksFake = /test|demo|user|admin|123|xxx|fake/i.test(name) || name.trim().length < 3;
  return looksFake ? displayNames[index % displayNames.length] : name.trim();
}

export async function GET() {
  try {
    const purchases = await prisma.userPass.findMany({
      where: { status: { in: ["ACTIVE", "PENDING"] } },
      orderBy: { createdAt: "desc" },
      take: 12,
      include: {
        user: { select: { name: true, isVerified: true } },
        pass: { select: { name: true, price: true, color: true } },
      },
    });

    const data = purchases.map((purchase, index) => ({
      id: purchase.id,
      user: cleanDisplayName(purchase.user.name, index),
      verified: purchase.user.isVerified,
      pass: purchase.pass.name,
      amount: purchase.amountPaid || purchase.pass.price,
      color: purchase.pass.color,
      createdAt: purchase.createdAt,
    }));

    return NextResponse.json({ purchases: data.length ? data : fallback });
  } catch {
    return NextResponse.json({ purchases: fallback });
  }
}
