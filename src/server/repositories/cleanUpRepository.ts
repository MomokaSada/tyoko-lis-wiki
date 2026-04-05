import { db } from "@/db";
import { lt } from "drizzle-orm";
import { rateLimitRecords } from "@/db/schema";

export async function deleteRateLimitRecords(createdAt: Date) {
    const result = await db
        .delete(rateLimitRecords)
        .where(lt(rateLimitRecords.createdAt, createdAt))
        .returning({ id: rateLimitRecords.id });
    return result.length;
}