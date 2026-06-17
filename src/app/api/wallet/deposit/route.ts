export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createGeniusPayPayment, type GeniusPayMethod } from "@/lib/geniuspay";
import { z } from "zod";
import { nanoid } from "nanoid";

const schema = z.object({
  amount: z.number().min(500, "Montant minimum: 500 FCFA").max(5000000),
  paymentMethod: z.enum(["FAPSHI", "GENIUSPAY", "GENIUSPAY_ORANGE", "GENIUSPAY_MTN", "GENIUSPAY_WAVE", "GENIUSPAY_MOOV", "CARD"]),
  phoneNumber: z.string().optional(),
  country: z.string().optional(),
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

    // At home, Orange/MTN go through Fapshi; elsewhere through GeniusPay.
    if (data.country === "CM" && (data.paymentMethod === "GENIUSPAY_ORANGE" || data.paymentMethod === "GENIUSPAY_MTN")) {
      data.paymentMethod = "FAPSHI";
    }

    const reference = `DEP-${nanoid(12).toUpperCase()}`;

    const envUrl = process.env.NEXT_PUBLIC_URL;
    const reqHost = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const reqProto = req.headers.get("x-forwarded-proto") || (reqHost?.includes("localhost") ? "http" : "https");
    const baseUrl =
      envUrl && envUrl.startsWith("http") && !envUrl.includes("localhost")
        ? envUrl
        : reqHost ? `${reqProto}://${reqHost}` : envUrl || "http://localhost:3000";

    // A deposit is a Payment with the "DEPOSIT" sentinel passId and kind in
    // metadata, so the webhook credits the balance instead of activating a pass.
    await prisma.payment.create({
      data: {
        userId: auth.userId,
        passId: "DEPOSIT",
        amount: data.amount,
        provider: data.paymentMethod,
        reference,
        status: "PENDING",
        metadata: { kind: "DEPOSIT", phoneNumber: data.phoneNumber },
      },
    });

    let paymentUrl = "";

    if (data.paymentMethod === "FAPSHI") {
      if (process.env.FAPSHI_USER && process.env.FAPSHI_KEY && process.env.NODE_ENV === "production") {
        const fapshiRes = await fetch(`${process.env.FAPSHI_BASE_URL}/initiate-pay`, {
          method: "POST",
          headers: { apiuser: process.env.FAPSHI_USER, apikey: process.env.FAPSHI_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: data.amount,
            email: auth.email,
            redirectUrl: `${baseUrl}/dashboard?deposit=${reference}`,
            externalId: reference,
            message: `Recharge solde — Aurevia Invest`,
          }),
        });
        const fapshiData = await fapshiRes.json();
        if (fapshiData.link) paymentUrl = fapshiData.link;
        else {
          await prisma.payment.delete({ where: { reference } }).catch(() => {});
          return NextResponse.json({ error: "Erreur FAPSHI: " + (fapshiData.message || "inconnue") }, { status: 502 });
        }
      } else {
        paymentUrl = `/payment/simulate?ref=${reference}&method=fapshi&amount=${data.amount}`;
      }
    } else {
      // GeniusPay (generic or specific method)
      if ((process.env.GENIUSPAY_API_KEY && process.env.GENIUSPAY_SECRET || process.env.PAYMENT_SERVICE_URL) && process.env.NODE_ENV === "production") {
        const gpMethod = GENIUSPAY_METHOD_MAP[data.paymentMethod] as GeniusPayMethod | undefined;
        try {
          const gpData = await createGeniusPayPayment({
            amount: data.amount,
            description: `Recharge solde — Aurevia Invest`,
            reference,
            successUrl: `${baseUrl}/dashboard?deposit=${reference}&status=success`,
            errorUrl: `${baseUrl}/dashboard?deposit=${reference}&status=error`,
            paymentMethod: gpMethod,
            phone: data.phoneNumber,
            metadata: { kind: "deposit" },
          });
          paymentUrl = gpData.checkout_url || gpData.payment_url || "";
        } catch (e) {
          await prisma.payment.delete({ where: { reference } }).catch(() => {});
          const msg = e instanceof Error ? e.message : "échec de l'initialisation";
          return NextResponse.json({ error: "GeniusPay: " + msg }, { status: 502 });
        }
        if (!paymentUrl) {
          await prisma.payment.delete({ where: { reference } }).catch(() => {});
          return NextResponse.json({ error: "GeniusPay n'a pas renvoyé d'URL de paiement." }, { status: 502 });
        }
      } else {
        paymentUrl = `/payment/simulate?ref=${reference}&method=geniuspay&amount=${data.amount}`;
      }
    }

    return NextResponse.json({ success: true, reference, paymentUrl });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    console.error("Deposit error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
