export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  dailyReturn: z.number().positive(),
  duration: z.number().int().positive(),
  description: z.string().optional(),
  color: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "ADMIN") return NextResponse.json({ error: "AccÃ¨s refusÃ©" }, { status: 403 });
    const body = await req.json();
    const data = schema.parse(body);
    const pass = await prisma.pass.create({ data });
    return NextResponse.json({ pass });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "ADMIN") return NextResponse.json({ error: "AccÃ¨s refusÃ©" }, { status: 403 });
    const { id, ...data } = await req.json();
    if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });
    const pass = await prisma.pass.update({ where: { id }, data });
    return NextResponse.json({ pass });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "ADMIN") return NextResponse.json({ error: "AccÃ¨s refusÃ©" }, { status: 403 });
    const { id } = await req.json();
    await prisma.pass.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
