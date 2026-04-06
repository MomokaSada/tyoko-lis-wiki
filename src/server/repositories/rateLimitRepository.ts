import { db } from "@/db";
import { rateLimitRecords } from "@/db/schema";
import { and, eq, gte, count } from "drizzle-orm";

export async function countRateLimitRecords(
    ip: string,
    action: string,
    windowStart: Date
): Promise<number> {
    const result = await db
        .select({ count: count() })
        .from(rateLimitRecords)
        .where(
            and(
                eq(rateLimitRecords.ip, ip),
                eq(rateLimitRecords.action, action),
                gte(rateLimitRecords.createdAt, windowStart)
            )
        );

    return result[0]?.count ?? 0;
}

export async function insertRateLimitRecord(
    ip: string,
    action: string
) {
    await db.insert(rateLimitRecords).values({
        ip,
        action,
    });
}