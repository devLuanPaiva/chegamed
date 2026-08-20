
export const AUTH_STORAGE_KEYS = {
    ACCESS: "auth.access",
    REFRESH: "auth.refresh",
} as const;

export const COMPANY_STORAGE_KEYS = {
    SELECTED: "@company:selected",
} as const;

export const AI_CONSENT_STORAGE_KEYS = {
    EXTRACTION: "@ai-consent:extraction",
    ASSISTANT: "@ai-consent:assistant",
} as const;

export type AiConsentFeature = keyof typeof AI_CONSENT_STORAGE_KEYS;
