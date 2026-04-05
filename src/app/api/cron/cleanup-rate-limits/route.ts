import { NextRequest, NextResponse } from 'next/server';
import { cleanUpRateLimitRecords } from '@/server/services/cleanUpService';


export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deleted = await cleanUpRateLimitRecords();

    return NextResponse.json({ ok: true, deletedCount: deleted });
}
