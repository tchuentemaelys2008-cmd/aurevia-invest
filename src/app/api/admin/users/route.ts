export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAdminAction, rateLimit, requireAdmin } from "@/lib/admin";

export async function GET(req: NextRequest) {
  try {
    const limited = rateLimit(req, "admin-users", 120);
    if (limited) return limited;
    const auth = await requireAdmin();
    if (!auth) return NextResponse.json({ error: "AccÃ¨s refusÃ©" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";

    const where = search
      ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { email: { contains: search, mode: "insensitive" as const } }], role: "USER" as const }
      : { role: "USER" as const };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          balance: true,
          totalInvested: true,
          totalEarnings: true,
          isActive: true,
          isSuspended: true,
          isVerified: true,
          lastActive: true,
          createdAt: true,
        },
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
    const limited = rateLimit(req, "admin-users-write", 40);
    if (limited) return limited;
    const auth = await requireAdmin();
    if (!auth) return NextResponse.json({ error: "AccÃ¨s refusÃ©" }, { status: 403 });

    const body = await req.json();

    if (typeof body.isActive === "boolean" && body.userId) {
      await prisma.user.update({ where: { id: body.userId }, data: { isActive: body.isActive } });
      await logAdminAction(auth, body.isActive ? "USER_UNBAN" : "USER_BAN", body.userId, { isActive: body.isActive }, req);
      return NextResponse.json({ success: true });
    }

    if (typeof body.isSuspended === "boolean" && body.userId) {
      await prisma.user.update({ where: { id: body.userId }, data: { isSuspended: body.isSuspended } });
      await logAdminAction(auth, body.isSuspended ? "USER_SUSPEND" : "USER_UNSUSPEND", body.userId, { isSuspended: body.isSuspended }, req);
      return NextResponse.json({ success: true });
    }

    if (typeof body.isVerified === "boolean" && body.userId) {
      await prisma.user.update({ where: { id: body.userId }, data: { isVerified: body.isVerified } });
      await logAdminAction(auth, body.isVerified ? "USER_VERIFY" : "USER_UNVERIFY", body.userId, { isVerified: body.isVerified }, req);
      return NextResponse.json({ success: true });
    }

    if (typeof body.balance === "number" && body.userId) {
      const prev = await prisma.user.findUnique({ where: { id: body.userId }, select: { balance: true } });
      const diff = body.balance - (prev?.balance ?? 0);
      await prisma.user.update({ where: { id: body.userId }, data: { balance: body.balance } });
      if (diff !== 0) {
        await prisma.transaction.create({
          data: {
            userId: body.userId,
            type: diff > 0 ? "REFERRAL_BONUS" : "WITHDRAWAL",
            amount: diff,
            description: "Ajustement de solde par admin",
            status: "SUCCESS",
          },
        });
      }
      await logAdminAction(auth, "USER_BALANCE_ADJUST", body.userId, { balance: body.balance, diff }, req);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "ParamÃ¨tres invalides" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
