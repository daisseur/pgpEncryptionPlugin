/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2024 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import * as DataStore from "@api/DataStore";
import { Logger } from "@utils/Logger";

export interface PGPKeys {
    publicKey: string;
    privateKey: string;
}

const STORAGE_KEY = "pgp-encryption-keys";
const logger = new Logger("PGPEncryption:Storage");

// In-memory cache to avoid repeated calls to DataStore
let keysCache: Record<string, PGPKeys> = {};
let cacheLoaded = false;

// Load cache from DataStore
async function loadCache(): Promise<void> {
    if (cacheLoaded) return;
    
    try {
        keysCache = await DataStore.get(STORAGE_KEY) || {};
        cacheLoaded = true;
    } catch (error) {
        logger.error("Error loading cache:", error);
        keysCache = {};
    }
}

// Save cache to DataStore
async function saveCache(): Promise<void> {
    try {
        await DataStore.set(STORAGE_KEY, keysCache);
    } catch (error) {
        logger.error("Error saving cache:", error);
        throw error;
    }
}

// Get a user's keys (synchronous via cache)
export function getUserKeys(userId: string): PGPKeys | null {
    try {
        // Load cache on first call
        if (!cacheLoaded) {
            loadCache();
        }
        return keysCache[userId] || null;
    } catch (error) {
        logger.error("Error retrieving keys:", error);
        return null;
    }
}

// Save a user's keys
export async function setUserKeys(userId: string, keys: PGPKeys): Promise<void> {
    try {
        // Ensure cache is loaded
        await loadCache();
        
        if (!keys.publicKey && !keys.privateKey) {
            // Remove entry if both keys are empty
            delete keysCache[userId];
        } else {
            keysCache[userId] = keys;
        }
        
        await saveCache();
    } catch (error) {
        logger.error("Error saving keys:", error);
        throw error;
    }
}

// Get all keys (for debug/export)
export async function getAllKeys(): Promise<Record<string, PGPKeys>> {
    try {
        await loadCache();
        return { ...keysCache };
    } catch (error) {
        logger.error("Error retrieving all keys:", error);
        return {};
    }
}

// Delete all keys (for complete reset)
export async function clearAllKeys(): Promise<void> {
    try {
        keysCache = {};
        await saveCache();
    } catch (error) {
        logger.error("Error deleting keys:", error);
        throw error;
    }
}

// Initialize cache on startup
export async function initStorage(): Promise<void> {
    await loadCache();
}
