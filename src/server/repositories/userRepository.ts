import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import type { User } from '@/types/user';


export async function getUserProfile(
    userId: number
): Promise<User | null> {
    const [user] = await db
        .select({
            id: users.id,
            name: users.name,
            role: users.type,
            isActive: users.isActive,
        })
        .from(users)
        .where(
            eq(users.id, userId)
        )
        .limit(1);

    return user ?? null;
}