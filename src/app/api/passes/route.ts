import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const [allPasses, userPasses] = await Promise.all([
      prisma.pass.findMany({ where: { isActive: true }, orderBy: { price: "asc" } }),
      prisma.userPass.findMany({ where: { userId: auth.userId }, include: { pass: true }, orderBy: { createdAt: "desc" } }),
    ]);

    return NextResponse.json({ passes: allPasses, userPasses });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
