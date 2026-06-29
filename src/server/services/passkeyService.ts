import { createAppSession } from '@/server/repositories/appSessionRepository';
import {
    createPasskey,
    getPasskeysByUserId,
    getPasskeyByCredentialId,
    updatePasskeyCounter,
} from '@/server/repositories/passkeyRepository';
import { findUserByName } from '@/server/repositories/authRepository';
import {
    getUserProfile,
} from '@/server/repositories/userRepository';
import {
    createChallenge,
    getValidChallenge,
    markChallengeConsumed,
} from '@/server/repositories/webauthnChallengeRepository';

export {
    createAppSession,
    createPasskey,
    getPasskeysByUserId,
    getPasskeyByCredentialId,
    updatePasskeyCounter,
    findUserByName,
    getUserProfile,
    createChallenge,
    getValidChallenge,
    markChallengeConsumed,
};
