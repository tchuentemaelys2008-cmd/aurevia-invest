import crypto from "crypto";
import axios, { type AxiosProxyConfig } from "axios";

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

// GeniusPay is behind Cloudflare, which blocks Vercel's datacenter IPs with a
// "Just a moment..." challenge. Routing the request through an outbound proxy
// with a clean/whitelisted IP gets around it. Set GENIUSPAY_PROXY_URL (or the
// standard HTTPS_PROXY) to e.g. http://user:pass@host:port to enable it.
// When unset, requests go out directly (current behaviour).
function getProxyConfig(): AxiosProxyConfig | false {
  const raw =
    process.env.GENIUSPAY_PROXY_URL ||
    process.env.HTTPS_PROXY ||
    process.env.https_proxy;
  if (!raw) return false;
  try {
    const u = new URL(raw);
    return {
      protocol: u.protocol.replace(":", ""),
      host: u.hostname,
      port: u.port ? parseInt(u.port, 10) : u.protocol === "https:" ? 443 : 80,
      ...(u.username && {
        auth: {
          username: decodeURIComponent(u.username),
          password: decodeURIComponent(u.password),
        },
      }),
    };
  } catch {
    return false;
  }
}

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

  // Use axios (Node http stack) so we can route through an outbound proxy when
  // configured. validateStatus lets us read the body on any status code.
  const res = await axios.post(`${BASE_URL}/payments`, body, {
    timeout: 25000,
    proxy: getProxyConfig(),
    validateStatus: () => true,
    responseType: "text",
    transformResponse: [(d) => d], // keep raw text, we parse ourselves
    headers: {
      "X-API-Key": process.env.GENIUSPAY_API_KEY!,
      "X-API-Secret": process.env.GENIUSPAY_SECRET!,
      "Content-Type": "application/json",
      // Browser-like headers help clear a basic Cloudflare Bot Fight Mode.
      Accept: "application/json",
      "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    },
  });

  const status = res.status;
  const text = typeof res.data === "string" ? res.data : JSON.stringify(res.data);

  // Parse the body ourselves so a non-JSON response (Cloudflare HTML challenge)
  // yields a legible error instead of "Unexpected token '<'".
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
      `réponse non-JSON (HTTP ${status}) depuis ${BASE_URL}/payments — Cloudflare bloque probablement la requête. Début: ${snippet}`
    );
  }
  if (status < 200 || status >= 300 || !json.success) {
    throw new Error(json.error?.message || `échec de l'initialisation (HTTP ${status})`);
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
