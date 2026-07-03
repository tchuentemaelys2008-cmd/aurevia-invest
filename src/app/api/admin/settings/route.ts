export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth || !["ADMIN", "SUPER_ADMIN"].includes(auth.role)) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
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
    if (!auth || !["ADMIN", "SUPER_ADMIN"].includes(auth.role)) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    const body: Record<string, unknown> = await req.json();
    const entries = Object.entries(body);
    if (entries.length > 50) return NextResponse.json({ error: "Trop de clés" }, { status: 400 });
    for (const [key, value] of entries) {
      if (!/^[a-zA-Z0-9_.-]{1,64}$/.test(key) || typeof value !== "string" || value.length > 2000) {
        return NextResponse.json({ error: `Clé ou valeur invalide: ${key}` }, { status: 400 });
      }
      await prisma.settings.upsert({ where: { key }, update: { value }, create: { key, value } });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
