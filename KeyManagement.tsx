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

    // Load keys on component mount
    useEffect(() => {
        const storedKeys = getUserKeys(userId);
        if (storedKeys) {
            setPublicKey(storedKeys.publicKey || "");
            setPrivateKey(storedKeys.privateKey || "");
        }
    }, [userId]);

    const handleSave = async () => {
        try {
            setMessage("💾 Saving...");
            await setUserKeys(userId, { publicKey, privateKey });
            setMessage("✅ Keys saved successfully!");
            logger.info("Keys saved for user", userId);
        } catch (error) {
            const errorMsg = "❌ Error saving: " + error;
            setMessage(errorMsg);
            logger.error("Save error:", error);
        }
    };

    const handleGenerateKeys = async () => {
        try {
            setMessage("🔄 Generating keys...");
            
            const { privateKey: newPrivateKey, publicKey: newPublicKey } = await openpgp.generateKey({
                type: "rsa",
                rsaBits: 4096,
                userIDs: [{ name: username }],
                format: "armored"
            });
            
            setPublicKey(newPublicKey);
            setPrivateKey(newPrivateKey);
            setMessage("✅ Keys generated! Don't forget to save.");
        } catch (error) {
            setMessage("❌ Error generating: " + error);
        }
    };

    const handleValidate = async () => {
        try {
            if (publicKey) {
                await openpgp.readKey({ armoredKey: publicKey });
                setMessage("✅ Public key valid!");
            }
            if (privateKey) {
                await openpgp.readPrivateKey({ armoredKey: privateKey });
                setMessage(msg => msg + " Private key valid!");
            }
        } catch (error) {
            setMessage("❌ Invalid key: " + error);
        }
    };

    const handleClear = async () => {
        try {
            setPublicKey("");
            setPrivateKey("");
            await setUserKeys(userId, { publicKey: "", privateKey: "" });
            setMessage("🗑️ Keys deleted");
            logger.info("Keys deleted for user", userId);
        } catch (error) {
            setMessage("❌ Error deleting: " + error);
            logger.error("Delete error:", error);
        }
    };

    return (
        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <Forms.FormText>
                Configure PGP keys for <strong>{username}</strong> (ID: {userId})
            </Forms.FormText>

            <Forms.FormDivider className={Margins.top8} />

            <Forms.FormTitle tag="h3">Public Key (to encrypt sent messages)</Forms.FormTitle>
            <Forms.FormText>
                Paste the user's public key here to encrypt messages you send to them.
            </Forms.FormText>
            <TextArea
                value={publicKey}
                onChange={setPublicKey}
                placeholder="-----BEGIN PGP PUBLIC KEY BLOCK-----&#10;...&#10;-----END PGP PUBLIC KEY BLOCK-----"
                rows={6}
                style={{ fontFamily: "monospace", fontSize: "11px" }}
            />

            <Forms.FormTitle tag="h3" className={Margins.top16}>Private Key (to decrypt received messages)</Forms.FormTitle>
            <Forms.FormText>
                Paste YOUR private key here to decrypt messages this user sends you.
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
                    💾 Save
                </Button>
                <Button onClick={handleGenerateKeys} color={Button.Colors.BRAND} size={Button.Sizes.SMALL}>
                    🔑 Generate a key pair
                </Button>
                <Button onClick={handleValidate} color={Button.Colors.PRIMARY} size={Button.Sizes.SMALL}>
                    ✓ Validate keys
                </Button>
                <Button onClick={handleClear} color={Button.Colors.RED} size={Button.Sizes.SMALL}>
                    🗑️ Delete
                </Button>
            </div>

            <Forms.FormDivider className={Margins.top16} />
            
            <Forms.FormText style={{ fontSize: "12px", opacity: 0.8 }}>
                💡 <strong>Note:</strong> The public key will be used to encrypt messages you send to this user. 
                The private key will be used to decrypt messages you receive from this user.
            </Forms.FormText>

            <Forms.FormText style={{ fontSize: "12px", opacity: 0.8 }}>
                ⚠️ <strong>Security:</strong> Keep your private key in a safe place. Never share it with anyone!
            </Forms.FormText>
        </div>
    );
}

// Wrapper with ErrorBoundary as in messageLogger
export const KeyManagement = ErrorBoundary.wrap(KeyManagementBase, { 
    fallback: () => (
        <div style={{ padding: "16px" }}>
            <Forms.FormText style={{ color: "var(--text-danger)" }}>
                ❌ An error occurred while loading the key management interface.
            </Forms.FormText>
        </div>
    )
});
