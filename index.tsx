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

import { NavContextMenuPatchCallback } from "@api/ContextMenu";
import { ApplicationCommandInputType, ApplicationCommandOptionType, findOption, sendBotMessage } from "@api/Commands";
import { addMessagePreSendListener, MessageObject, removeMessagePreSendListener } from "@api/MessageEvents";
import { updateMessage } from "@api/MessageUpdater";
import { definePluginSettings, Settings } from "@api/Settings";
import ErrorBoundary from "@components/ErrorBoundary";
import { Devs } from "@utils/constants";
import { sendMessage } from "@utils/discord";
import { Logger } from "@utils/Logger";
import { ModalContent, ModalHeader, ModalRoot, openModal } from "@utils/modal";
import definePlugin, { OptionType } from "@utils/types";
import { Message } from "@vencord/discord-types";
import { findByPropsLazy } from "@webpack";
import { ChannelStore, FluxDispatcher, Forms, Menu, MessageStore, UserStore, useStateFromStores } from "@webpack/common";
import * as openpgp from "openpgp";

import { KeyManagement } from "./KeyManagement";
import { getUserKeys, setUserKeys } from "./storage";

const MessageActions = findByPropsLazy("sendMessage", "editMessage");
const logger = new Logger("PGPEncryption");

interface PGPKeys {
    publicKey: string;
    privateKey: string;
}

interface PGPMessage extends Message {
    pgpDecrypted?: boolean;
    pgpEncrypted?: boolean;
    pgpOriginalContent?: string;
}

// Déchiffrer un message PGP
async function decryptMessage(encryptedText: string, privateKey: string): Promise<string> {
    try {
        const message = await openpgp.readMessage({
            armoredMessage: encryptedText
        });
        
        const privateKeyObj = await openpgp.readPrivateKey({ armoredKey: privateKey });
        
        const { data: decrypted } = await openpgp.decrypt({
            message,
            decryptionKeys: privateKeyObj
        });
        
        return decrypted as string;
    } catch (error) {
        logger.error("Erreur de déchiffrement PGP:", error);
        return encryptedText;
    }
}

// Chiffrer un message PGP
async function encryptMessage(text: string, publicKey: string): Promise<string> {
    try {
        const publicKeyObj = await openpgp.readKey({ armoredKey: publicKey });
        
        const encrypted = await openpgp.encrypt({
            message: await openpgp.createMessage({ text }),
            encryptionKeys: publicKeyObj
        });
        
        return encrypted as string;
    } catch (error) {
        logger.error("Erreur de chiffrement PGP:", error);
        return text;
    }
}

// Détecte si le message contient un bloc PGP
function isPGPMessage(content: string): boolean {
    return content.includes("-----BEGIN PGP MESSAGE-----") && content.includes("-----END PGP MESSAGE-----");
}

const settings = definePluginSettings({
    autoDecrypt: {
        type: OptionType.BOOLEAN,
        description: "Déchiffrer automatiquement les messages PGP reçus",
        default: true,
    },
    autoEncrypt: {
        type: OptionType.BOOLEAN,
        description: "Chiffrer automatiquement les messages sortants pour les utilisateurs configurés",
        default: false,
    },
    showIndicator: {
        type: OptionType.BOOLEAN,
        description: "Afficher un indicateur 🔐 sur les messages chiffrés/déchiffrés",
        default: true,
    },
    logDebug: {
        type: OptionType.BOOLEAN,
        description: "Activer les logs de débogage dans la console",
        default: false,
    }
});

