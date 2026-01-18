# Plugin PGP Encryption pour Vencord 
> Présupposé compatible avec equicord.. en théorie

<br>

<details>
<summary>Version anglaise</summary>

[English README](./README.md)

</details>


Plugin de chiffrement/déchiffrement automatique des messages Discord avec PGP.
> Plugin fait initialement en grande partie grâce à copilot (claude-sonnet 4.5) pour comprendre comment faire un plugin vencord parce que c'est vraiment pas évident.

## 🔐 Fonctionnalités

- **Déchiffrement automatique** : Les messages PGP reçus sont déchiffrés automatiquement avec votre clé privée
- **Chiffrement automatique** : Vos messages sont chiffrés automatiquement avec la clé publique du destinataire
- **Gestion des clés par utilisateur** : Configurez les clés PGP pour chaque contact individuellement
- **Génération de clés** : Générez directement des paires de clés RSA 4096 bits
- **Validation des clés** : Vérifiez que vos clés sont valides avant de les sauvegarder

## 📦 Installation

1. Assurez-vous d'avoir Vencord installé depuis le repo github:
   ```bash
   git clone https://github.com/Vendicated/Vencord
   ```

   <details>
    <summary>Installer Equicord</summary>
    ```bash
    git clone https://github.com/Equicord/Equicord
    ```
    </details>

3. cloner le repo `pgpEncryptionPlugin` dans `src/userplugins/`
   ```bash
   cd Vencord  # or Equicord
   mkdir -p src/userplugins
   cd src/userplugins

   git clone https://github.com/daisseur/pgpEncryptionPlugin
   ```
5. La dépendance `openpgp` doit être installée :
   ```bash
   # Si les autres dépendances n'ont pas été installées:
   # pnpm i --frozen-lock files
   
   pnpm add -w openpgp
   ```
6. Rebuild Vencord/Equicord :
   ```bash
   pnpm build
   ```
7. Rechargez Discord / Vesktop (Sur vekstop il faut choisir le dossier `dist` dans `[Vencord/Equicord]/dist`)
   __Pour l'application discord :__ Avant de recharger votre **application discord** vous allez devoir injecter la nouvelle version Vencord avec le plugin dans discord:
   ```
   pnpm inject
   ```

## 🚀 Utilisation

### Configuration des clés pour un utilisateur

1. **Faites un clic droit** sur l'utilisateur (dans la liste des membres, un DM, etc.)
2. Sélectionnez **"Gérer les clés PGP"** dans le menu contextuel
3. Dans la fenêtre qui s'ouvre :
   - **Clé Publique** : Collez la clé publique de votre contact (pour chiffrer vos messages)
   - **Clé Privée** : Collez votre clé privée (pour déchiffrer ses messages)
   
### Génération de clés

Si vous n'avez pas encore de clés PGP :

1. Ouvrez la fenêtre de gestion des clés (voir ci-dessus)
2. **Sélectionnez le type de clé** : RSA (2048/4096) ou ECC/ECDSA (Curve25519, P-256, P-384, P-521, secp256k1, Brainpool...)
   - **Recommandé** : Curve25519 (rapide, sécurisé) ou RSA 4096 (standard)
3. Cliquez sur **"🔑 Générer une paire de clés"**
4. Attendez quelques secondes
5. Cliquez sur **"💾 Sauvegarder"**
6. **Important** : Partagez votre clé publique avec votre contact et récupérez sa clé publique

### Échange de messages chiffrés

#### Envoi :
- Écrivez normalement votre message
- Si le destinataire a une clé publique configurée, le message sera automatiquement chiffré
- Le message apparaîtra sous forme de bloc PGP

#### Réception :
- Les messages PGP reçus sont automatiquement déchiffrés
- Un préfixe 🔓 indique un message déchiffré

## ⚙️ Paramètres

Accédez aux paramètres du plugin via : **Paramètres Vencord > Plugins > PGP Encryption**

