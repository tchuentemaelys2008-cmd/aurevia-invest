export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signToken } from "@/lib/auth";
import { rateLimit } from "@/lib/admin";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    // Throttle credential stuffing / brute force (per IP).
    const limited = rateLimit(req, "login", 10, 60_000);
    if (limited) return limited;

    const body = await req.json();
    const data = schema.parse(body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !(await comparePassword(data.password, user.password))) {
      return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 });
    }
    if (!user.isActive || user.isSuspended) return NextResponse.json({ error: "Compte dÃ©sactivÃ© ou suspendu" }, { status: 403 });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    const response = NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    response.cookies.set("auth-token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 604800 });
    return response;
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
