import crypto from "crypto";

// The merchant API base URL is fixed by GeniusPay's docs. We only honour an
// override if it actually looks like the merchant API path — otherwise a stale
// value (old domain, or the bare domain without /api/v1/merchant) makes the
// gateway return an HTML page instead of JSON ("Unexpected token '<'").
const CANONICAL_BASE_URL = "https://geniuspay.ci/api/v1/merchant";
const BASE_URL = (() => {
  const env = process.env.GENIUSPAY_BASE_URL?.trim().replace(/\/+$/, "");
  if (env && /\/api\/v\d+\/merchant$/.test(env)) return env;
  return CANONICAL_BASE_URL;
})();

export type GeniusPayMethod =
  | "wave"
  | "orange_money"
  | "mtn_money"
  | "moov_money"
  | "card"
  | "pawapay";

interface CreatePaymentParams {
  amount: number;
  description: string;
  reference: string;
  successUrl: string;
  errorUrl: string;
  paymentMethod?: GeniusPayMethod;
  phone?: string;
  customerName?: string;
  metadata?: Record<string, string>;
}

export async function createGeniusPayPayment(params: CreatePaymentParams) {
  const body: Record<string, unknown> = {
    amount: params.amount,
    description: params.description,
    success_url: params.successUrl,
    error_url: params.errorUrl,
    metadata: {
      ...params.metadata,
      external_reference: params.reference,
    },
  };

  if (params.paymentMethod) body.payment_method = params.paymentMethod;

  if (params.phone || params.customerName) {
    body.customer = {
      ...(params.customerName && { name: params.customerName }),
      ...(params.phone && { phone: params.phone }),
    };
  }

  const res = await fetch(`${BASE_URL}/payments`, {
    method: "POST",
    headers: {
      "X-API-Key": process.env.GENIUSPAY_API_KEY!,
      "X-API-Secret": process.env.GENIUSPAY_SECRET!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  // Read as text first so a non-JSON response (HTML error page, WAF challenge)
  // yields a legible error instead of "Unexpected token '<'".
  const text = await res.text();
  let json: {
    success?: boolean;
    error?: { message?: string; code?: string };
    data?: unknown;
  };
  try {
    json = JSON.parse(text);
  } catch {
    const snippet = text.slice(0, 100).replace(/\s+/g, " ").trim();
    throw new Error(
      `réponse non-JSON (HTTP ${res.status}) depuis ${BASE_URL}/payments — vérifiez l'URL et les clés. Début: ${snippet}`
    );
  }
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || `échec de l'initialisation (HTTP ${res.status})`);
  }
  return json.data as {
    id: number;
    reference: string;
    amount: number;
    status: string;
    payment_url?: string;
    checkout_url?: string;
    environment: string;
  };
}

export function verifyGeniusPayWebhook(
  rawBody: string,
  timestamp: string,
  signature: string
): boolean {
  const secret = process.env.GENIUSPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const data = `${timestamp}.${rawBody}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    return false;
  }
}
