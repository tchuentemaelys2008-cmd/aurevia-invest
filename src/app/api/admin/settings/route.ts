import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    const rows = await prisma.settings.findMany();
    const settings: Record<string, string> = {};
    for (const r of rows) settings[r.key] = r.value;
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    const body: Record<string, string> = await req.json();
    for (const [key, value] of Object.entries(body)) {
      await prisma.settings.upsert({ where: { key }, update: { value }, create: { key, value } });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
