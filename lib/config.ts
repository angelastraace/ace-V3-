export type FeatureKey =
  | "registration" | "trading" | "deposits" | "withdrawals" | "fiat" | "card" | "governanceVoting"
  | "creatorPayouts" | "marketplace" | "communityWrites" | "advancedTrading" | "adminDashboard";

const enabled = (name: string) => process.env[name] === "true";
const configured = (...values: Array<string | undefined>) => values.every((value) => Boolean(value?.trim()));

export const featureFlags: Record<FeatureKey, boolean> = {
  registration: enabled("ENABLE_REGISTRATION"),
  trading: enabled("ENABLE_TRADING"),
  deposits: enabled("ENABLE_DEPOSITS"),
  withdrawals: enabled("ENABLE_WITHDRAWALS"),
  fiat: enabled("ENABLE_FIAT"),
  card: enabled("ENABLE_CARD"),
  governanceVoting: enabled("ENABLE_GOVERNANCE_VOTING"),
  creatorPayouts: enabled("ENABLE_CREATOR_PAYOUTS"),
  marketplace: enabled("ENABLE_MARKETPLACE"),
  communityWrites: enabled("ENABLE_COMMUNITY_WRITES"),
  advancedTrading: enabled("ENABLE_ADVANCED_TRADING"),
  adminDashboard: enabled("ENABLE_ADMIN_DASHBOARD"),
};

export const approvalGates = {
  controlledBetaApproved: enabled("CONTROLLED_BETA_APPROVED"),
  legalLaunchApproved: enabled("LEGAL_LAUNCH_APPROVED"),
  operationsLaunchApproved: enabled("OPERATIONS_LAUNCH_APPROVED"),
  securityLaunchApproved: enabled("SECURITY_LAUNCH_APPROVED"),
  financialProviderValidationApproved: enabled("FINANCIAL_PROVIDER_VALIDATION_APPROVED"),
};

export const authMode = process.env.AUTH_MODE === "better-auth" ? "better-auth" : "legacy";
const betterAuthConfigured = configured(process.env.ACE_NEON_DATABASE_URL, process.env.BETTER_AUTH_SECRET, process.env.BETTER_AUTH_URL);

export const providerConfig = {
  database: authMode === "better-auth" ? configured(process.env.ACE_NEON_DATABASE_URL) : configured(process.env.DATABASE_URL),
  auth: authMode === "better-auth" ? betterAuthConfigured : configured(process.env.AUTH_SERVICE_URL, process.env.AUTH_SERVICE_TOKEN),
  custody: configured(process.env.CUSTODY_API_URL, process.env.CUSTODY_API_KEY),
  ledger: configured(process.env.LEDGER_SERVICE_URL, process.env.LEDGER_SERVICE_TOKEN),
  marketData: configured(process.env.MARKET_DATA_PROVIDER_URL, process.env.MARKET_DATA_PROVIDER_TOKEN),
  trading: configured(process.env.TRADING_EXECUTION_URL, process.env.TRADING_EXECUTION_TOKEN),
  kyc: configured(process.env.KYC_PROVIDER_URL, process.env.KYC_PROVIDER_KEY),
  aml: configured(process.env.AML_PROVIDER_URL, process.env.AML_PROVIDER_KEY),
  fiat: configured(process.env.FIAT_PROVIDER_URL, process.env.FIAT_PROVIDER_KEY),
  card: configured(process.env.CARD_PROVIDER_URL, process.env.CARD_PROVIDER_KEY),
  governance: configured(process.env.GOVERNANCE_API_URL, process.env.GOVERNANCE_API_TOKEN),
  community: configured(process.env.COMMUNITY_API_URL, process.env.COMMUNITY_API_TOKEN),
  creator: configured(process.env.CREATOR_API_URL, process.env.CREATOR_API_TOKEN),
  email: configured(process.env.EMAIL_API_URL, process.env.EMAIL_API_KEY),
  sms: configured(process.env.SMS_API_URL, process.env.SMS_API_KEY),
  monitoring: configured(process.env.MONITORING_DSN),
  audit: configured(process.env.AUDIT_SERVICE_URL, process.env.AUDIT_SERVICE_TOKEN),
  rateLimit: configured(process.env.RATE_LIMIT_SERVICE_URL, process.env.RATE_LIMIT_SERVICE_TOKEN),
  internalStatus: configured(process.env.INTERNAL_STATUS_TOKEN),
};

export function coreAccountReady() {
  return providerConfig.database && providerConfig.auth && providerConfig.email && providerConfig.monitoring && providerConfig.audit && providerConfig.rateLimit;
}

export function financialCoreReady() {
  return providerConfig.database && providerConfig.auth && providerConfig.ledger && providerConfig.custody && providerConfig.kyc && providerConfig.aml && providerConfig.audit && providerConfig.monitoring && providerConfig.rateLimit;
}

export function publicLaunchApproved() {
  return approvalGates.legalLaunchApproved && approvalGates.operationsLaunchApproved && approvalGates.securityLaunchApproved && approvalGates.financialProviderValidationApproved;
}

export function financialActionsEnabled() {
  return financialCoreReady() && publicLaunchApproved() && (featureFlags.trading || featureFlags.deposits || featureFlags.withdrawals || featureFlags.fiat || featureFlags.card);
}
