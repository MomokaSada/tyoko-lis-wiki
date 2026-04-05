export type RateLimitRuleConfig = {
    windowMs: number;
    maxAttempts: number;
};

export const RATE_LIMIT_RULES = {
    login: {
        windowMs: 15 * 60 * 1000, // 15分
        maxAttempts: 10,
    },
    register: {
        windowMs: 60 * 60 * 1000,
        maxAttempts: 5,
    },
    createContent: {
        windowMs: 60 * 60 * 1000,
        maxAttempts: 30,
    },
    updateContent: {
        windowMs: 60 * 60 * 1000,
        maxAttempts: 100,
    },
    deleteContent: {
        windowMs: 60 * 60 * 1000,
        maxAttempts: 20,
    },
    thumbnailUpload: {
        windowMs: 60 * 60 * 1000,
        maxAttempts: 30,
    },
    createCategory: {
        windowMs: 60 * 60 * 1000,
        maxAttempts: 20,
    },
    updateCategory: {
        windowMs: 60 * 60 * 1000,
        maxAttempts: 30,
    },
    createIpBan: {
        windowMs: 60 * 60 * 1000,
        maxAttempts: 20,
    },
    createEditLink: {
        windowMs: 60 * 60 * 1000,
        maxAttempts: 30,
    },
    createAccountCreateLink: {
        windowMs: 60 * 60 * 1000,
        maxAttempts: 10,
    },
} as const satisfies Record<string, RateLimitRuleConfig>;

export type RateLimitAction = keyof typeof RATE_LIMIT_RULES;

