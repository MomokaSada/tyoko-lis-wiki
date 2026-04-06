import { deleteAuditLogs, deleteRateLimitRecords } from "@/server/repositories/cleanUpRepository";

const RATE_LIMIT_RETENTION_MS = 24 * 60 * 60 * 1000;
const AUDIT_LOG_RETENTION_MS = 90 * 24 * 60 * 60 * 1000;

export async function cleanUpRateLimitRecords() {
    const createdAt = new Date(Date.now() - RATE_LIMIT_RETENTION_MS);
    return await deleteRateLimitRecords(createdAt);
}

export async function cleanUpAuditLogs() {
    const createdAt = new Date(Date.now() - AUDIT_LOG_RETENTION_MS);
    return await deleteAuditLogs(createdAt);
}
