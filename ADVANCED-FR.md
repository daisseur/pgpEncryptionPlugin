# Configuration avancée

## Export/Import manuel des clés

Si vous souhaitez sauvegarder ou transférer vos clés manuellement, vous pouvez utiliser la console de développement.

### Export de toutes les clés

```javascript
// Ouvrir la console (Ctrl+Shift+I)
const keys = Vencord.Plugins.plugins["PGP Encryption"].getAllKeys();
console.log(JSON.stringify(keys, null, 2));
// Copiez le résultat et sauvegardez-le dans un fichier sécurisé
```

### Import de clés

```javascript
// Ouvrir la console (Ctrl+Shift+I)
const keysToImport = {
    "USER_ID_1": {
        "publicKey": "-----BEGIN PGP PUBLIC KEY BLOCK-----\n...",
        "privateKey": "-----BEGIN PGP PRIVATE KEY BLOCK-----\n..."
    }
};

Object.entries(keysToImport).forEach(([userId, keys]) => {
    Vencord.Plugins.plugins["PGP Encryption"].setUserKeys(userId, keys);
});
```

## Utilisation programmatique

### Chiffrer un message manuellement

```javascript
const encrypted = await Vencord.Plugins.plugins["PGP Encryption"].encryptMessage(
    "Mon message secret",
    publicKeyString
);
console.log(encrypted);
```

### Déchiffrer un message manuellement

```javascript
const decrypted = await Vencord.Plugins.plugins["PGP Encryption"].decryptMessage(
    encryptedMessage,
    privateKeyString
);
console.log(decrypted);
```

## Génération de clés en ligne de commande

Si vous préférez générer vos clés avec GPG (GnuPG) :

```bash
# Générer une paire de clés
gpg --full-generate-key
# Choisir : RSA, 4096 bits, pas d'expiration

# Exporter la clé publique
gpg --armor --export your.email@example.com > public-key.asc

# Exporter la clé privée (GARDEZ-LA SÉCURISÉE!)
gpg --armor --export-secret-keys your.email@example.com > private-key.asc
```

Ensuite, copiez le contenu de ces fichiers dans l'interface du plugin.

## Structure de stockage

Les clés sont stockées dans le DataStore de Vencord sous la clé `pgp-encryption-keys` :

```json
{
  "123456789": {
    "publicKey": "-----BEGIN PGP PUBLIC KEY BLOCK-----\n...",
    "privateKey": "-----BEGIN PGP PRIVATE KEY BLOCK-----\n..."
  },
  "987654321": {
    "publicKey": "-----BEGIN PGP PUBLIC KEY BLOCK-----\n...",
    "privateKey": ""
  }
}
```

## Nettoyage complet

Pour supprimer toutes les clés enregistrées :

```javascript
// ⚠️ ATTENTION : Cette action est irréversible !
Vencord.Plugins.plugins["PGP Encryption"].clearAllKeys();
```

## Debugging

### Activer les logs détaillés

Ouvrez la console et surveillez les messages d'erreur :

```javascript
// Les erreurs de chiffrement/déchiffrement apparaissent dans la console
// avec le préfixe "Erreur de déchiffrement PGP:" ou "Erreur de chiffrement PGP:"
```

### Vérifier les clés stockées

```javascript
const storage = Vencord.Plugins.plugins["PGP Encryption"];
const keys = storage.getAllKeys();
console.table(Object.entries(keys).map(([userId, k]) => ({
    userId,
    hasPublicKey: !!k.publicKey,
    hasPrivateKey: !!k.privateKey
})));
```

## Intégration avec d'autres outils

### Compatibilité

Ce plugin utilise le format PGP standard, vous pouvez donc :
- Utiliser des clés générées par GPG, Kleopatra, ou tout autre outil PGP
- Échanger des messages avec des utilisateurs utilisant d'autres clients PGP
- Importer/exporter vos clés vers d'autres applications

### Formats supportés

- ✅ RSA 2048, 4096 bits
- ✅ Format ASCII armored (`-----BEGIN PGP...`)
- ❌ Clés avec passphrase (non supporté actuellement)
- ✅ Clés EdDSA/Curve25519

## Sécurité avancée

### Recommandations

1. **Rotation des clés** : Générez de nouvelles clés tous les 1-2 ans
2. **Clés séparées** : Utilisez des clés différentes pour chaque contact important
3. **Sauvegarde** : Exportez et sauvegardez vos clés dans un coffre-fort de mots de passe
4. **Vérification** : Vérifiez l'empreinte (fingerprint) des clés publiques avec votre contact

### Obtenir l'empreinte d'une clé

```javascript
const key = await openpgp.readKey({ armoredKey: publicKeyString });
console.log(key.getFingerprint());
```

## Performance

### Optimisations

Le plugin utilise :
- `findByPropsLazy` pour charger les modules webpack à la demande
- Déchiffrement asynchrone pour ne pas bloquer l'UI
- Mise en cache des clés en mémoire

### Limitations

- Le chiffrement/déchiffrement RSA 4096 peut prendre ~100-500ms
- Les messages très longs peuvent ralentir légèrement l'envoi
- La génération de clés prend 2-5 secondes

## API Plugin (pour développeurs)

Si vous voulez étendre ce plugin ou créer des intégrations :

```typescript
interface PGPEncryptionAPI {
    // Chiffrer un message
    encryptMessage(text: string, publicKey: string): Promise<string>;
    
    // Déchiffrer un message
    decryptMessage(encryptedText: string, privateKey: string): Promise<string>;
    
    // Gestion du stockage
    getUserKeys(userId: string): PGPKeys | null;
    setUserKeys(userId: string, keys: PGPKeys): void;
    getAllKeys(): Record<string, PGPKeys>;
    clearAllKeys(): void;
}
```

## Troubleshooting avancé

### Le plugin ne charge pas

```bash
# Vérifier les erreurs de build
cd /home/delta/Code/vencord/Vencord
pnpm build --watch

# Vérifier la console Discord pour les erreurs
```

### Les patches ne s'appliquent pas

```javascript
// Vérifier les patches actifs
Vencord.Webpack.patches
    .filter(p => p.plugin === "PGP Encryption")
    .forEach(p => console.log(p));
```

### Réinitialiser le plugin

```javascript
// Désactiver
Vencord.Plugins.plugins["PGP Encryption"].stop();

// Nettoyer les données
Vencord.Plugins.plugins["PGP Encryption"].clearAllKeys();

// Réactiver
Vencord.Plugins.plugins["PGP Encryption"].start();
```

---

Pour toute question avancée, consultez :
- [Documentation openpgp.js](https://openpgpjs.org/)
- [Code source du plugin](index.tsx)
- [Vencord API](https://github.com/Vendicated/Vencord/tree/main/docs)
