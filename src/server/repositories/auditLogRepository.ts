import { db } from '@/db';
import { auditLogs } from '@/db/schema';
import type { AuditAction } from '@/server/types/AuditAction';
import type { JsonObject } from '@/types/json';

export type InsertAuditLogInput = {
    actorId: number | null;
    deviceId: number | null;
    action: AuditAction;
    targetId?: string | null;
    targetType?: string | null;
    detail?: JsonObject | null;
};

export async function insertAuditLog(input: InsertAuditLogInput) {
    await db.insert(auditLogs).values({
        actorId: input.actorId,
        deviceId: input.deviceId,
        action: input.action,
        targetId: input.targetId ?? null,
        targetType: input.targetType ?? null,
        detail: input.detail,
    });
}   
