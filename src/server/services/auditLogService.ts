import { recordCurrentRequestDevice } from "@/server/services/deviceService";
import { insertAuditLog, type InsertAuditLogInput } from "@/server/repositories/auditLogRepository";

export async function recordAuditLog(
    params: Omit<InsertAuditLogInput, "deviceId">,
) {
    const device = await recordCurrentRequestDevice();
    await insertAuditLog({
        deviceId: device?.id ?? null,
        ...params,
    });
}
