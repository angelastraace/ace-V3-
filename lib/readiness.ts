import { approvalGates, featureFlags, providerConfig, coreAccountReady, financialCoreReady, publicLaunchApproved } from "./config";

export type ReadyState = "ready" | "partial" | "blocked";
export type ReadyItem = { key: string; label: string; state: ReadyState; reason: string; critical?: boolean };

const item = (key: string, label: string, state: ReadyState, reason: string, critical = false): ReadyItem => ({ key, label, state, reason, critical });

export function readinessItems(): ReadyItem[] {
  return [
    item("database", "Production database", providerConfig.database ? "ready" : "blocked", providerConfig.database ? "Configured" : "DATABASE_URL missing", true),
    item("auth", "Authentication / session service", providerConfig.auth ? "ready" : "blocked", providerConfig.auth ? "Configured" : "AUTH_SERVICE_URL/TOKEN missing", true),
    item("email", "Transactional email", providerConfig.email ? "ready" : "blocked", providerConfig.email ? "Configured" : "Transactional email provider missing", true),
    item("monitoring", "Monitoring / error reporting", providerConfig.monitoring ? "ready" : "blocked", providerConfig.monitoring ? "Configured" : "MONITORING_DSN missing", true),
    item("audit", "Persistent audit service", providerConfig.audit ? "ready" : "blocked", providerConfig.audit ? "Configured" : "Persistent audit service missing", true),
    item("rateLimit", "Distributed rate limiting", providerConfig.rateLimit ? "ready" : "blocked", providerConfig.rateLimit ? "Configured" : "RATE_LIMIT_SERVICE_URL/TOKEN missing", true),
    item("registration", "User registration", featureFlags.registration && coreAccountReady() ? "ready" : featureFlags.registration ? "blocked" : "partial", featureFlags.registration ? (coreAccountReady() ? "Enabled with core controls" : "Enabled but core account dependencies are incomplete") : "Disabled by default until onboarding stack is verified"),
    item("marketData", "Market data", providerConfig.marketData ? "ready" : "partial", providerConfig.marketData ? "Production provider configured" : "Public read-only fallback only; production SLA provider recommended"),
    item("custody", "Custody / wallet infrastructure", providerConfig.custody ? "ready" : "blocked", providerConfig.custody ? "Configured" : "Custody provider credentials missing", true),
    item("ledger", "Double-entry ledger service", providerConfig.ledger ? "ready" : "blocked", providerConfig.ledger ? "Configured" : "Ledger service credentials missing", true),
    item("trading", "Trading / liquidity execution", providerConfig.trading && featureFlags.trading ? "ready" : providerConfig.trading ? "partial" : "blocked", providerConfig.trading ? "Provider configured; feature remains gated until approvals are complete" : "Trading provider credentials missing"),
    item("kyc", "KYC provider", providerConfig.kyc ? "ready" : "blocked", providerConfig.kyc ? "Configured" : "KYC provider credentials missing", true),
    item("aml", "AML / sanctions screening", providerConfig.aml ? "ready" : "blocked", providerConfig.aml ? "Configured" : "AML provider credentials missing", true),
    item("fiat", "Fiat rails", providerConfig.fiat && featureFlags.fiat ? "ready" : providerConfig.fiat ? "partial" : "blocked", providerConfig.fiat ? "Provider configured; feature remains gated until approvals are complete" : "Fiat provider credentials missing"),
    item("card", "ACE Card program", providerConfig.card && featureFlags.card ? "ready" : providerConfig.card ? "partial" : "blocked", providerConfig.card ? "Provider configured; feature remains gated until issuer/program approval" : "Issuer/processor integration missing"),
    item("governance", "Governance backend", providerConfig.governance ? "ready" : "partial", providerConfig.governance ? "Configured" : "Frontend/read-only architecture only"),
    item("community", "Community backend", providerConfig.community ? "ready" : "partial", providerConfig.community ? "Configured" : "Frontend/read-only architecture only"),
    item("creator", "Creator backend", providerConfig.creator ? "ready" : "partial", providerConfig.creator ? "Configured" : "Frontend/read-only architecture only"),
    item("legalApproval", "Legal launch approval", approvalGates.legalLaunchApproved ? "ready" : "blocked", approvalGates.legalLaunchApproved ? "Explicitly approved in production configuration" : "LEGAL_LAUNCH_APPROVED remains false", true),
    item("operationsApproval", "Operations launch approval", approvalGates.operationsLaunchApproved ? "ready" : "blocked", approvalGates.operationsLaunchApproved ? "Explicitly approved in production configuration" : "OPERATIONS_LAUNCH_APPROVED remains false", true),
    item("securityApproval", "Security launch approval", approvalGates.securityLaunchApproved ? "ready" : "blocked", approvalGates.securityLaunchApproved ? "Explicitly approved in production configuration" : "SECURITY_LAUNCH_APPROVED remains false", true),
  ];
}

export type LaunchConclusion = "LAUNCH BLOCKED" | "READY FOR CONTROLLED BETA" | "READY FOR PUBLIC LAUNCH";

export function launchConclusion(): LaunchConclusion {
  if (!coreAccountReady() || !approvalGates.controlledBetaApproved) return "LAUNCH BLOCKED";

  const anyFinancialFlag = featureFlags.trading || featureFlags.deposits || featureFlags.withdrawals || featureFlags.fiat || featureFlags.card;
  if (!anyFinancialFlag) return "READY FOR CONTROLLED BETA";

  const baseFinancial = financialCoreReady();
  const tradingReady = !featureFlags.trading || providerConfig.trading;
  const fiatReady = !featureFlags.fiat || providerConfig.fiat;
  const cardReady = !featureFlags.card || providerConfig.card;
  if (!baseFinancial || !tradingReady || !fiatReady || !cardReady || !publicLaunchApproved()) return "LAUNCH BLOCKED";

  return "READY FOR PUBLIC LAUNCH";
}

export function launchSummary() {
  return {
    conclusion: launchConclusion(),
    accountBetaReady: coreAccountReady() && approvalGates.controlledBetaApproved,
    financialCoreReady: financialCoreReady(),
    publicLaunchApproved: publicLaunchApproved(),
    approvals: approvalGates,
    financialFeaturesEnabled: {
      trading: featureFlags.trading,
      deposits: featureFlags.deposits,
      withdrawals: featureFlags.withdrawals,
      fiat: featureFlags.fiat,
      card: featureFlags.card,
    },
  };
}
