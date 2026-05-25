"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "fr" | "en";

const translations = {
  fr: {
    nav_home: "Accueil", nav_passes: "Passes", nav_tasks: "Taches",
    nav_affiliate: "Affiliation", nav_portfolio: "Portfolio", nav_wallet: "Wallet",
    nav_notifications: "Alertes", nav_admin: "Panneau Admin", nav_logout: "Deconnexion",
    nav_exit: "Sortir", nav_help: "Aide",

    dash_label: "Tableau de bord", dash_greeting: "Bienvenue,", dash_balance: "Solde total",
    dash_invested: "Total investi", dash_earned: "Total gagne", dash_since_start: "depuis le debut",
    dash_7days: "7 derniers jours", dash_my_passes: "Mes Passes", dash_see_all: "Voir tout",
    dash_no_pass: "Aucun Pass actif", dash_discover: "Decouvrir les Passes", dash_buy_pass: "Acheter un Pass",
    dash_daily_task: "Tache du jour", dash_activity: "Activite recente", dash_no_activity: "Aucune activite",
    dash_per_day: "/ jour", dash_expires: "Expire:", dash_deposit: "Depot", dash_withdraw: "Retrait",

    auth_login_title: "Connexion", auth_login_sub: "Accedez a votre compte",
    auth_email: "Email ou numero de telephone", auth_password: "Mot de passe",
    auth_forgot: "Mot de passe oublie ?", auth_submit_login: "Se connecter",
    auth_no_account: "Pas encore de compte ?", auth_signup: "S'inscrire", auth_or: "ou continuer avec",
    auth_register_title: "S'inscrire", auth_register_sub: "Creez votre compte",
    auth_name: "Nom complet", auth_phone: "Numero de telephone",
    auth_confirm_password: "Confirmer le mot de passe", auth_referral: "Code de parrainage (optionnel)",
    auth_referral_applied: "Code parrainage applique", auth_terms: "J'accepte les",
    auth_terms_link: "Conditions d'utilisation", auth_privacy: "Politique de confidentialite",
    auth_and: "et la", auth_submit_register: "Creer un compte", auth_have_account: "Deja un compte ?",
    auth_login_link: "Se connecter", auth_forgot_title: "Mot de passe oublie",
    auth_forgot_sub: "Reinitialisez votre mot de passe", auth_forgot_label: "Adresse email",
    auth_forgot_btn: "Envoyer le lien", auth_forgot_sent_title: "Email envoye",
    auth_forgot_back: "Retour a la connexion", auth_reset_sub: "Entrez votre email pour recevoir un lien de reinitialisation.",

    passes_title: "Selection des Passes", passes_sub: "Choisissez le pass qui correspond a vos objectifs d'investissement.",
    passes_investments: "Investissements", passes_buy: "Acheter", passes_owned: "Actif",
    passes_popular: "TOP", passes_return: "Revenu", passes_duration: "Duree:",
    passes_total_gain: "Gain total:", passes_days: "jours", passes_my_passes: "Mes Passes actifs",
    passes_modal_title: "Achat de Pass", passes_select_country: "Selectionner votre pays",
    passes_payment: "Mode de paiement", passes_bank_transfer: "Virement bancaire",
    passes_confirm: "Confirmer", passes_terms: "En cliquant sur confirmer, vous acceptez les Conditions d'utilisation",
    passes_phone_placeholder: "Numero de telephone (ex: +237 6XX XXX XXX)",
    passes_active: "Actif", passes_pending: "En attente", passes_expired: "Expire",
    passes_exact_amount: "Montant exact:", passes_bank_details: "Coordonnees bancaires",
    passes_beneficiary: "Beneficiaire", passes_bank: "Banque", passes_upload_proof: "Joindre la preuve de paiement",
    passes_upload_hint: "Cliquer pour charger le recu (max 3 Mo)", passes_transfer_done: "J'ai effectue le virement",
    passes_activation_delay: "Votre pass sera active sous 12h maximum apres verification.",
    passes_bank_received: "Virement recu !", passes_bank_received_sub: "Votre preuve de paiement a ete envoyee. Votre pass sera active sous 12 heures maximum apres verification par notre equipe.",
    passes_back_dashboard: "Retour au tableau de bord",
    pass_desc_starter: "Ideal pour demarrer avec un revenu clair et simple.",
    pass_desc_mini: "Un petit depot pour tester Aurevia et lancer vos revenus.",
    pass_desc_boost: "Un pack accessible pour accelerer vos premiers revenus.",
    pass_desc_bronze: "Premier palier intermediaire avec revenu attractif.",
    pass_desc_plus: "Un palier equilibre entre depot et revenu.",
    pass_desc_silver: "Acces Silver avec meilleur suivi et priorite de support.",
    pass_desc_gold: "Niveau Gold pour des objectifs plus ambitieux.",
    pass_desc_platinum: "Statut Platinum avec gains premium.",
    pass_desc_vip: "Niveau ultime avec revenus maximum et support dedie.",

    wallet_title: "Mon Wallet", wallet_finances: "Finances", wallet_balance: "Solde disponible",
    wallet_invested: "Total investi", wallet_earned: "Total gagne", wallet_withdraw_btn: "Demander un retrait",
    wallet_no_pass_msg: "Achetez un pass pour debloquer les retraits",
    wallet_history: "Historique", wallet_no_tx: "Aucune transaction",
    wallet_modal_title: "Demande de retrait", wallet_amount_label: "Montant (min. 2000 FCFA)",
    wallet_method_label: "Methode", wallet_account_label: "Numero / Informations du compte",
    wallet_account_placeholder: "Ex: 6XX XXX XXX", wallet_submit: "Soumettre la demande",
    wallet_min_error: "Montant minimum: 2000 FCFA", wallet_account_error: "Informations de compte requises",
    wallet_success: "Demande de retrait soumise !",

    tasks_title: "Taches du jour", tasks_sub: "Completez les taches pour gagner des recompenses.",
    tasks_kicker: "Gains quotidiens", tasks_reward_today: "Recompense du jour",
    tasks_reset: "Reinitialisation dans", tasks_done: "Termine", tasks_do: "Faire",
    tasks_verify: "Verifier", tasks_all_done: "Toutes les taches completees !",
    tasks_back_tomorrow: "Revenez demain pour de nouvelles taches",
    task_login_title: "Se connecter", task_login_desc: "Connectez-vous a votre compte",
    task_visit_title: "Visiter la page des passes", task_visit_desc: "Visitez la page des passes",
    task_share_title: "Partager avec 3 amis", task_share_desc: "Partagez votre lien avec 3 amis",
    task_social_title: "Suivre nos reseaux sociaux", task_social_desc: "Suivez-nous sur les reseaux sociaux",
    task_invite_title: "Inviter 1 ami", task_invite_desc: "Invitez un ami a rejoindre",
    task_go_affiliate: "Aller a la page d'affiliation", task_follow_instagram: "Suivre sur Instagram",
    task_invite_link: "Inviter via le lien", task_visit_passes: "Visiter les Passes",

    portfolio_title: "Mon Portfolio", portfolio_sub: "Suivi de vos investissements actifs.",
    portfolio_no_pass: "Aucun investissement actif", portfolio_buy: "Acheter un Pass",

    affiliate_title: "Mon lien d'affiliation", affiliate_kicker: "Parrainage",
    affiliate_sub: "Invitez vos amis et gagnez des commissions a vie.",
    affiliate_link: "Votre lien unique", affiliate_copy: "Copie !", affiliate_copy_btn: "Copier le lien",
    affiliate_clicks: "Clics", affiliate_signups: "Inscrits", affiliate_earnings: "Gains",
    affiliate_commission_title: "Commission 5%", affiliate_commission_sub: "Sur chaque investissement de vos filleuls",
    affiliate_commission: "Vous gagnez 5% de commission sur chaque investissement realise par vos filleuls. Les commissions sont creditees instantanement.",
    affiliate_share: "Partager via", affiliate_share_text: "Rejoignez Aurevia Invest et commencez a gagner des aujourd'hui !",

    help_title: "Aide", help_kicker: "Guide Aurevia", help_intro: "Retrouvez ici les explications essentielles pour utiliser votre compte.",
    help_how_title: "Comment ca marche", help_how_1: "Choisissez un pass selon votre budget.",
    help_how_2: "Payez avec Mobile Money, GeniusPay ou virement bancaire selon votre pays.",
    help_how_3: "Apres validation, le pass devient actif pendant 120 jours.",
    help_how_4: "Le revenu du pass est credite chaque jour sur votre wallet.",
    help_deposit_title: "Depot", help_deposit_text: "Le depot se fait au moment de l'achat d'un pass. Selectionnez un pass, choisissez votre pays, puis suivez la methode de paiement disponible.",
    help_withdraw_title: "Retrait", help_withdraw_text: "Les retraits sont disponibles depuis le wallet apres l'achat d'un pass actif. Entrez le montant, la methode et les informations du compte.",
    help_affiliate_title: "Affiliation", help_affiliate_text: "Partagez votre lien. Quand un filleul investit, votre commission est ajoutee automatiquement a votre solde.",
    help_logout_title: "Session", help_logout_text: "Utilisez le bouton ci-dessous pour quitter votre compte. Une confirmation sera demandee avant la deconnexion.",
    help_logout_btn: "Se deconnecter", help_logout_confirm_title: "Confirmer la deconnexion",
    help_logout_confirm_text: "Etes-vous sur de vouloir vous deconnecter ?",
    help_cancel: "Annuler", help_confirm_logout: "Oui, me deconnecter",

    notif_title: "Notifications", notif_empty: "Aucune notification", notif_empty_sub: "Vos notifications apparaitront ici",
    pay_pending: "En attente de paiement", pay_processing: "Traitement en cours...",
    pay_success: "Paiement confirme !", pay_success_sub: "Votre pass a ete active. Redirection...",
    pay_failed: "Paiement echoue", pay_failed_sub: "Le paiement n'a pas pu etre traite.",
    pay_retry: "Reessayer", pay_sim_success: "Simuler paiement reussi", pay_sim_fail: "Simuler echec",
    pay_sim_note: "Mode simulation - Remplacer par vraie API en production", pay_amount: "Montant a payer",

    tx_PASS_PURCHASE: "Achat de Pass", tx_DAILY_EARNING: "Revenu journalier",
    tx_TASK_REWARD: "Recompense tache", tx_AFFILIATE_COMMISSION: "Commission affiliation",
    tx_WITHDRAWAL: "Retrait", tx_REFERRAL_BONUS: "Bonus parrainage",

    nav_missions: "Missions", nav_leaderboard: "Classement", nav_team: "Equipe",
    nav_simulator: "Simulateur", nav_settings: "Parametres",

    missions_kicker: "Defis", missions_title: "Missions", missions_sub: "Accomplissez des defis et gagnez des recompenses.",
    missions_reward: "Recompense", missions_done: "Accomplie", missions_claim: "Reclamer", missions_locked: "Bloque",
    missions_empty: "Aucune mission disponible pour le moment.",
    mission_type_invest: "Investissement", mission_type_invite: "Parrainage", mission_type_task: "Tache",
    mission_type_daily: "Quotidien", mission_type_weekly: "Hebdomadaire",

    lb_kicker: "Competition", lb_title: "Classement", lb_sub: "Les meilleurs investisseurs de la plateforme.",
    lb_my_rank: "Mon classement", lb_invested: "investis",

    team_kicker: "Communaute", team_title: "Equipes", team_sub: "Rejoignez ou creez une equipe pour investir ensemble.",
    team_create_btn: "Creer", team_create_title: "Nouvelle equipe", team_name_placeholder: "Nom de l'equipe",
    team_confirm: "Creer", team_created: "Equipe creee !", team_joined: "Equipe rejointe !",
    team_join: "Rejoindre", team_empty: "Aucune equipe pour le moment.",

    spin_kicker: "Chance quotidienne", spin_title: "Roue de la chance", spin_sub: "Tournez chaque jour pour gagner des recompenses.",
    spin_btn: "Tourner la roue", spin_spinning: "En cours...", spin_next: "Prochain spin dans",

    sim_kicker: "Outil de calcul", sim_title: "Simulateur de gains", sim_sub: "Estimez vos revenus selon votre investissement.",
    sim_amount: "Montant investi", sim_daily_rate: "Taux journalier", sim_duration: "Duree",
    sim_daily: "Revenu / jour", sim_monthly: "Revenu / 30j", sim_total: "Total", sim_chart: "Projection des gains",
    sim_preset: "Presets passes",

    settings_title: "Parametres", settings_language: "Langue", settings_lang_desc: "Choisissez votre langue d'interface.",
    settings_about: "A propos",

    team_request_btn: "Demander", team_request_title: "Demande de rejoindre", team_request_message: "Message (presentez-vous)",
    team_request_phone: "Votre numero de telephone", team_request_submit: "Envoyer la demande",
    team_request_sent: "Demande envoyee au leader !", team_request_pending: "En attente",
    team_requests_title: "Demandes en attente", team_approve: "Accepter", team_reject: "Refuser",
    team_approved: "Membre accepte !", team_rejected: "Demande refusee",
    team_ia_label: "IA Advisor", team_auto_label: "Auto Money Mode",

    help_page_dashboard: "Tableau de bord", help_page_dashboard_text: "La page principale avec votre solde, vos passes actifs, vos gains recents et vos actions rapides (depot, retrait, achat de pass).",
    help_page_passes: "Passes", help_page_passes_text: "Choisissez un pass selon votre budget. Achetez-le via Mobile Money, GeniusPay ou virement. Apres validation, le pass est actif 120 jours et genere un revenu quotidien.",
    help_page_tasks: "Taches", help_page_tasks_text: "Effectuez des taches simples chaque jour (connexion, visite de page, partage) pour gagner des recompenses. Les taches se reinitiali sent quotidiennement.",
    help_page_missions: "Missions", help_page_missions_text: "Des defis a long terme (investissement, parrainage, taches). Accomplissez-les pour obtenir des recompenses importantes.",
    help_page_leaderboard: "Classement", help_page_leaderboard_text: "Classement des meilleurs investisseurs par montant investi. Rivalisez avec la communaute pour atteindre le top.",
    help_page_team: "Equipes", help_page_team_text: "Creez ou rejoignez une equipe. Pour rejoindre, cliquez 'Demander', laissez un message et votre numero. Le leader recoit une notification et peut approuver ou refuser.",
    help_page_affiliate: "Affiliation", help_page_affiliate_text: "Partagez votre lien unique. Chaque investissement de vos filleuls vous rapporte 5% de commission, credite instantanement.",
    help_page_wallet: "Wallet", help_page_wallet_text: "Consultez votre solde, historique de transactions et faites des demandes de retrait. Minimum 2000 FCFA. Retrait via Mobile Money ou virement.",
    help_page_simulator: "Simulateur", help_page_simulator_text: "Estimez vos gains potentiels selon un montant investi, un taux journalier et une duree. Utile pour choisir votre pass.",
    help_page_spin: "Roue", help_page_spin_text: "Tournez la roue une fois par jour pour gagner des bonus aleatoires (argent, XP, surprises).",
    help_page_notifications: "Notifications", help_page_notifications_text: "Retrouvez toutes vos alertes : gains credites, paiements confirmes, demandes d'equipe, messages importants.",
    help_page_settings: "Parametres", help_page_settings_text: "Changez la langue (FR/EN) et le theme (clair/sombre) de l'application.",
    help_page_ia: "IA Advisor", help_page_ia_text: "L'IA Advisor analyse vos passes actifs et votre progression pour suggerer les meilleures strategies. Actif des l'achat d'un pass, les recommandations sont instantanees.",
    help_page_gift: "Cadeaux", help_page_gift_text: "L'admin peut activer des codes cadeaux. Les 3 premiers a entrer le code correct gagnent la recompense. Cherchez l'icone cadeau flottante sur le tableau de bord.",

    gift_float_title: "Cadeau Aurevia", gift_enter_code: "Entrer le code cadeau",
    gift_code_placeholder: "Code cadeau (ex: GIFT2026)", gift_submit: "Reclamer",
    gift_success: "Felicitations ! Cadeau credite sur votre compte.",
    gift_invalid: "Code invalide ou expire.", gift_already: "Vous avez deja reclame ce cadeau.",
    gift_full: "Ce cadeau a deja ete reclame par 3 gagnants.",
    gift_inactive: "Ce code n'est pas encore actif.",
    gift_admin_activate: "Activer ce code", gift_admin_deactivate: "Desactiver",
    gift_admin_create: "Creer un code cadeau", gift_admin_code_label: "Code",
    gift_admin_value_label: "Valeur (FCFA)", gift_admin_desc_label: "Description",
    gift_admin_max_label: "Nombre de gagnants max", gift_admin_save: "Creer",
    gift_admin_created: "Code cadeau cree !",
  },
  en: {
    nav_home: "Home", nav_passes: "Passes", nav_tasks: "Tasks",
    nav_affiliate: "Affiliate", nav_portfolio: "Portfolio", nav_wallet: "Wallet",
    nav_notifications: "Alerts", nav_admin: "Admin Panel", nav_logout: "Logout",
    nav_exit: "Exit", nav_help: "Help",

    dash_label: "Dashboard", dash_greeting: "Welcome,", dash_balance: "Total Balance",
    dash_invested: "Total Invested", dash_earned: "Total Earned", dash_since_start: "since the beginning",
    dash_7days: "Last 7 days", dash_my_passes: "My Passes", dash_see_all: "See all",
    dash_no_pass: "No active Pass", dash_discover: "Discover Passes", dash_buy_pass: "Buy a Pass",
    dash_daily_task: "Daily Task", dash_activity: "Recent Activity", dash_no_activity: "No activity yet",
    dash_per_day: "/ day", dash_expires: "Expires:", dash_deposit: "Deposit", dash_withdraw: "Withdraw",

    auth_login_title: "Login", auth_login_sub: "Access your account",
    auth_email: "Email or phone number", auth_password: "Password",
    auth_forgot: "Forgot password?", auth_submit_login: "Sign in",
    auth_no_account: "No account yet?", auth_signup: "Sign up", auth_or: "or continue with",
    auth_register_title: "Sign up", auth_register_sub: "Create your account",
    auth_name: "Full name", auth_phone: "Phone number",
    auth_confirm_password: "Confirm password", auth_referral: "Referral code (optional)",
    auth_referral_applied: "Referral code applied", auth_terms: "I accept the",
    auth_terms_link: "Terms of Service", auth_privacy: "Privacy Policy",
    auth_and: "and the", auth_submit_register: "Create account", auth_have_account: "Already have an account?",
    auth_login_link: "Sign in", auth_forgot_title: "Forgot password",
    auth_forgot_sub: "Reset your password", auth_forgot_label: "Email address",
    auth_forgot_btn: "Send reset link", auth_forgot_sent_title: "Email sent",
    auth_forgot_back: "Back to login", auth_reset_sub: "Enter your email to receive a reset link.",

    passes_title: "Pass Selection", passes_sub: "Choose the pass that matches your investment goals.",
    passes_investments: "Investments", passes_buy: "Buy", passes_owned: "Active",
    passes_popular: "TOP", passes_return: "Revenue", passes_duration: "Duration:",
    passes_total_gain: "Total gain:", passes_days: "days", passes_my_passes: "My Active Passes",
    passes_modal_title: "Buy Pass", passes_select_country: "Select your country",
    passes_payment: "Payment method", passes_bank_transfer: "Bank transfer",
    passes_confirm: "Confirm", passes_terms: "By clicking confirm, you accept the Terms of Service",
    passes_phone_placeholder: "Phone number (e.g. +237 6XX XXX XXX)",
    passes_active: "Active", passes_pending: "Pending", passes_expired: "Expired",
    passes_exact_amount: "Exact amount:", passes_bank_details: "Bank details",
    passes_beneficiary: "Beneficiary", passes_bank: "Bank", passes_upload_proof: "Upload payment proof",
    passes_upload_hint: "Click to upload receipt (max 3 MB)", passes_transfer_done: "I completed the transfer",
    passes_activation_delay: "Your pass will be activated within 12 hours after verification.",
    passes_bank_received: "Transfer received!", passes_bank_received_sub: "Your payment proof has been sent. Your pass will be activated within 12 hours after verification by our team.",
    passes_back_dashboard: "Back to dashboard",
    pass_desc_starter: "Ideal for getting started with clear and simple revenue.",
    pass_desc_mini: "A small deposit to try Aurevia and start earning.",
    pass_desc_boost: "An accessible pack to speed up your first revenues.",
    pass_desc_bronze: "First intermediate level with attractive revenue.",
    pass_desc_plus: "A balanced level between deposit and revenue.",
    pass_desc_silver: "Silver access with better tracking and priority support.",
    pass_desc_gold: "Gold level for more ambitious goals.",
    pass_desc_platinum: "Platinum status with premium gains.",
    pass_desc_vip: "Ultimate level with maximum revenue and dedicated support.",

    wallet_title: "My Wallet", wallet_finances: "Finances", wallet_balance: "Available Balance",
    wallet_invested: "Total Invested", wallet_earned: "Total Earned", wallet_withdraw_btn: "Request withdrawal",
    wallet_no_pass_msg: "Buy a pass to unlock withdrawals",
    wallet_history: "History", wallet_no_tx: "No transactions yet",
    wallet_modal_title: "Withdrawal Request", wallet_amount_label: "Amount (min. 2000 FCFA)",
    wallet_method_label: "Method", wallet_account_label: "Account number / details",
    wallet_account_placeholder: "Ex: 6XX XXX XXX", wallet_submit: "Submit request",
    wallet_min_error: "Minimum amount: 2000 FCFA", wallet_account_error: "Account details are required",
    wallet_success: "Withdrawal request submitted!",

    tasks_title: "Today's Tasks", tasks_sub: "Complete tasks to earn rewards.",
    tasks_kicker: "Daily earnings", tasks_reward_today: "Today's reward",
    tasks_reset: "Resets in", tasks_done: "Done", tasks_do: "Do",
    tasks_verify: "Verify", tasks_all_done: "All tasks completed!",
    tasks_back_tomorrow: "Come back tomorrow for new tasks",
    task_login_title: "Sign in", task_login_desc: "Sign in to your account",
    task_visit_title: "Visit the passes page", task_visit_desc: "Visit the passes page",
    task_share_title: "Share with 3 friends", task_share_desc: "Share your link with 3 friends",
    task_social_title: "Follow our social networks", task_social_desc: "Follow us on social media",
    task_invite_title: "Invite 1 friend", task_invite_desc: "Invite a friend to join",
    task_go_affiliate: "Go to affiliate page", task_follow_instagram: "Follow on Instagram",
    task_invite_link: "Invite with your link", task_visit_passes: "Visit Passes",

    portfolio_title: "My Portfolio", portfolio_sub: "Track your active investments.",
    portfolio_no_pass: "No active investments", portfolio_buy: "Buy a Pass",

    affiliate_title: "My Affiliate Link", affiliate_kicker: "Referral",
    affiliate_sub: "Invite friends and earn lifetime commissions.",
    affiliate_link: "Your unique link", affiliate_copy: "Copied!", affiliate_copy_btn: "Copy link",
    affiliate_clicks: "Clicks", affiliate_signups: "Signups", affiliate_earnings: "Earnings",
    affiliate_commission_title: "5% commission", affiliate_commission_sub: "On every investment from your referrals",
    affiliate_commission: "You earn a 5% commission on every investment made by your referrals. Commissions are credited instantly.",
    affiliate_share: "Share via", affiliate_share_text: "Join Aurevia Invest and start earning today!",

    help_title: "Help", help_kicker: "Aurevia Guide", help_intro: "Find the essential explanations for using your account.",
    help_how_title: "How it works", help_how_1: "Choose a pass based on your budget.",
    help_how_2: "Pay with Mobile Money, GeniusPay, or bank transfer depending on your country.",
    help_how_3: "After validation, the pass stays active for 120 days.",
    help_how_4: "The pass revenue is credited to your wallet every day.",
    help_deposit_title: "Deposit", help_deposit_text: "Deposits happen when buying a pass. Select a pass, choose your country, then follow the available payment method.",
    help_withdraw_title: "Withdrawal", help_withdraw_text: "Withdrawals are available from the wallet after buying an active pass. Enter the amount, method, and account details.",
    help_affiliate_title: "Affiliate", help_affiliate_text: "Share your link. When a referral invests, your commission is added automatically to your balance.",
    help_logout_title: "Session", help_logout_text: "Use the button below to leave your account. A confirmation will be requested before logout.",
    help_logout_btn: "Log out", help_logout_confirm_title: "Confirm logout",
    help_logout_confirm_text: "Are you sure you want to log out?",
    help_cancel: "Cancel", help_confirm_logout: "Yes, log me out",

    notif_title: "Notifications", notif_empty: "No notifications", notif_empty_sub: "Your notifications will appear here",
    pay_pending: "Awaiting payment", pay_processing: "Processing...",
    pay_success: "Payment confirmed!", pay_success_sub: "Your pass has been activated. Redirecting...",
    pay_failed: "Payment failed", pay_failed_sub: "The payment could not be processed.",
    pay_retry: "Try again", pay_sim_success: "Simulate successful payment", pay_sim_fail: "Simulate failure",
    pay_sim_note: "Simulation mode - Replace with real API in production", pay_amount: "Amount to pay",

    tx_PASS_PURCHASE: "Pass Purchase", tx_DAILY_EARNING: "Daily Revenue",
    tx_TASK_REWARD: "Task Reward", tx_AFFILIATE_COMMISSION: "Affiliate Commission",
    tx_WITHDRAWAL: "Withdrawal", tx_REFERRAL_BONUS: "Referral Bonus",

    nav_missions: "Missions", nav_leaderboard: "Leaderboard", nav_team: "Team",
    nav_simulator: "Simulator", nav_settings: "Settings",

    missions_kicker: "Challenges", missions_title: "Missions", missions_sub: "Complete challenges and earn rewards.",
    missions_reward: "Reward", missions_done: "Completed", missions_claim: "Claim", missions_locked: "Locked",
    missions_empty: "No missions available yet.",
    mission_type_invest: "Investment", mission_type_invite: "Referral", mission_type_task: "Task",
    mission_type_daily: "Daily", mission_type_weekly: "Weekly",

    lb_kicker: "Competition", lb_title: "Leaderboard", lb_sub: "Top investors on the platform.",
    lb_my_rank: "My ranking", lb_invested: "invested",

    team_kicker: "Community", team_title: "Teams", team_sub: "Join or create a team to invest together.",
    team_create_btn: "Create", team_create_title: "New team", team_name_placeholder: "Team name",
    team_confirm: "Create", team_created: "Team created!", team_joined: "Team joined!",
    team_join: "Join", team_empty: "No teams yet.",

    spin_kicker: "Daily chance", spin_title: "Spin Wheel", spin_sub: "Spin every day to win rewards.",
    spin_btn: "Spin the wheel", spin_spinning: "Spinning...", spin_next: "Next spin in",

    sim_kicker: "Calculation tool", sim_title: "Earnings Simulator", sim_sub: "Estimate your returns based on your investment.",
    sim_amount: "Investment amount", sim_daily_rate: "Daily rate", sim_duration: "Duration",
    sim_daily: "Revenue / day", sim_monthly: "Revenue / 30d", sim_total: "Total", sim_chart: "Earnings projection",
    sim_preset: "Pass presets",

    settings_title: "Settings", settings_language: "Language", settings_lang_desc: "Choose your interface language.",
    settings_about: "About",

    team_request_btn: "Request", team_request_title: "Request to join", team_request_message: "Message (introduce yourself)",
    team_request_phone: "Your phone number", team_request_submit: "Send request",
    team_request_sent: "Request sent to the leader!", team_request_pending: "Pending",
    team_requests_title: "Pending requests", team_approve: "Accept", team_reject: "Decline",
    team_approved: "Member accepted!", team_rejected: "Request declined",
    team_ia_label: "IA Advisor", team_auto_label: "Auto Money Mode",

    help_page_dashboard: "Dashboard", help_page_dashboard_text: "Main page with your balance, active passes, recent earnings and quick actions (deposit, withdraw, buy pass).",
    help_page_passes: "Passes", help_page_passes_text: "Choose a pass based on your budget. Buy it via Mobile Money, GeniusPay or bank transfer. After validation, the pass is active for 120 days and generates daily revenue.",
    help_page_tasks: "Tasks", help_page_tasks_text: "Complete simple daily tasks (login, page visit, sharing) to earn rewards. Tasks reset every day.",
    help_page_missions: "Missions", help_page_missions_text: "Long-term challenges (investment, referral, tasks). Complete them to earn major rewards.",
    help_page_leaderboard: "Leaderboard", help_page_leaderboard_text: "Ranking of top investors by amount invested. Compete with the community to reach the top.",
    help_page_team: "Teams", help_page_team_text: "Create or join a team. To join, click 'Request', leave a message and your number. The leader gets a notification and can approve or decline.",
    help_page_affiliate: "Affiliate", help_page_affiliate_text: "Share your unique link. Every investment by your referrals earns you a 5% commission, credited instantly.",
    help_page_wallet: "Wallet", help_page_wallet_text: "View your balance, transaction history and request withdrawals. Minimum 2000 FCFA. Withdraw via Mobile Money or bank transfer.",
    help_page_simulator: "Simulator", help_page_simulator_text: "Estimate your potential earnings based on an invested amount, daily rate and duration. Useful for choosing your pass.",
    help_page_spin: "Spin Wheel", help_page_spin_text: "Spin once per day to win random bonuses (money, XP, surprises).",
    help_page_notifications: "Notifications", help_page_notifications_text: "All your alerts: credited earnings, confirmed payments, team requests, important messages.",
    help_page_settings: "Settings", help_page_settings_text: "Change the language (FR/EN) and theme (light/dark) of the app.",
    help_page_ia: "IA Advisor", help_page_ia_text: "The IA Advisor analyzes your active passes and progression to suggest the best strategies. Active as soon as you buy a pass, recommendations are instant.",
    help_page_gift: "Gifts", help_page_gift_text: "The admin can activate gift codes. The first 3 to enter the correct code win the reward. Look for the floating gift icon on the dashboard.",

    gift_float_title: "Aurevia Gift", gift_enter_code: "Enter gift code",
    gift_code_placeholder: "Gift code (e.g. GIFT2026)", gift_submit: "Claim",
    gift_success: "Congratulations! Gift credited to your account.",
    gift_invalid: "Invalid or expired code.", gift_already: "You have already claimed this gift.",
    gift_full: "This gift has already been claimed by 3 winners.",
    gift_inactive: "This code is not yet active.",
    gift_admin_activate: "Activate this code", gift_admin_deactivate: "Deactivate",
    gift_admin_create: "Create gift code", gift_admin_code_label: "Code",
    gift_admin_value_label: "Value (FCFA)", gift_admin_desc_label: "Description",
    gift_admin_max_label: "Max winners", gift_admin_save: "Create",
    gift_admin_created: "Gift code created!",
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
