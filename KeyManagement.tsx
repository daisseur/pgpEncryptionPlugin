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
    const [keyType, setKeyType] = useState("rsa4096");

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
            
            let keyOptions: any = {
                userIDs: [{ name: username }],
                format: "armored"
            };

            switch (keyType) {
                case "rsa2048":
                    keyOptions.type = "rsa";
                    keyOptions.rsaBits = 2048;
                    break;
                case "rsa4096":
                    keyOptions.type = "rsa";
                    keyOptions.rsaBits = 4096;
                    break;
                case "ecc-curve25519":
                    keyOptions.type = "ecc";
                    keyOptions.curve = "curve25519";
                    break;
                case "ecc-p256":
                    keyOptions.type = "ecc";
                    keyOptions.curve = "p256";
                    break;
                case "ecc-p384":
                    keyOptions.type = "ecc";
                    keyOptions.curve = "p384";
                    break;
                case "ecc-p521":
                    keyOptions.type = "ecc";
                    keyOptions.curve = "p521";
                    break;
                case "ecc-secp256k1":
                    keyOptions.type = "ecc";
                    keyOptions.curve = "secp256k1";
                    break;
                case "ecc-brainpoolP256r1":
                    keyOptions.type = "ecc";
                    keyOptions.curve = "brainpoolP256r1";
                    break;
                case "ecc-brainpoolP384r1":
                    keyOptions.type = "ecc";
                    keyOptions.curve = "brainpoolP384r1";
                    break;
                case "ecc-brainpoolP512r1":
                    keyOptions.type = "ecc";
                    keyOptions.curve = "brainpoolP512r1";
                    break;
                default:
                    keyOptions.type = "rsa";
                    keyOptions.rsaBits = 4096;
            }
            
            const { privateKey: newPrivateKey, publicKey: newPublicKey } = await openpgp.generateKey(keyOptions);
            
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

            <Forms.FormTitle tag="h3">Key Type for Generation</Forms.FormTitle>
            <Forms.FormText style={{ marginBottom: "8px" }}>
                Select the key type to generate:
            </Forms.FormText>
            <select
                value={keyType}
                onChange={e => setKeyType(e.target.value)}
                style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    backgroundColor: "var(--input-background)",
                    color: "var(--text-normal)",
                    border: "1px solid var(--background-tertiary)",
                    marginBottom: "16px"
                }}
            >
                <optgroup label="RSA (Slower, larger keys)">
                    <option value="rsa2048">RSA 2048 - Fast generation, less secure</option>
                    <option value="rsa4096">RSA 4096 - Recommended, secure and standard</option>
                </optgroup>
                <optgroup label="ECC/ECDSA (Faster, smaller keys)">
                    <option value="ecc-curve25519">Curve25519 - Modern, very secure, recommended</option>
                    <option value="ecc-p256">P-256 - NIST standard curve</option>
                    <option value="ecc-p384">P-384 - NIST high security curve</option>
                    <option value="ecc-p521">P-521 - NIST highest security curve</option>
                    <option value="ecc-secp256k1">secp256k1 - Bitcoin/Ethereum curve</option>
                    <option value="ecc-brainpoolP256r1">Brainpool P256 - European standard</option>
                    <option value="ecc-brainpoolP384r1">Brainpool P384 - European high security</option>
                    <option value="ecc-brainpoolP512r1">Brainpool P512 - European highest security</option>
                </optgroup>
            </select>

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
