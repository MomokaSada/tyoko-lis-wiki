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
    deactivateEditLink: {
        windowMs: 60 * 60 * 1000,
        maxAttempts: 30,
    },
    deleteCategory: {
        windowMs: 60 * 60 * 1000,
        maxAttempts: 20,
    },
    banAccount: {
        windowMs: 60 * 60 * 1000,
        maxAttempts: 20,
    },
} as const satisfies Record<string, RateLimitRuleConfig>;

export type RateLimitAction = keyof typeof RATE_LIMIT_RULES;

export type RateLimitResult =
    | {allowed: true }
    | {allowed: false, retryAfterMs: number };

export async function checkRateLimit(action: RateLimitAction): Promise<RateLimitResult> {
    const { getCurrentRequestDevice } = await import('@/server/services/modules/requestDevice');
    const { countRateLimitRecords, insertRateLimitRecord } = await import('@/server/repositories/rateLimitRepository');

    const device = await getCurrentRequestDevice();
    if (!device) {
        return { allowed: true };
    }

    const rule = RATE_LIMIT_RULES[action];

    const windowStart = new Date(Date.now() - rule.windowMs);
    const count = await countRateLimitRecords(device.ip, action, windowStart);

    if (count >= rule.maxAttempts) {
        return {
            allowed: false,
            retryAfterMs: rule.windowMs
        };
    }

    await insertRateLimitRecord(device.ip, action);

    return { allowed: true };
}

