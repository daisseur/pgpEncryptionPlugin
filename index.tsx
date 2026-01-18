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

// Decrypt a PGP message
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
        logger.error("PGP decryption error:", error);
        return encryptedText;
    }
}

// Encrypt a PGP message
async function encryptMessage(text: string, publicKey: string): Promise<string> {
    try {
        const publicKeyObj = await openpgp.readKey({ armoredKey: publicKey });
        
        const encrypted = await openpgp.encrypt({
            message: await openpgp.createMessage({ text }),
            encryptionKeys: publicKeyObj
        });
        
        return encrypted as string;
    } catch (error) {
        logger.error("PGP encryption error:", error);
        return text;
    }
}

// Detects if the message contains a PGP block
function isPGPMessage(content: string): boolean {
    return content.includes("-----BEGIN PGP MESSAGE-----") && content.includes("-----END PGP MESSAGE-----");
}

const settings = definePluginSettings({
    autoDecrypt: {
        type: OptionType.BOOLEAN,
        description: "Automatically decrypt received PGP messages",
        default: true,
    },
    autoEncrypt: {
        type: OptionType.BOOLEAN,
        description: "Automatically encrypt outgoing messages for configured users",
        default: false,
    },
    showIndicator: {
        type: OptionType.BOOLEAN,
        description: "Show a 🔓 indicator on encrypted/decrypted messages",
        default: true,
    },
    logDebug: {
        type: OptionType.BOOLEAN,
        description: "Enable debug logs in the console",
        default: false,
    }
});

