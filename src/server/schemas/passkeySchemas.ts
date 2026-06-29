import { z } from 'zod';
import type {
    AuthenticationResponseJSON,
    RegistrationResponseJSON,
} from '@simplewebauthn/server'

export const challengeIdSchema = z.coerce.number();

const credentialSchema = z
    .string()
    .transform((str, ctx) => {
        try {
            return JSON.parse(str);
        } catch {
            ctx.addIssue({
                code: 'custom',
                message: '認証情報のパースに失敗しました'
            });
            return z.NEVER;
        }
    });

export const registrationResponseSchema: z.ZodType<RegistrationResponseJSON> = credentialSchema;
export const authenticationResponseSchema: z.ZodType<AuthenticationResponseJSON> = credentialSchema;