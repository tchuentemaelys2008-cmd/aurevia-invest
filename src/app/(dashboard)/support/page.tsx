"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { LifeBuoy, Send, MessageSquare, CheckCircle2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import WhatsAppChannelCard from "@/components/ui/WhatsAppChannelCard";
import { useLanguage } from "@/lib/i18n";
import toast from "react-hot-toast";

export default function SupportPage() {
  const { lang } = useLanguage();
  const fr = lang === "fr";
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState(fr ? "Général" : "General");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const categories = fr
    ? ["Général", "Paiement / Dépôt", "Retrait", "Compte", "Pass / Investissement", "Autre"]
    : ["General", "Payment / Deposit", "Withdrawal", "Account", "Pass / Investment", "Other"];

  const submit = async () => {
    if (subject.trim().length < 3) { toast.error(fr ? "Sujet trop court" : "Subject too short"); return; }
    if (message.trim().length < 5) { toast.error(fr ? "Message trop court" : "Message too short"); return; }
    setSending(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message, category }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error || "Erreur"); return; }
      setDone(true);
      setSubject("");
      setMessage("");
    } catch {
      toast.error("Erreur");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 pt-8 pb-10 space-y-5">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-white/40 text-xs mb-0.5">{fr ? "Aide & assistance" : "Help & support"}</p>
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <LifeBuoy size={22} className="text-[#e23744]" /> {fr ? "Support" : "Support"}
        </h1>
        <p className="text-sm text-white/50 mt-1">
          {fr
            ? "Ouvrez un ticket : notre équipe d'administration le reçoit immédiatement et vous répond."
            : "Open a ticket: our admin team receives it instantly and gets back to you."}
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <WhatsAppChannelCard />
      </motion.div>

      {done ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="text-center py-10 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-emerald-400/10 flex items-center justify-center mx-auto">
              <CheckCircle2 size={30} className="text-emerald-400" />
            </div>
            <h2 className="font-display font-bold text-white text-lg">{fr ? "Ticket envoyé !" : "Ticket sent!"}</h2>
            <p className="text-sm text-white/55 max-w-xs mx-auto">
              {fr
                ? "Votre demande a été transmise à l'équipe. Suivez la réponse dans vos notifications."
                : "Your request was sent to the team. Watch your notifications for the reply."}
            </p>
            <div className="pt-2">
              <Button variant="secondary" size="sm" onClick={() => setDone(false)}>
                {fr ? "Nouveau ticket" : "New ticket"}
              </Button>
            </div>
          </Card>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white/70 mb-1.5 block">{fr ? "Catégorie" : "Category"}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#e23744]/50"
              >
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <Input
              label={fr ? "Sujet" : "Subject"}
              placeholder={fr ? "Résumé de votre demande" : "Summary of your request"}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={120}
            />

            <div>
              <label className="text-sm font-medium text-white/70 mb-1.5 block flex items-center gap-1.5">
                <MessageSquare size={14} /> {fr ? "Message" : "Message"}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                maxLength={2000}
                placeholder={fr ? "Décrivez votre problème ou votre question en détail…" : "Describe your issue or question in detail…"}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#e23744]/50 resize-none"
              />
              <p className="text-[11px] text-white/30 mt-1 text-right">{message.length}/2000</p>
            </div>

            <Button variant="primary" size="lg" className="w-full" loading={sending} onClick={submit}>
              <Send size={16} /> {fr ? "Envoyer le ticket" : "Send ticket"}
            </Button>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
