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

// Cache en mémoire pour éviter les appels répétés à DataStore
let keysCache: Record<string, PGPKeys> = {};
let cacheLoaded = false;

// Charger le cache depuis DataStore
async function loadCache(): Promise<void> {
    if (cacheLoaded) return;
    
    try {
        keysCache = await DataStore.get(STORAGE_KEY) || {};
        cacheLoaded = true;
    } catch (error) {
        logger.error("Erreur lors du chargement du cache:", error);
        keysCache = {};
    }
}

// Sauvegarder le cache dans DataStore
async function saveCache(): Promise<void> {
    try {
        await DataStore.set(STORAGE_KEY, keysCache);
    } catch (error) {
        logger.error("Erreur lors de la sauvegarde du cache:", error);
        throw error;
    }
}

// Récupérer les clés d'un utilisateur (synchrone via cache)
export function getUserKeys(userId: string): PGPKeys | null {
    try {
        // Charger le cache au premier appel
        if (!cacheLoaded) {
            loadCache();
        }
        return keysCache[userId] || null;
    } catch (error) {
        logger.error("Erreur lors de la récupération des clés:", error);
        return null;
    }
}

// Sauvegarder les clés d'un utilisateur
export async function setUserKeys(userId: string, keys: PGPKeys): Promise<void> {
    try {
        // Assurer que le cache est chargé
        await loadCache();
        
        if (!keys.publicKey && !keys.privateKey) {
            // Supprimer l'entrée si les deux clés sont vides
            delete keysCache[userId];
        } else {
            keysCache[userId] = keys;
        }
        
        await saveCache();
    } catch (error) {
        logger.error("Erreur lors de la sauvegarde des clés:", error);
        throw error;
    }
}

// Obtenir toutes les clés (pour debug/export)
export async function getAllKeys(): Promise<Record<string, PGPKeys>> {
    try {
        await loadCache();
        return { ...keysCache };
    } catch (error) {
        logger.error("Erreur lors de la récupération de toutes les clés:", error);
        return {};
    }
}

// Supprimer toutes les clés (pour reset complet)
export async function clearAllKeys(): Promise<void> {
    try {
        keysCache = {};
        await saveCache();
    } catch (error) {
        logger.error("Erreur lors de la suppression des clés:", error);
        throw error;
    }
}

// Initialiser le cache au démarrage
export async function initStorage(): Promise<void> {
    await loadCache();
}
