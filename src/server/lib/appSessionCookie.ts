import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = process.env.APP_SESSION_COOKIE_NAME ?? 'app_session';

export async function setSessionCookie(
    sessionToken: string,
    expiresAt: Date
) {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        expires: expiresAt,
    });
}

export async function getSessionTokenFromCookie(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function deleteSessionCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
}