- **Déchiffrer automatiquement les messages PGP** : Active/désactive le déchiffrement automatique
- **Chiffrer automatiquement les messages sortants** : Active/désactive le chiffrement automatique
- **Encoder les messages chiffrés en base64** : Rend les messages chiffrés plus compacts (décodage automatique à la réception)

## 🔒 Sécurité

### ⚠️ Important

- **NE PARTAGEZ JAMAIS votre clé privée** avec qui que ce soit
- Conservez une copie de sauvegarde de vos clés privées en lieu sûr
- Les clés sont stockées localement dans Vencord (DataStore)
- Ce plugin utilise RSA 4096 bits (standard industriel)
  
> [!IMPORTANT]
> Je compte proposer plusieurs options dont RSA 2048/1024 bits avec EDSA, mais bon pour l'instant RSA génère une grosse clé mais est secure, c'est ce qui compte.

### Bonnes pratiques

1. **Générez des clés séparées** pour chaque contact si possible
2. **Validez toujours** les clés avant de les sauvegarder
3. **Échangez les clés publiques** par un canal sécurisé (idéalement en personne)
4. **Renouvelez vos clés** régulièrement (recommandé : tous les 1-2 ans)

## 🛠️ Workflow recommandé

### Premier échange avec un contact

1. **Vous (bob)** : Générez votre paire de clés
2. **Vous (bob)** : Envoyez votre clé publique à votre contact (par un canal sécurisé)
3. **Votre contact (alice)** : Vous envoie sa clé publique
4. **Vous (bob)** : Configurez les clés dans le menu contextuel :
   - Sa clé publique (pour chiffrer vos messages)
   - Votre clé privée (pour déchiffrer ses messages)
5. **Testez** : Envoyez un message de test

## 📋 Format des clés

Les clés doivent être au format armored (ASCII) :

**Clé publique (Alice's key)** :
```
-----BEGIN PGP PUBLIC KEY BLOCK-----

[contenu de la clé]

-----END PGP PUBLIC KEY BLOCK-----
```

**Clé privée (Bob's key)** :
```
-----BEGIN PGP PRIVATE KEY BLOCK-----

[contenu de la clé]

-----END PGP PRIVATE KEY BLOCK-----
```

## Dépannage

### Les messages ne se déchiffrent pas
- Vérifiez que vous avez bien configuré **votre clé privée** pour cet utilisateur
- Assurez-vous que le plugin est activé et que l'option "Déchiffrer automatiquement" est cochée
- Vérifiez que la clé est valide (bouton "✓ Valider les clés")

### Les messages ne se chiffrent pas
- Vérifiez que vous avez bien configuré **la clé publique du destinataire**
- Assurez-vous que l'option "Chiffrer automatiquement" est cochée
- Vérifiez que vous êtes dans un DM (le plugin ne fonctionne actuellement que pour les messages directs)

### Erreur lors de la génération de clés
- Attendez quelques secondes supplémentaires (RSA 4096 prend du temps)
- Rechargez Discord et réessayez
- Vérifiez la console pour plus de détails

## 🔧 Développement

### Structure du projet

```
pgpEncryptionPlugin/
├── index.ts           # Plugin principal avec patches et logique
├── KeyManagement.tsx  # Interface de gestion des clés
├── storage.ts         # Utilitaires de stockage DataStore
└── README.md          # Ce fichier
```

### Dépendances

- `openpgp` : ^6.3.0 - Bibliothèque de chiffrement PGP

## 📝 TODO
- [ ] Support des clés protégées par mot de passe
- [ ] Export/Import de configuration
- [ ] Indicateur visuel dans l'interface pour voir qui a une clé configurée
- [ ] Signatures numériques des messages
- [ ] Révocation de clés
- [ ] Gestion de l'expiration des clés

## 📄 Licence

Ce plugin est fourni tel quel, sans garantie. Utilisez-le à vos propres risques.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir des issues ou des pull requests.

---

**Auteur** : daisseur  
**Version** : 1.0.0  
**Compatible avec** : Vencord (dernière version)