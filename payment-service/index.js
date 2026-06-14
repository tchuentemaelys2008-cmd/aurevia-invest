import express from "express";
import axios from "axios";

// ───────────────────────────────────────────────────────────────────────────
// Aurevia — Micro-service relais GeniusPay
//
// GeniusPay (geniuspay.ci) est derriere Cloudflare, qui bloque les IPs des
// datacenters Vercel avec un challenge 403 "Just a moment...". Ce service tourne
// sur Railway, dont les IPs passent proprement. Le front Aurevia (sur Vercel)
// envoie ici les parametres de paiement ; ce service construit le corps attendu
// par GeniusPay, ajoute les cles marchandes (qui ne vivent QUE sur Railway),
// appelle GeniusPay et renvoie la reponse.
//
// Le webhook GeniusPay (entrant) reste gere par Vercel et n'est pas concerne.
// ───────────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;

// Cle partagee : seul le front Aurevia (qui connait ce jeton) peut declencher un
// paiement. Empeche n'importe qui de poster sur l'URL publique du service.
const SERVICE_TOKEN = process.env.PAYMENT_SERVICE_TOKEN || "";

// L'URL de l'API marchande est figee par la doc GeniusPay. On n'honore un
// override que s'il ressemble vraiment au chemin /api/vN/merchant, sinon une
// vieille valeur renverrait du HTML au lieu du JSON.
const CANONICAL_BASE_URL = "https://geniuspay.ci/api/v1/merchant";
const BASE_URL = (() => {
  const env = (process.env.GENIUSPAY_BASE_URL || "").trim().replace(/\/+$/, "");
  if (env && /\/api\/v\d+\/merchant$/.test(env)) return env;
  return CANONICAL_BASE_URL;
})();

const app = express();
app.use(express.json({ limit: "256kb" }));

// Sonde de sante pour Railway.
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "aurevia-payment-service" });
});

app.post("/create-payment", async (req, res) => {
  // 1) Authentification par jeton partage.
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!SERVICE_TOKEN || token !== SERVICE_TOKEN) {
    return res.status(401).json({ success: false, error: "Non autorise" });
  }

  // 2) Cles marchandes presentes ?
  if (!process.env.GENIUSPAY_API_KEY || !process.env.GENIUSPAY_SECRET) {
    return res.status(500).json({
      success: false,
      error: "Cles GeniusPay absentes sur le service de paiement.",
    });
  }

  const p = req.body || {};
  if (typeof p.amount !== "number" || !p.description || !p.reference) {
    return res
      .status(400)
      .json({ success: false, error: "Parametres de paiement invalides." });
  }

  // 3) Corps attendu par GeniusPay (identique a l'ancienne logique cote Vercel).
  const body = {
    amount: p.amount,
    description: p.description,
    success_url: p.successUrl,
    error_url: p.errorUrl,
    metadata: {
      ...(p.metadata || {}),
      external_reference: p.reference,
    },
  };
  if (p.paymentMethod) body.payment_method = p.paymentMethod;
  if (p.phone || p.customerName) {
    body.customer = {
      ...(p.customerName && { name: p.customerName }),
      ...(p.phone && { phone: p.phone }),
    };
  }

  try {
    const gp = await axios.post(`${BASE_URL}/payments`, body, {
      timeout: 25000,
      validateStatus: () => true,
      responseType: "text",
      transformResponse: [(d) => d],
      headers: {
        "X-API-Key": process.env.GENIUSPAY_API_KEY,
        "X-API-Secret": process.env.GENIUSPAY_SECRET,
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
    });

    const status = gp.status;
    const text =
      typeof gp.data === "string" ? gp.data : JSON.stringify(gp.data);

    let json;
    try {
      json = JSON.parse(text);
    } catch {
      // Reponse non-JSON = challenge Cloudflare. On remonte le Ray ID au cas ou
      // (ne devrait plus arriver depuis une IP Railway, mais on garde la trace).
      const cfRay = gp.headers["cf-ray"];
      console.error("GeniusPay non-JSON response:", {
        status,
        cfRay,
        server: gp.headers["server"],
        snippet: text.slice(0, 120).replace(/\s+/g, " ").trim(),
      });
      return res.status(502).json({
        success: false,
        error:
          `GeniusPay a renvoye une reponse non-JSON (HTTP ${status})` +
          (cfRay ? ` — Ray ID Cloudflare: ${cfRay}` : "") +
          ".",
      });
    }

    if (status < 200 || status >= 300 || !json.success) {
      return res.status(status >= 400 ? status : 502).json({
        success: false,
        error:
          (json.error && json.error.message) ||
          `echec de l'initialisation (HTTP ${status})`,
      });
    }

    return res.json({ success: true, data: json.data });
  } catch (err) {
    console.error("Payment service error:", err?.message || err);
    return res
      .status(502)
      .json({ success: false, error: "Service de paiement indisponible." });
  }
});

app.listen(PORT, () => {
  console.log(`Aurevia payment-service ecoute sur le port ${PORT}`);
});
