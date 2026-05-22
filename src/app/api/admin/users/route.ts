import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";

    const where = search ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { email: { contains: search, mode: "insensitive" as const } }], role: "USER" as const } : { role: "USER" as const };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, phone: true, balance: true, totalInvested: true, totalEarnings: true, isActive: true, createdAt: true },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({ users, total, pages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const body = await req.json();

    if (typeof body.isActive === "boolean" && body.userId) {
      await prisma.user.update({ where: { id: body.userId }, data: { isActive: body.isActive } });
      return NextResponse.json({ success: true });
    }

    if (typeof body.balance === "number" && body.userId) {
      const prev = await prisma.user.findUnique({ where: { id: body.userId }, select: { balance: true } });
      const diff = body.balance - (prev?.balance ?? 0);
      await prisma.user.update({ where: { id: body.userId }, data: { balance: body.balance } });
      if (diff !== 0) {
        await prisma.transaction.create({
          data: { userId: body.userId, type: diff > 0 ? "REFERRAL_BONUS" : "WITHDRAWAL", amount: diff, description: "Ajustement de solde par admin", status: "SUCCESS" },
        });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