// Contexte menu pour accéder à la gestion des clés
const userContextMenuPatch: NavContextMenuPatchCallback = (children, { user }) => {
    if (!user) return;
    
    const keys = getUserKeys(user.id);
    const hasKeys = keys && (keys.publicKey || keys.privateKey);
    
    children.push(
        <Menu.MenuItem
            label="Gérer les clés PGP"
            id="pgp-manage-keys"
            icon={hasKeys ? () => <span>🔑</span> : undefined}
            action={() => {
                openModal(props => (
                    <ErrorBoundary>
                        <ModalRoot {...props}>
                            <ModalHeader>
                                <Forms.FormTitle tag="h2">
                                    Clés PGP pour {user.username}
                                </Forms.FormTitle>
                            </ModalHeader>
                            <ModalContent>
                                <KeyManagement userId={user.id} username={user.username} />
                            </ModalContent>
                        </ModalRoot>
                    </ErrorBoundary>
                ));
            }}
        />
    );
};

export default definePlugin({
    name: "PGPEncryption",
    description: "Chiffrement et déchiffrement automatique des messages avec PGP. Configurez les clés par utilisateur via le menu contextuel.",
    authors: [Devs.Ven],
    dependencies: ["MessageUpdaterAPI", "CommandsAPI", "MessageEventsAPI"],
    settings,

    contextMenus: {
        "user-context": userContextMenuPatch
    },

    commands: [
        {
            name: "pgp",
            description: "Envoyer un message chiffré PGP (une fois)",
            inputType: ApplicationCommandInputType.BUILT_IN,
            options: [
                {
                    name: "message",
                    description: "Le message à chiffrer et envoyer",
                    type: ApplicationCommandOptionType.STRING,
                    required: true
                }
            ],
            execute: async (args, ctx) => {
                try {
                    const message = findOption(args, "message", "");
                    const channel = ChannelStore.getChannel(ctx.channel.id);
                    
                    // Vérifier si c'est un DM
                    if (!channel?.recipients || channel.recipients.length !== 1) {
                        sendBotMessage(ctx.channel.id, {
                            content: "❌ Cette commande ne fonctionne que dans les messages privés (DM)."
                        });
                        return;
                    }
                    
                    const recipientId = channel.recipients[0];
                    const keys = getUserKeys(recipientId);
                    
                    if (!keys?.publicKey) {
                        sendBotMessage(ctx.channel.id, {
                            content: "❌ Aucune clé publique configurée pour cet utilisateur. Faites un clic droit sur l'utilisateur → Gérer les clés PGP."
                        });
                        return;
                    }
                    
                    // Chiffrer le message
                    const encrypted = await encryptMessage(message, keys.publicKey);
                    
                    // Envoyer le message chiffré
                    sendMessage(ctx.channel.id, { content: encrypted });
                    
                } catch (error) {
                    logger.error("Erreur lors du chiffrement:", error);
                    sendBotMessage(ctx.channel.id, {
                        content: "❌ Erreur lors du chiffrement du message: " + error
                    });
                }
            }
        },
        {
            name: "pgp-toggle",
            description: "Activer/désactiver le chiffrement automatique pour cette conversation",
            inputType: ApplicationCommandInputType.BUILT_IN,
            execute: async (args, ctx) => {
                try {
                    const channel = ChannelStore.getChannel(ctx.channel.id);
                    
                    // Vérifier si c'est un DM
                    if (!channel?.recipients || channel.recipients.length !== 1) {
                        sendBotMessage(ctx.channel.id, {
                            content: "❌ Cette commande ne fonctionne que dans les messages privés (DM)."
                        });
                        return;
                    }
                    
                    const recipientId = channel.recipients[0];
                    const currentState = Settings.plugins.PGPEncryption.autoEncrypt;
                    
                    // Toggle l'état
                    Settings.plugins.PGPEncryption.autoEncrypt = !currentState;
                    
                    const status = Settings.plugins.PGPEncryption.autoEncrypt ? "✅ activé" : "❌ désactivé";
                    const keys = getUserKeys(recipientId);
                    
                    let message = `Chiffrement automatique ${status} pour cette conversation.`;
                    
                    if (Settings.plugins.PGPEncryption.autoEncrypt && !keys?.publicKey) {
                        message += "\n⚠️ Attention : Aucune clé publique configurée pour cet utilisateur. Configurez-la via le menu contextuel.";
                    }
                    
                    sendBotMessage(ctx.channel.id, { content: message });
                    
                } catch (error) {
                    logger.error("Erreur lors du toggle:", error);
                    sendBotMessage(ctx.channel.id, {
                        content: "❌ Erreur lors du basculement: " + error
                    });
                }
            }
        }
    ],

    start() {
        this.preSend = async (channelId: string, message: MessageObject) => {
            if (!Settings.plugins.PGPEncryption?.autoEncrypt) return;
            if (isPGPMessage(message.content)) return; // Déjà chiffré
            
            const channel = ChannelStore.getChannel(channelId);
            
            if (channel?.recipients?.length === 1) {
                const recipientId = channel.recipients[0];
                const keys = getUserKeys(recipientId);
                
                if (keys?.publicKey) {
                    try {
                        message.content = await encryptMessage(message.content, keys.publicKey);
                        if (Settings.plugins.PGPEncryption.logDebug) {
                            logger.info("🔒 Message chiffré automatiquement pour", recipientId);
                        }
                    } catch (error) {
                        logger.error("❌ Erreur de chiffrement automatique:", error);
                    }
                }
            }
        };
        
        addMessagePreSendListener(this.preSend);
        logger.info("Plugin PGPEncryption démarré - gestion des clés disponible via menu contextuel");
    },

    stop() {
        removeMessagePreSendListener(this.preSend);
        logger.info("Plugin PGPEncryption arrêté");
    },

    // Fonction appelée par les patches (actuellement désactivée)
    async handleMessageCreate(data: any) {
        try {
            if (!Settings.plugins.PGPEncryption?.autoDecrypt) return;
            if (!data?.message?.content || !data?.message?.author?.id) return;
            
            const message = data.message;
            
            if (isPGPMessage(message.content)) {
                const keys = getUserKeys(message.author.id);
                
                if (keys?.privateKey) {
                    if (Settings.plugins.PGPEncryption.logDebug) {
                        logger.info("Tentative de déchiffrement du message de", message.author.id);
                    }
                    
                    const decrypted = await decryptMessage(message.content, keys.privateKey);
                    
                    if (decrypted !== message.content) {
                        const indicator = Settings.plugins.PGPEncryption.showIndicator ? "🔓 " : "";
                        message.content = indicator + decrypted;
                        message.pgpDecrypted = true;
                        message.pgpOriginalContent = data.message.content;
                        
                        // Mettre à jour le message dans le store
                        FluxDispatcher.dispatch({
                            type: "MESSAGE_UPDATE",
                            message: message
                        });
                    }
                }
            }
        } catch (error) {
            logger.error("Erreur dans handleMessageCreate:", error);
        }
    },

    processMessageContent(content: string, authorId: string) {
        // Cette fonction est synchrone et appelée lors du rendu
        // Le déchiffrement asynchrone est géré dans handleMessageCreate
        return content;
    },

    async encryptAndSend(channelId: string, content: string) {
        try {
            if (!Settings.plugins.PGPEncryption.autoEncrypt) {
                return MessageActions.sendMessage(channelId, { content });
            }

            const channel = ChannelStore.getChannel(channelId);
            
            if (channel?.recipients?.length === 1) {
                const recipientId = channel.recipients[0];
                const keys = getUserKeys(recipientId);
                
                if (keys?.publicKey && !isPGPMessage(content)) {
                    if (Settings.plugins.PGPEncryption.logDebug) {
                        logger.info("Chiffrement du message pour", recipientId);
                    }
                    
                    content = await encryptMessage(content, keys.publicKey);
                }
            }
            
            return MessageActions.sendMessage(channelId, { content });
        } catch (error) {
            logger.error("Erreur dans encryptAndSend:", error);
            return MessageActions.sendMessage(channelId, { content });
        }
    }
});