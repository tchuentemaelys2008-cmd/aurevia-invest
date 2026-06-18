export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { rateLimit } from "@/lib/admin";
import { z } from "zod";
import { nanoid } from "nanoid";

const schema = z.object({
  name: z.string().min(2, "Nom trop court"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  password: z.string().min(8, "Mot de passe trop court"),
  referralCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Throttle mass account creation (per IP).
    const limited = rateLimit(req, "register", 6, 60_000);
    if (limited) return limited;

    const body = await req.json();
    const data = schema.parse(body);

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, ...(data.phone ? [{ phone: data.phone }] : [])] },
    });
    if (existing) return NextResponse.json({ error: "Email ou tÃ©lÃ©phone dÃ©jÃ  utilisÃ©" }, { status: 400 });

    let referredById: string | undefined;
    if (data.referralCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode: data.referralCode } });
      if (referrer) referredById = referrer.id;
    }

    const hashedPassword = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        referralCode: nanoid(8).toUpperCase(),
        referredById,
      },
    });

    // La commission parrainage (10%) sera versÃ©e au moment de l'achat du pass

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    const response = NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    response.cookies.set("auth-token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 604800 });
    return response;
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
