# Aurevia — payment-service (relais GeniusPay sur Railway)

GeniusPay (`geniuspay.ci`) est derrière Cloudflare, qui **bloque les IPs des
datacenters Vercel** avec un challenge 403 « Just a moment… ». Résultat : en prod
sur Vercel, l'appel serveur → GeniusPay échoue (502).

Ce micro-service tourne sur **Railway**, dont les IPs passent proprement. Le front
Aurevia (sur Vercel) lui envoie les paramètres de paiement ; le service appelle
GeniusPay depuis sa propre IP et renvoie la réponse.

```
Vercel (front + API + DB)                Railway (ce service)
  POST /api/passes/buy
        │  createGeniusPayPayment()
        ▼
  POST {PAYMENT_SERVICE_URL}/create-payment  ──────▶  POST geniuspay.ci/.../payments
        ◀──────────── { success, data } ────────────         (IP propre, OK)

Webhook GeniusPay → Vercel (entrant, inchangé)
```

Seul l'appel **sortant** de création de paiement passe par Railway. Le webhook,
la base de données, l'auth et tout le reste restent sur Vercel.

---

## Déploiement sur Railway

1. **New Project → Deploy from GitHub repo** → choisir ce dépôt
   (`aurevia-invest`).
2. Dans les **Settings** du service Railway :
   - **Root Directory** : `payment-service`
   - **Start Command** : `npm start` (détecté automatiquement)
3. Onglet **Variables**, ajouter :

   | Variable | Valeur |
   |---|---|
   | `PAYMENT_SERVICE_TOKEN` | un secret aléatoire (`openssl rand -base64 32`) |
   | `GENIUSPAY_API_KEY` | `pk_live_…` |
   | `GENIUSPAY_SECRET` | `sk_live_…` |
   | `GENIUSPAY_BASE_URL` | *(optionnel)* `https://geniuspay.ci/api/v1/merchant` |

   ⚠️ Ne pas définir `PORT` : Railway le fournit automatiquement.
4. Déployer, puis récupérer l'URL publique du service
   (ex. `https://aurevia-payment-service.up.railway.app`).
   Vérifier la santé : `GET <url>/health` doit renvoyer `{"ok":true,...}`.

## Côté Vercel (front Aurevia)

Ajouter ces deux variables (Settings → Environment Variables) :

| Variable | Valeur |
|---|---|
| `PAYMENT_SERVICE_URL` | l'URL Railway ci-dessus (sans `/` final) |
| `PAYMENT_SERVICE_TOKEN` | **exactement le même** secret que sur Railway |

Redéployer Vercel. À partir de là, dès que `PAYMENT_SERVICE_URL` est présent,
`src/lib/geniuspay.ts` route la création de paiement via Railway. Si la variable
est absente (local), il retombe sur l'appel direct / le mode simulate.

> Les clés GeniusPay `sk_live_` peuvent être **retirées de Vercel** une fois le
> relais en place : elles ne sont plus nécessaires que sur Railway. Le webhook
> sur Vercel n'utilise que `GENIUSPAY_WEBHOOK_SECRET`, qui reste sur Vercel.

## Test rapide

```bash
curl -X POST "$PAYMENT_SERVICE_URL/create-payment" \
  -H "Authorization: Bearer $PAYMENT_SERVICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":100,"description":"test","reference":"AUR-TEST-1","successUrl":"https://aurevia-invest.vercel.app/dashboard","errorUrl":"https://aurevia-invest.vercel.app/passes","paymentMethod":"wave"}'
```

Réponse attendue : `{"success":true,"data":{...,"checkout_url":"https://..."}}`.

## Développement local

```bash
cd payment-service
npm install
cp .env.example .env   # remplir les valeurs
npm start              # écoute sur http://localhost:3001
```
