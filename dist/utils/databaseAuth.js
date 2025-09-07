"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDatabaseAuthState = useDatabaseAuthState;
const baileys_1 = require("@whiskeysockets/baileys");
const database_1 = require("@/services/database");
/**
 * Serialize data to JSON with binary support
 */
function serializeData(data) {
    try {
        return JSON.stringify(data, (key, value) => {
            if (value instanceof Uint8Array) {
                return {
                    __type: 'Uint8Array',
                    data: Array.from(value)
                };
            }
            if (value instanceof Buffer) {
                return {
                    __type: 'Buffer',
                    data: Array.from(value)
                };
            }
            if (value && typeof value === 'object' && value.type === 'Buffer') {
                return {
                    __type: 'Buffer',
                    data: value.data
                };
            }
            return value;
        });
    }
    catch (error) {
        console.error('Error serializing data:', error);
        return '{}';
    }
}
/**
 * Deserialize JSON data with binary support
 */
function deserializeData(jsonString) {
    try {
        return JSON.parse(jsonString, (key, value) => {
            if (value && typeof value === 'object' && value.__type) {
                if (value.__type === 'Uint8Array') {
                    return new Uint8Array(value.data);
                }
                if (value.__type === 'Buffer') {
                    return Buffer.from(value.data);
                }
            }
            return value;
        });
    }
    catch (error) {
        console.error('Error deserializing data:', error);
        return {};
    }
}
/**
 * Database-based authentication state for WhatsApp
 * Replaces file system storage with database storage
 */
async function useDatabaseAuthState(sessionId) {
    // Initialize with default credentials
    let creds = (0, baileys_1.initAuthCreds)();
    const keys = {};
    // Load existing auth data from database
    const authDataList = await database_1.DatabaseService.getAuthData(sessionId);
    console.log(`[${sessionId}] Loading auth data from database, found ${authDataList.length} entries`);
    // Parse credentials
    const credsData = authDataList.find(data => data.key === 'creds.json');
    if (credsData) {
        try {
            const parsedCreds = deserializeData(credsData.value);
            // Validate credentials structure
            if (parsedCreds && typeof parsedCreds === 'object' && parsedCreds.noiseKey) {
                creds = parsedCreds;
                console.log(`[${sessionId}] Loaded valid credentials from database`);
            }
            else {
                console.log(`[${sessionId}] Invalid credentials structure, using defaults`);
                creds = (0, baileys_1.initAuthCreds)();
            }
        }
        catch (error) {
            console.error(`[${sessionId}] Error parsing credentials:`, error);
            creds = (0, baileys_1.initAuthCreds)();
        }
    }
    // Parse keys
    authDataList.forEach(data => {
        if (data.key !== 'creds.json') {
            try {
                const keyData = deserializeData(data.value);
                const keyType = getKeyTypeFromFileName(data.key);
                if (keyType && keyData && typeof keyData === 'object') {
                    keys[keyType] = keyData;
                    console.log(`[${sessionId}] Loaded key type: ${keyType}`);
                }
            }
            catch (error) {
                console.error(`[${sessionId}] Error parsing key data ${data.key}:`, error);
            }
        }
    });
    const state = {
        creds,
        keys: {
            get: (type, ids) => {
                const key = keys[type];
                if (!key)
                    return {};
                return ids.reduce((dict, id) => {
                    const value = key[id];
                    if (value) {
                        dict[id] = value;
                    }
                    return dict;
                }, {});
            },
            set: (data) => {
                for (const type in data) {
                    keys[type] = keys[type] || {};
                    Object.assign(keys[type], data[type]);
                }
            }
        }
    };
    const saveCreds = async () => {
        try {
            console.log(`[${sessionId}] Saving credentials to database`);
            // Save credentials with binary serialization
            await database_1.DatabaseService.saveAuthData(sessionId, 'creds.json', serializeData(creds));
            // Save keys with binary serialization
            for (const keyType in keys) {
                const keyData = keys[keyType];
                if (keyData && typeof keyData === 'object' && Object.keys(keyData).length > 0) {
                    await database_1.DatabaseService.saveAuthData(sessionId, `${keyType}.json`, serializeData(keyData));
                    console.log(`[${sessionId}] Saved key type: ${keyType}`);
                }
            }
        }
        catch (error) {
            console.error(`[${sessionId}] Error saving credentials:`, error);
        }
    };
    const clearAuth = async () => {
        try {
            console.log(`[${sessionId}] Clearing auth data from database`);
            await database_1.DatabaseService.clearAuthData(sessionId);
        }
        catch (error) {
            console.error(`[${sessionId}] Error clearing auth data:`, error);
        }
    };
    return {
        state,
        saveCreds,
        clearAuth
    };
}
/**
 * Get key type from file name
 */
function getKeyTypeFromFileName(fileName) {
    const keyTypeMap = {
        'app-state-sync-key.json': 'app-state-sync-key',
        'app-state-sync-version.json': 'app-state-sync-version',
        'sender-key.json': 'sender-key',
        'sender-key-memory.json': 'sender-key-memory',
        'session.json': 'session',
        'pre-key.json': 'pre-key'
    };
    return keyTypeMap[fileName] || null;
}
//# sourceMappingURL=databaseAuth.js.map