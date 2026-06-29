import { NextRequest, NextResponse } from 'next/server';
import {
    cleanUpAuditLogs,
    cleanUpRateLimitRecords,
} from '@/server/services/cleanUpService';
import { commonErrors } from '@/server/errors';

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: commonErrors.unauthorized }, { status: 401 });
    }

    const deletedRateLimitRecords = await cleanUpRateLimitRecords();
    const deletedAuditLogs = await cleanUpAuditLogs();

    return NextResponse.json({ ok: true, deletedRateLimitRecords, deletedAuditLogs });
}
