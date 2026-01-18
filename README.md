# PGP Encryption Plugin  for Vencord 
> Presumed compatible with equicord... in theory

<br>

Automatic encryption/decryption plugin for Discord messages with PGP.
> Thanks to copilot (claude-sonnet4.5) for helping me understand how to make a vencord plugin because it’s not super obvious. He also helped me make the markdown files but shh, you can barely tell.

## 🔐 Features

- **Automatic decryption**: Received PGP messages are automatically decrypted with your private key
- **Automatic encryption**: Your messages are automatically encrypted with the recipient’s public key
- **Per-user key management**: Configure PGP keys for each contact individually
- **Key generation**: Directly generate RSA 4096-bit key pairs
- **Key validation**: Verify your keys are valid before saving them

## 📦 Installation

1. Make sure you have Vencord installed from the GitHub repo:
   ```bash
   git clone https://github.com/Vendicated/Vencord
   ```
3. Clone the `pgpEncryptionPlugin` repo into `[Vencord]/src/userplugins/`
   ```bash
   mkdir -p Vencord/src/userplugins
   cd Vencord/src/userplugins
   git clone https://github.com/daisseur/pgpEncryptionPlugin
   ```
5. The `openpgp` dependency must be installed:
   ```bash
   # cd [Vencord]

   # If other dependencies have not been installed:
   # pnpm i --frozen-lock files
   
   pnpm add -w openpgp
   ```
6. Rebuild Vencord:
   ```bash
   pnpm build
   ```
7. Reload Discord / Vesktop (On Vesktop you must select the `dist` folder in `[Vencord]/dist`)
   __For the Discord app:__ Before reloading your **Discord app**, you’ll need to inject the new Vencord version with the plugin into Discord:
   ```
   pnpm inject
   ```

## 🚀 Usage

### Configuring keys for a user

1. **Right-click** the user (in the member list, a DM, etc.)
2. Select **"Manage PGP Keys"** in the context menu
3. In the window that opens:
   - **Public Key**: Paste your contact’s public key (to encrypt your messages)
   - **Private Key**: Paste your private key (to decrypt their messages)
   
### Key generation

If you don’t have PGP keys yet:

1. Open the key management window (see above)
2. Click **"🔑 Generate key pair"**
3. Wait a few seconds (RSA 4096-bit generation)
4. Click **"💾 Save"**
5. **Important**: Share your public key with your contact and obtain theirs

### Exchanging encrypted messages

#### Sending:
- Write your message normally
- If the recipient has a public key configured, the message will be automatically encrypted
- The message will appear as a PGP block

#### Receiving:
- Received PGP messages are automatically decrypted
- A 🔓 prefix indicates a decrypted message

## ⚙️ Settings

Access plugin settings via: **Vencord Settings > Plugins > PGP Encryption**

- **Automatically decrypt PGP messages**: Enables/disables automatic decryption
- **Automatically encrypt outgoing messages**: Enables/disables automatic encryption

## 🔒 Security

### ⚠️ Important

- **NEVER SHARE your private key** with anyone
- Keep a backup copy of your private keys in a safe place
- Keys are stored locally in Vencord (DataStore)
- This plugin uses RSA 4096 bits (industry standard)
  
> [!IMPORTANT]
> I plan to offer several options including RSA 2048/1024 bits with EDSA, but for now RSA generates a large key yet is secure — that’s what matters.

### Best practices

1. **Generate separate keys** for each contact if possible
2. **Always validate** keys before saving them
3. **Exchange public keys** via a secure channel (ideally in person)
4. **Renew your keys** regularly (recommended: every 1–2 years)

## 🛠️ Recommended workflow

### First exchange with a contact

1. **You (bob)**: Generate your key pair
2. **You (bob)**: Send your public key to your contact (via a secure channel)
3. **Your contact (alice)**: Sends you their public key
4. **You (bob)**: Configure keys in the context menu:
   - Their public key (to encrypt your messages)
   - Your private key (to decrypt theirs)
5. **Test**: Send a test message

## 📋 Key format

Keys must be in armored (ASCII) format:

**Public key (Alice's key)**:
```
-----BEGIN PGP PUBLIC KEY BLOCK-----

[key content]

-----END PGP PUBLIC KEY BLOCK-----
```

**Private key (Bob's key)**:
```
-----BEGIN PGP PRIVATE KEY BLOCK-----

[key content]

-----END PGP PRIVATE KEY BLOCK-----
```

## Troubleshooting

### Messages don’t decrypt
- Verify that **your private key** is correctly configured for that user
- Ensure the plugin is enabled and "Automatically decrypt" is checked
- Verify the key’s validity (click "✓ Validate keys")

### Messages don’t encrypt
- Verify that **the recipient’s public key** is correctly configured
- Ensure "Automatically encrypt" is checked
- Verify you’re in a DM (the plugin currently only works for direct messages)

### Key generation error
- Wait a few more seconds (RSA 4096 takes time)
- Reload Discord and try again
- Check the console for more details

## 🔧 Development

### Project structure

```
pgpEncryptionPlugin/
├── index.ts           # Main plugin with patches and logic
├── KeyManagement.tsx  # Key management interface
├── storage.ts         # DataStore utilities
└── README.md          # This file
```

### Dependencies

- `openpgp`: ^6.3.0 - PGP encryption library

## 📝 TODO
- [ ] Support for password-protected keys
- [ ] Export/Import configuration
- [ ] Visual indicator in UI showing who has a configured key
- [ ] Message digital signatures
- [ ] Key revocation
- [ ] Key expiration management

## 📄 License

This plugin is provided as-is, without warranty. Use at your own risk.

## 🤝 Contribution

Contributions are welcome! Feel free to open issues or pull requests.

---

**Author**: daisseur  
**Version**: 1.0.0  
**Compatible with**: Vencord (latest version)
