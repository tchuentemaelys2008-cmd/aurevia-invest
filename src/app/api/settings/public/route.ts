export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PUBLIC_KEYS = ["whatsapp_link", "telegram_link", "whatsapp_group_link"];

export async function GET() {
  try {
    const rows = await prisma.settings.findMany({ where: { key: { in: PUBLIC_KEYS } } });
    const settings: Record<string, string> = {};
    for (const r of rows) settings[r.key] = r.value;
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ settings: {} });
  }
}
