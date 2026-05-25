export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const fallback = [
  { id: "demo-1", user: "Camille D.", pass: "Aurevia Gold", amount: 50000, createdAt: new Date().toISOString() },
  { id: "demo-2", user: "Noah K.", pass: "Aurevia Silver", amount: 25000, createdAt: new Date().toISOString() },
  { id: "demo-3", user: "Aminata S.", pass: "Aurevia VIP", amount: 100000, createdAt: new Date().toISOString() },
  { id: "demo-4", user: "Hugo M.", pass: "Aurevia Boost", amount: 8000, createdAt: new Date().toISOString() },
];

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

    const data = purchases.map((purchase) => ({
      id: purchase.id,
      user: purchase.user.name,
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
