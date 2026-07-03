export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const auth = await getAuthUser();
  if (!auth || !["ADMIN", "SUPER_ADMIN"].includes(auth.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const logs = await prisma.adminLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return NextResponse.json({ logs });
}
