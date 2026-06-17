export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  subject: z.string().min(3).max(120),
  message: z.string().min(5).max(2000),
  category: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const body = await req.json();
    const { subject, message, category } = schema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { name: true, email: true, isVerified: true },
    });
    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

    // No dedicated Ticket table: a ticket is delivered to every admin as a
    // notification. Verified users are flagged as priority.
    const admins = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN", "MODERATOR"] } },
      select: { id: true },
    });

    const priority = user.isVerified ? "⭐ PRIORITAIRE " : "";
    const cat = category ? `[${category}] ` : "";
    const adminTitle = `🎫 ${priority}Ticket: ${cat}${subject}`;
    const adminMessage = `De ${user.name} (${user.email})\n\n${message}`;

    if (admins.length) {
      await prisma.notification.createMany({
        data: admins.map((a) => ({
          userId: a.id,
          title: adminTitle,
          message: adminMessage,
          type: "ticket",
        })),
      });
    }

    // Log + confirm to the user.
    await prisma.adminLog.create({
      data: {
        adminId: auth.userId,
        adminEmail: user.email,
        adminRole: "USER",
        action: "SUPPORT_TICKET",
        target: subject,
        details: { category: category || null, priority: user.isVerified },
      },
    }).catch(() => {});

    await prisma.notification.create({
      data: {
        userId: auth.userId,
        title: "Ticket envoyé ✅",
        message: `Votre demande « ${subject} » a bien été transmise à notre équipe. Nous vous répondrons rapidement.`,
        type: "success",
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    console.error("Support ticket error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
