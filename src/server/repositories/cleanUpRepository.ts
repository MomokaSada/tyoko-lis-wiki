import { db } from "@/db";
import { lt } from "drizzle-orm";
import { rateLimitRecords } from "@/db/schema";
import { auditLogs } from "@/db/schema";

export async function deleteRateLimitRecords(createdAt: Date) {
    const result = await db
        .delete(rateLimitRecords)
        .where(lt(rateLimitRecords.createdAt, createdAt));
    return result.count;
}

export async function deleteAuditLogs(createdAt: Date) {
    const result = await db
        .delete(auditLogs)
        .where(lt(auditLogs.createdAt, createdAt));
    return result.count;
}
