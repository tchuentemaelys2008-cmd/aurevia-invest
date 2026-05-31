export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const auth = await getAuthUser();
  if (!auth || !["ADMIN", "SUPER_ADMIN"].includes(auth.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  // Bulk-update every pass that still has duration=120 → 90
  const { count } = await prisma.pass.updateMany({
    where: { duration: 120 },
    data: { duration: 90 },
  });

  // Ensure Aurevia 2000 exists
  const exists2000 = await prisma.pass.findFirst({ where: { name: "Aurevia 2000" } });
  let created = 0;
  if (!exists2000) {
    await prisma.pass.create({
      data: {
        id: "aurevia-2000",
        name: "Aurevia 2000",
        price: 2000,
        dailyReturn: 6,
        duration: 90,
        color: "#5b6ef5",
        icon: "zap",
        description: "Decouvrez Aurevia avec un mini-depot et gagnez des la premiere semaine.",
        isActive: true,
      },
    });
    created = 1;
  }

  return NextResponse.json({
    success: true,
    updated: count,
    created,
    message: `${count} passes mis à jour (120→90j)${created ? ", Aurevia 2000 créé" : ""}.`,
  });
}
