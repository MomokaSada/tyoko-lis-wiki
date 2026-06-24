import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getValidSessionByToken } from '@/server/repositories/appSessionRepository';
import { getSessionTokenFromCookie } from '@/server/lib/appSessionCookie';
import type { PrivilegedActor as Actor } from '@/types/actor';

function getUsernameFromDummyEmail(email: string | undefined) {
  if (!email || !email.endsWith('@test.com')) {
    return null;
  }

  return email.slice(0, -'@test.com'.length);
}

export async function getCurrentActor(): Promise<Actor | null> {
    const sessionToken = await getSessionTokenFromCookie();
    const appSession = sessionToken ? await getValidSessionByToken(sessionToken) : null;
    if (appSession) {
        const [appUser] = await db
            .select({
                id: users.id,
                role: users.type,
                isActive: users.isActive
            })
            .from(users)
            .where(
                eq(users.id, appSession.userId)
            )
            .limit(1);
        
        if (appUser && appUser.isActive && (
            appUser.role == 'owner' || appUser.role === 'admin'
        )) {
            return {
                id: appUser.id,
                role: appUser.role
            };
        }
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data.user) {
        return null;
    }
    
    const role = data.user.app_metadata?.role;
    
    if (role !== 'owner' && role !== 'admin') {
        return null;
    }
    
    let [appUser] = await db
        .select({
            id: users.id,
            role: users.type,
            isActive: users.isActive,
        })
        .from(users)
        .where(eq(users.authUserId, data.user.id))
        .limit(1);

    // Fallback for existing accounts created before authUserId was backfilled.
    if (!appUser) {
        const userName = getUsernameFromDummyEmail(data.user.email);

        if (!userName) {
            return null;
        }

        [appUser] = await db
            .select({
                id: users.id,
                role: users.type,
                isActive: users.isActive,
            })
            .from(users)
            .where(eq(users.name, userName))
            .limit(1);
    }
    
    if (
        !appUser ||
        !appUser.isActive ||
        (appUser.role !== 'owner' && appUser.role !== 'admin')
    ) {
        return null;
    }
    
    return {
        id: appUser.id,
        role: appUser.role,
    };
}
