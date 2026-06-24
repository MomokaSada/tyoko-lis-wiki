import { getCurrentRequestDevice } from "@/server/services/modules/requestDevice";
import { countRateLimitRecords, insertRateLimitRecord } from "@/server/repositories/rateLimitRepository";
import { RATE_LIMIT_RULES, type RateLimitAction } from "@/server/lib/rateLimit";

export type RateLimitResult = 
    | {allowed: true }
    | {allowed: false, retryAfterMs: number };

export async function checkRateLimit(action: RateLimitAction): Promise<RateLimitResult> {
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