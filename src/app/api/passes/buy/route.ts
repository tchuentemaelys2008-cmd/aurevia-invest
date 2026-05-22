import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createGeniusPayPayment, type GeniusPayMethod } from "@/lib/geniuspay";
import { z } from "zod";
import { nanoid } from "nanoid";

const schema = z.object({
  passId: z.string(),
  paymentMethod: z.enum([
    "FAPSHI",
    "GENIUSPAY",
    "GENIUSPAY_ORANGE",
    "GENIUSPAY_MTN",
    "GENIUSPAY_WAVE",
    "GENIUSPAY_MOOV",
    "CARD",
  ]),
  phoneNumber: z.string().optional(),
});

const GENIUSPAY_METHOD_MAP: Record<string, GeniusPayMethod> = {
  GENIUSPAY_ORANGE: "orange_money",
  GENIUSPAY_MTN: "mtn_money",
  GENIUSPAY_WAVE: "wave",
  GENIUSPAY_MOOV: "moov_money",
  CARD: "card",
};

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const body = await req.json();
    const data = schema.parse(body);

    const pass = await prisma.pass.findUnique({ where: { id: data.passId } });
    if (!pass) return NextResponse.json({ error: "Pass introuvable" }, { status: 404 });

    const reference = `AUR-${nanoid(12).toUpperCase()}`;
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

    const payment = await prisma.payment.create({
      data: {
        userId: auth.userId,
        passId: data.passId,
        amount: pass.price,
        provider: data.paymentMethod,
        reference,
        status: "PENDING",
        metadata: { phoneNumber: data.phoneNumber },
      },
    });

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + pass.duration);

    await prisma.userPass.create({
      data: {
        userId: auth.userId,
        passId: data.passId,
        status: "PENDING",
        startDate,
        endDate,
        amountPaid: pass.price,
        paymentRef: reference,
      },
    });

    let paymentUrl = "";

    if (data.paymentMethod === "FAPSHI") {
      if (
        process.env.FAPSHI_USER &&
        process.env.FAPSHI_KEY &&
        process.env.NODE_ENV === "production"
      ) {
        const fapshiRes = await fetch(`${process.env.FAPSHI_BASE_URL}/initiate-pay`, {
          method: "POST",
          headers: {
            apiuser: process.env.FAPSHI_USER,
            apikey: process.env.FAPSHI_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: pass.price,
            email: auth.email,
            redirectUrl: `${baseUrl}/dashboard?payment=${reference}`,
            externalId: reference,
            message: `Achat Pass ${pass.name} — Aurevia Invest`,
          }),
        });
        const fapshiData = await fapshiRes.json();
        if (fapshiData.link) {
          paymentUrl = fapshiData.link;
        } else {
          await prisma.payment.delete({ where: { reference } });
          await prisma.userPass.deleteMany({ where: { paymentRef: reference } });
          return NextResponse.json({ error: "Erreur FAPSHI: " + (fapshiData.message || "inconnue") }, { status: 502 });
        }
      } else {
        // Sandbox / dev mode
        paymentUrl = `/payment/simulate?ref=${reference}&method=fapshi&amount=${pass.price}`;
      }
    } else if (data.paymentMethod === "GENIUSPAY" || data.paymentMethod in GENIUSPAY_METHOD_MAP) {
      if (
        process.env.GENIUSPAY_API_KEY &&
        process.env.GENIUSPAY_SECRET &&
        process.env.NODE_ENV === "production"
      ) {
        const gpMethod = GENIUSPAY_METHOD_MAP[data.paymentMethod] as GeniusPayMethod | undefined;
        const gpData = await createGeniusPayPayment({
          amount: pass.price,
          description: `Achat Pass ${pass.name} — Aurevia Invest`,
          reference,
          successUrl: `${baseUrl}/dashboard?payment=${reference}&status=success`,
          errorUrl: `${baseUrl}/passes?payment=${reference}&status=error`,
          paymentMethod: gpMethod,
          phone: data.phoneNumber,
          metadata: { pass_name: pass.name, pass_id: pass.id },
        });

        paymentUrl = gpData.checkout_url || gpData.payment_url || `/payment/simulate?ref=${reference}&method=geniuspay&amount=${pass.price}`;
      } else {
        // Sandbox / dev mode
        const methodLabel =
          data.paymentMethod === "GENIUSPAY_ORANGE" ? "orange" :
          data.paymentMethod === "GENIUSPAY_MTN" ? "mtn" :
          data.paymentMethod === "GENIUSPAY_WAVE" ? "wave" :
          "geniuspay";
        paymentUrl = `/payment/simulate?ref=${reference}&method=${methodLabel}&amount=${pass.price}`;
      }
    }

    return NextResponse.json({ success: true, reference, paymentUrl, paymentId: payment.id });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