// Context menu to access key management
const userContextMenuPatch: NavContextMenuPatchCallback = (children, { user }) => {
    if (!user) return;
    
    const keys = getUserKeys(user.id);
    const hasKeys = keys && (keys.publicKey || keys.privateKey);
    
    children.push(
        <Menu.MenuItem
            label="Manage PGP Keys"
            id="pgp-manage-keys"
            icon={hasKeys ? () => <span>🔑</span> : undefined}
            action={() => {
                openModal(props => (
                    <ErrorBoundary>
                        <ModalRoot {...props}>
                            <ModalHeader>
                                <Forms.FormTitle tag="h2">
                                    PGP Keys for {user.username}
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
    description: "Automatic encryption and decryption of messages with PGP. Configure keys per user via the context menu.",
    authors: [Devs.Ven],
    dependencies: ["MessageUpdaterAPI", "CommandsAPI", "MessageEventsAPI"],
    settings,

    contextMenus: {
        "user-context": userContextMenuPatch
    },

    commands: [
        {
            name: "pgp",
            description: "Send an encrypted PGP message (one time)",
            inputType: ApplicationCommandInputType.BUILT_IN,
            options: [
                {
                    name: "message",
                    description: "The message to encrypt and send",
                    type: ApplicationCommandOptionType.STRING,
                    required: true
                }
            ],
            execute: async (args, ctx) => {
                try {
                    const message = findOption(args, "message", "");
                    const channel = ChannelStore.getChannel(ctx.channel.id);
                    
                    // Check if it's a DM
                    if (!channel?.recipients || channel.recipients.length !== 1) {
                        sendBotMessage(ctx.channel.id, {
                            content: "❌ This command only works in private messages (DM)."
                        });
                        return;
                    }
                    
                    const recipientId = channel.recipients[0];
                    const keys = getUserKeys(recipientId);
                    
                    if (!keys?.publicKey) {
                        sendBotMessage(ctx.channel.id, {
                            content: "❌ No public key configured for this user. Right-click on the user → Manage PGP Keys."
                        });
                        return;
                    }
                    
                    // Encrypt the message
                    const encrypted = await encryptMessage(message, keys.publicKey);
                    
                    // Send the encrypted message
                    sendMessage(ctx.channel.id, { content: encrypted });
                    
                } catch (error) {
                    logger.error("Error during encryption:", error);
                    sendBotMessage(ctx.channel.id, {
                        content: "❌ Error encrypting message: " + error
                    });
                }
            }
        },
        {
            name: "pgp-toggle",
            description: "Enable/disable automatic encryption for this conversation",
            inputType: ApplicationCommandInputType.BUILT_IN,
            execute: async (args, ctx) => {
                try {
                    const channel = ChannelStore.getChannel(ctx.channel.id);
                    
                    // Check if it's a DM
                    if (!channel?.recipients || channel.recipients.length !== 1) {
                        sendBotMessage(ctx.channel.id, {
                            content: "❌ This command only works in private messages (DM)."
                        });
                        return;
                    }
                    
                    const recipientId = channel.recipients[0];
                    const currentState = Settings.plugins.PGPEncryption.autoEncrypt;
                    
                    // Toggle the state
                    Settings.plugins.PGPEncryption.autoEncrypt = !currentState;
                    
                    const status = Settings.plugins.PGPEncryption.autoEncrypt ? "✅ enabled" : "❌ disabled";
                    const keys = getUserKeys(recipientId);
                    
                    let message = `Automatic encryption ${status} for this conversation.`;
                    
                    if (Settings.plugins.PGPEncryption.autoEncrypt && !keys?.publicKey) {
                        message += "\n⚠️ Warning: No public key configured for this user. Configure it via the context menu.";
                    }
                    
                    sendBotMessage(ctx.channel.id, { content: message });
                    
                } catch (error) {
                    logger.error("Error during toggle:", error);
                    sendBotMessage(ctx.channel.id, {
                        content: "❌ Error toggling: " + error
                    });
                }
            }
        }
    ],

    start() {
        this.preSend = async (channelId: string, message: MessageObject) => {
            if (!Settings.plugins.PGPEncryption?.autoEncrypt) return;
            if (isPGPMessage(message.content)) return; // Already encrypted
            
            const channel = ChannelStore.getChannel(channelId);
            
            if (channel?.recipients?.length === 1) {
                const recipientId = channel.recipients[0];
                const keys = getUserKeys(recipientId);
                
                if (keys?.publicKey) {
                    try {
                        message.content = await encryptMessage(message.content, keys.publicKey);
                        if (Settings.plugins.PGPEncryption.logDebug) {
                            logger.info("🔒 Message automatically encrypted for", recipientId);
                        }
                    } catch (error) {
                        logger.error("❌ Automatic encryption error:", error);
                    }
                }
            }
        };
        
        addMessagePreSendListener(this.preSend);
        logger.info("PGPEncryption plugin started - key management available via context menu");
    },

    stop() {
        removeMessagePreSendListener(this.preSend);
        logger.info("PGPEncryption plugin stopped");
    },

    // Function called by patches (currently disabled)
    async handleMessageCreate(data: any) {
        try {
            if (!Settings.plugins.PGPEncryption?.autoDecrypt) return;
            if (!data?.message?.content || !data?.message?.author?.id) return;
            
            const message = data.message;
            
            if (isPGPMessage(message.content)) {
                const keys = getUserKeys(message.author.id);
                
                if (keys?.privateKey) {
                    if (Settings.plugins.PGPEncryption.logDebug) {
                        logger.info("Attempting to decrypt message from", message.author.id);
                    }
                    
                    const decrypted = await decryptMessage(message.content, keys.privateKey);
                    
                    if (decrypted !== message.content) {
                        const indicator = Settings.plugins.PGPEncryption.showIndicator ? "🔓 " : "";
                        message.content = indicator + decrypted;
                        message.pgpDecrypted = true;
                        message.pgpOriginalContent = data.message.content;
                        
                        // Update the message in the store
                        FluxDispatcher.dispatch({
                            type: "MESSAGE_UPDATE",
                            message: message
                        });
                    }
                }
            }
        } catch (error) {
            logger.error("Error in handleMessageCreate:", error);
        }
    },

    processMessageContent(content: string, authorId: string) {
        // This function is synchronous and called during rendering
        // Asynchronous decryption is handled in handleMessageCreate
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
                        logger.info("Encrypting message for", recipientId);
                    }
                    
                    content = await encryptMessage(content, keys.publicKey);
                }
            }
            
            return MessageActions.sendMessage(channelId, { content });
        } catch (error) {
            logger.error("Error in encryptAndSend:", error);
            return MessageActions.sendMessage(channelId, { content });
        }
    }
});
