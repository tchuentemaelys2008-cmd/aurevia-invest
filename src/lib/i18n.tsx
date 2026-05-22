"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "fr" | "en";

const translations = {
  fr: {
    // Nav
    nav_home: "Accueil", nav_passes: "Passes", nav_tasks: "Tâches",
    nav_affiliate: "Affiliation", nav_portfolio: "Portfolio", nav_wallet: "Wallet",
    nav_notifications: "Alertes", nav_admin: "Panneau Admin", nav_logout: "Déconnexion", nav_exit: "Sortir",

    // Dashboard
    dash_greeting: "Bienvenue,", dash_balance: "Solde total", dash_invested: "Total investi",
    dash_earned: "Total gagné", dash_since_start: "depuis le début", dash_7days: "7 derniers jours",
    dash_my_passes: "Mes Passes", dash_see_all: "Voir tout", dash_no_pass: "Aucun Pass actif",
    dash_discover: "Découvrir les Passes", dash_buy_pass: "Acheter un Pass", dash_daily_task: "Tâche du jour",
    dash_activity: "Activité récente", dash_no_activity: "Aucune activité", dash_per_day: "/ jour",
    dash_expires: "Expire:",

    // Auth
    auth_login_title: "Connexion", auth_login_sub: "Accédez à votre compte",
    auth_email: "Email ou numéro de téléphone", auth_password: "Mot de passe",
    auth_forgot: "Mot de passe oublié ?", auth_submit_login: "Se connecter",
    auth_no_account: "Pas encore de compte ?", auth_signup: "S'inscrire",
    auth_or: "ou continuer avec",
    auth_register_title: "S'inscrire", auth_register_sub: "Créez votre compte",
    auth_name: "Nom complet", auth_phone: "Numéro de téléphone",
    auth_confirm_password: "Confirmer le mot de passe", auth_referral: "Code de parrainage (optionnel)",
    auth_referral_applied: "Code parrainage appliqué",
    auth_terms: "J'accepte les", auth_terms_link: "Conditions d'utilisation",
    auth_privacy: "Politique de confidentialité", auth_and: "et la",
    auth_submit_register: "Créer un compte", auth_have_account: "Déjà un compte ?",
    auth_login_link: "Se connecter",
    auth_forgot_title: "Mot de passe oublié", auth_forgot_sub: "Réinitialisez votre mot de passe",
    auth_forgot_label: "Adresse email", auth_forgot_btn: "Envoyer le lien",
    auth_forgot_sent_title: "Email envoyé", auth_forgot_back: "Retour à la connexion",
    auth_reset_sub: "Entrez votre email pour recevoir un lien de réinitialisation.",

    // Passes
    passes_title: "Sélection des Passes", passes_sub: "Choisissez le pass qui correspond à vos objectifs d'investissement.",
    passes_investments: "Investissements", passes_buy: "Acheter maintenant", passes_owned: "✓ Actif",
    passes_popular: "POPULAIRE", passes_return: "de retour / jour", passes_duration: "Durée:",
    passes_total_gain: "Gain total:", passes_days: "jours", passes_my_passes: "Mes Passes actifs",
    passes_modal_title: "Achat de Pass", passes_payment: "Méthode de paiement",
    passes_confirm: "Confirmer —", passes_terms: "En cliquant sur confirmer, vous acceptez les Conditions d'utilisation",
    passes_phone_placeholder: "Numéro de téléphone (ex: +225 07 00 00 00 00)",
    passes_active: "Actif", passes_pending: "En attente", passes_expired: "Expiré",

    // Wallet
    wallet_title: "Mon Wallet", wallet_finances: "Finances", wallet_balance: "Solde disponible",
    wallet_invested: "Total investi", wallet_earned: "Total gagné", wallet_withdraw_btn: "Demander un retrait",
    wallet_no_pass_msg: "Achetez un pass pour débloquer les retraits",
    wallet_history: "Historique", wallet_no_tx: "Aucune transaction",
    wallet_modal_title: "Demande de retrait", wallet_amount_label: "Montant (min. 2000 FCFA)",
    wallet_method_label: "Méthode", wallet_account_label: "Numéro / Informations du compte",
    wallet_account_placeholder: "Ex: 6XX XXX XXX", wallet_submit: "Soumettre la demande",
    tx_PASS_PURCHASE: "Achat de Pass", tx_DAILY_EARNING: "Revenu journalier",
    tx_TASK_REWARD: "Récompense tâche", tx_AFFILIATE_COMMISSION: "Commission affiliation",
    tx_WITHDRAWAL: "Retrait", tx_REFERRAL_BONUS: "Bonus parrainage",

    // Tasks
    tasks_title: "Tâches journalières", tasks_sub: "Complétez les tâches pour gagner des récompenses.",
    tasks_done: "Terminé", tasks_do: "Effectuer",

    // Portfolio
    portfolio_title: "Mon Portfolio", portfolio_sub: "Suivi de vos investissements actifs.",
    portfolio_no_pass: "Aucun investissement actif", portfolio_buy: "Acheter un Pass",

    // Affiliate
    affiliate_title: "Programme d'Affiliation", affiliate_sub: "Invitez des amis et gagnez des commissions.",
    affiliate_link: "Votre lien de parrainage", affiliate_copy: "Copié !",
    affiliate_commission: "Commission: 10% sur chaque achat de pass",
    affiliate_share: "Partager mon lien",

    // Notifications
    notif_title: "Notifications", notif_empty: "Aucune notification",
    notif_empty_sub: "Vos notifications apparaîtront ici",

    // Payment simulate
    pay_pending: "En attente de paiement", pay_processing: "Traitement en cours...",
    pay_success: "Paiement confirmé !", pay_success_sub: "Votre pass a été activé. Redirection...",
    pay_failed: "Paiement échoué", pay_failed_sub: "Le paiement n'a pas pu être traité.",
    pay_retry: "Réessayer", pay_sim_success: "Simuler paiement réussi", pay_sim_fail: "Simuler échec",
    pay_sim_note: "Mode simulation — Remplacer par vraie API en production",
    pay_amount: "Montant à payer",
  },
  en: {
    // Nav
    nav_home: "Home", nav_passes: "Passes", nav_tasks: "Tasks",
    nav_affiliate: "Affiliate", nav_portfolio: "Portfolio", nav_wallet: "Wallet",
    nav_notifications: "Alerts", nav_admin: "Admin Panel", nav_logout: "Logout", nav_exit: "Exit",

    // Dashboard
    dash_greeting: "Welcome,", dash_balance: "Total Balance", dash_invested: "Total Invested",
    dash_earned: "Total Earned", dash_since_start: "since the beginning", dash_7days: "Last 7 days",
    dash_my_passes: "My Passes", dash_see_all: "See all", dash_no_pass: "No active Pass",
    dash_discover: "Discover Passes", dash_buy_pass: "Buy a Pass", dash_daily_task: "Daily Task",
    dash_activity: "Recent Activity", dash_no_activity: "No activity yet", dash_per_day: "/ day",
    dash_expires: "Expires:",

    // Auth
    auth_login_title: "Login", auth_login_sub: "Access your account",
    auth_email: "Email or phone number", auth_password: "Password",
    auth_forgot: "Forgot password?", auth_submit_login: "Sign in",
    auth_no_account: "No account yet?", auth_signup: "Sign up",
    auth_or: "or continue with",
    auth_register_title: "Sign up", auth_register_sub: "Create your account",
    auth_name: "Full name", auth_phone: "Phone number",
    auth_confirm_password: "Confirm password", auth_referral: "Referral code (optional)",
    auth_referral_applied: "Referral code applied",
    auth_terms: "I accept the", auth_terms_link: "Terms of Service",
    auth_privacy: "Privacy Policy", auth_and: "and the",
    auth_submit_register: "Create account", auth_have_account: "Already have an account?",
    auth_login_link: "Sign in",
    auth_forgot_title: "Forgot password", auth_forgot_sub: "Reset your password",
    auth_forgot_label: "Email address", auth_forgot_btn: "Send reset link",
    auth_forgot_sent_title: "Email sent", auth_forgot_back: "Back to login",
    auth_reset_sub: "Enter your email to receive a reset link.",

    // Passes
    passes_title: "Pass Selection", passes_sub: "Choose the pass that matches your investment goals.",
    passes_investments: "Investments", passes_buy: "Buy now", passes_owned: "✓ Active",
    passes_popular: "POPULAR", passes_return: "return / day", passes_duration: "Duration:",
    passes_total_gain: "Total gain:", passes_days: "days", passes_my_passes: "My Active Passes",
    passes_modal_title: "Buy Pass", passes_payment: "Payment method",
    passes_confirm: "Confirm —", passes_terms: "By clicking confirm, you accept the Terms of Service",
    passes_phone_placeholder: "Phone number (e.g. +225 07 00 00 00 00)",
    passes_active: "Active", passes_pending: "Pending", passes_expired: "Expired",

    // Wallet
    wallet_title: "My Wallet", wallet_finances: "Finances", wallet_balance: "Available Balance",
    wallet_invested: "Total Invested", wallet_earned: "Total Earned", wallet_withdraw_btn: "Request withdrawal",
    wallet_no_pass_msg: "Buy a pass to unlock withdrawals",
    wallet_history: "History", wallet_no_tx: "No transactions yet",
    wallet_modal_title: "Withdrawal Request", wallet_amount_label: "Amount (min. 2000 FCFA)",
    wallet_method_label: "Method", wallet_account_label: "Account number / details",
    wallet_account_placeholder: "Ex: 6XX XXX XXX", wallet_submit: "Submit request",
    tx_PASS_PURCHASE: "Pass Purchase", tx_DAILY_EARNING: "Daily Earnings",
    tx_TASK_REWARD: "Task Reward", tx_AFFILIATE_COMMISSION: "Affiliate Commission",
    tx_WITHDRAWAL: "Withdrawal", tx_REFERRAL_BONUS: "Referral Bonus",

    // Tasks
    tasks_title: "Daily Tasks", tasks_sub: "Complete tasks to earn rewards.",
    tasks_done: "Done", tasks_do: "Do it",

    // Portfolio
    portfolio_title: "My Portfolio", portfolio_sub: "Track your active investments.",
    portfolio_no_pass: "No active investments", portfolio_buy: "Buy a Pass",

    // Affiliate
    affiliate_title: "Affiliate Program", affiliate_sub: "Invite friends and earn commissions.",
    affiliate_link: "Your referral link", affiliate_copy: "Copied!",
    affiliate_commission: "Commission: 10% on every pass purchase",
    affiliate_share: "Share my link",

    // Notifications
    notif_title: "Notifications", notif_empty: "No notifications",
    notif_empty_sub: "Your notifications will appear here",

    // Payment simulate
    pay_pending: "Awaiting payment", pay_processing: "Processing...",
    pay_success: "Payment confirmed!", pay_success_sub: "Your pass has been activated. Redirecting...",
    pay_failed: "Payment failed", pay_failed_sub: "The payment could not be processed.",
    pay_retry: "Try again", pay_sim_success: "Simulate successful payment", pay_sim_fail: "Simulate failure",
    pay_sim_note: "Simulation mode — Replace with real API in production",
    pay_amount: "Amount to pay",
  },
} as const;

export type TKey = keyof typeof translations.fr;

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey) => string;
}

const LangContext = createContext<LangContextType>({
  lang: "fr",
  setLang: () => {},
  t: (k) => translations.fr[k],
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    const saved = localStorage.getItem("aurevia-lang") as Lang | null;
    if (saved === "fr" || saved === "en") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("aurevia-lang", l);
  };

  const t = (key: TKey): string => translations[lang][key] ?? translations.fr[key];

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export const useLanguage = () => useContext(LangContext);
