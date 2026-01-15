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

import ErrorBoundary from "@components/ErrorBoundary";
import { Margins } from "@utils/margins";
import { Logger } from "@utils/Logger";
import { Button, Forms, TextArea, useEffect, useState } from "@webpack/common";
import * as openpgp from "openpgp";

import { getUserKeys, setUserKeys } from "./storage";

const logger = new Logger("PGPEncryption:KeyManagement");

interface KeyManagementProps {
    userId: string;
    username: string;
}

export function KeyManagementBase({ userId, username }: KeyManagementProps) {
    const [publicKey, setPublicKey] = useState("");
    const [privateKey, setPrivateKey] = useState("");
    const [message, setMessage] = useState("");

    // Charger les clés au montage du composant
    useEffect(() => {
        const storedKeys = getUserKeys(userId);
        if (storedKeys) {
            setPublicKey(storedKeys.publicKey || "");
            setPrivateKey(storedKeys.privateKey || "");
        }
    }, [userId]);

    const handleSave = async () => {
        try {
            setMessage("💾 Sauvegarde en cours...");
            await setUserKeys(userId, { publicKey, privateKey });
            setMessage("✅ Clés sauvegardées avec succès!");
            logger.info("Clés sauvegardées pour l'utilisateur", userId);
        } catch (error) {
            const errorMsg = "❌ Erreur lors de la sauvegarde: " + error;
            setMessage(errorMsg);
            logger.error("Erreur de sauvegarde:", error);
        }
    };

    const handleGenerateKeys = async () => {
        try {
            setMessage("🔄 Génération des clés en cours...");
            
            const { privateKey: newPrivateKey, publicKey: newPublicKey } = await openpgp.generateKey({
                type: "rsa",
                rsaBits: 4096,
                userIDs: [{ name: username }],
                format: "armored"
            });
            
            setPublicKey(newPublicKey);
            setPrivateKey(newPrivateKey);
            setMessage("✅ Clés générées! N'oubliez pas de sauvegarder.");
        } catch (error) {
            setMessage("❌ Erreur lors de la génération: " + error);
        }
    };

    const handleValidate = async () => {
        try {
            if (publicKey) {
                await openpgp.readKey({ armoredKey: publicKey });
                setMessage("✅ Clé publique valide!");
            }
            if (privateKey) {
                await openpgp.readPrivateKey({ armoredKey: privateKey });
                setMessage(msg => msg + " Clé privée valide!");
            }
        } catch (error) {
            setMessage("❌ Clé invalide: " + error);
        }
    };

    const handleClear = async () => {
        try {
            setPublicKey("");
            setPrivateKey("");
            await setUserKeys(userId, { publicKey: "", privateKey: "" });
            setMessage("🗑️ Clés supprimées");
            logger.info("Clés supprimées pour l'utilisateur", userId);
        } catch (error) {
            setMessage("❌ Erreur lors de la suppression: " + error);
            logger.error("Erreur de suppression:", error);
        }
    };

    return (
        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <Forms.FormText>
                Configurez les clés PGP pour <strong>{username}</strong> (ID: {userId})
            </Forms.FormText>

            <Forms.FormDivider className={Margins.top8} />

            <Forms.FormTitle tag="h3">Clé Publique (pour chiffrer les messages envoyés)</Forms.FormTitle>
            <Forms.FormText>
                Collez ici la clé publique de l'utilisateur pour chiffrer les messages que vous lui envoyez.
            </Forms.FormText>
            <TextArea
                value={publicKey}
                onChange={setPublicKey}
                placeholder="-----BEGIN PGP PUBLIC KEY BLOCK-----&#10;...&#10;-----END PGP PUBLIC KEY BLOCK-----"
                rows={6}
                style={{ fontFamily: "monospace", fontSize: "11px" }}
            />

            <Forms.FormTitle tag="h3" className={Margins.top16}>Clé Privée (pour déchiffrer les messages reçus)</Forms.FormTitle>
            <Forms.FormText>
                Collez ici VOTRE clé privée pour déchiffrer les messages que cet utilisateur vous envoie.
            </Forms.FormText>
            <TextArea
                value={privateKey}
                onChange={setPrivateKey}
                placeholder="-----BEGIN PGP PRIVATE KEY BLOCK-----&#10;...&#10;-----END PGP PRIVATE KEY BLOCK-----"
                rows={6}
                style={{ fontFamily: "monospace", fontSize: "11px" }}
            />

            {message && (
                <Forms.FormText
                    style={{ 
                        padding: "12px", 
                        borderRadius: "4px", 
                        backgroundColor: "var(--background-secondary-alt)",
                        border: "1px solid var(--background-tertiary)"
                    }}
                >
                    {message}
                </Forms.FormText>
            )}

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }} className={Margins.top8}>
                <Button onClick={handleSave} color={Button.Colors.GREEN} size={Button.Sizes.SMALL}>
                    💾 Sauvegarder
                </Button>
                <Button onClick={handleGenerateKeys} color={Button.Colors.BRAND} size={Button.Sizes.SMALL}>
                    🔑 Générer une paire de clés
                </Button>
                <Button onClick={handleValidate} color={Button.Colors.PRIMARY} size={Button.Sizes.SMALL}>
                    ✓ Valider les clés
                </Button>
                <Button onClick={handleClear} color={Button.Colors.RED} size={Button.Sizes.SMALL}>
                    🗑️ Supprimer
                </Button>
            </div>

            <Forms.FormDivider className={Margins.top16} />
            
            <Forms.FormText style={{ fontSize: "12px", opacity: 0.8 }}>
                💡 <strong>Note:</strong> La clé publique sera utilisée pour chiffrer les messages que vous envoyez à cet utilisateur. 
                La clé privée sera utilisée pour déchiffrer les messages que vous recevez de cet utilisateur.
            </Forms.FormText>

            <Forms.FormText style={{ fontSize: "12px", opacity: 0.8 }}>
                ⚠️ <strong>Sécurité:</strong> Conservez votre clé privée en lieu sûr. Ne la partagez jamais avec personne!
            </Forms.FormText>
        </div>
    );
}

// Wrapper avec ErrorBoundary comme dans messageLogger
export const KeyManagement = ErrorBoundary.wrap(KeyManagementBase, { 
    fallback: () => (
        <div style={{ padding: "16px" }}>
            <Forms.FormText style={{ color: "var(--text-danger)" }}>
                ❌ Une erreur s'est produite lors du chargement de l'interface de gestion des clés.
            </Forms.FormText>
        </div>
    )
});
