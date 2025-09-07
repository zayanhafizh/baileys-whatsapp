import { AuthenticationState } from '@whiskeysockets/baileys';
/**
 * Database-based authentication state for WhatsApp
 * Replaces file system storage with database storage
 */
export declare function useDatabaseAuthState(sessionId: string): Promise<{
    state: AuthenticationState;
    saveCreds: () => Promise<void>;
    clearAuth: () => Promise<void>;
}>;
//# sourceMappingURL=databaseAuth.d.ts.map