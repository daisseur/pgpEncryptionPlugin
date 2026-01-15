# 🚀 Guide de démarrage rapide

## Installation

1. **Rebuild Vencord** :
   ```bash
   cd /home/delta/Code/vencord/Vencord
   pnpm build --watch
   ```

2. **Rechargez Discord** (Ctrl+R)

3. **Activez le plugin** :
   - Paramètres → Vencord → Plugins
   - Recherchez "PGP Encryption"
   - Activez-le

## Premier test en 3 étapes

### Étape 1 : Générer vos clés

1. Faites un **clic droit** sur vous-même (ou sur un ami)
2. Cliquez sur **"Gérer les clés PGP"**
3. Cliquez sur **"🔑 Générer une paire de clés"**
4. Attendez quelques secondes
5. Cliquez sur **"💾 Sauvegarder"**

✅ Vous avez maintenant une paire de clés PGP !

### Étape 2 : Partager votre clé publique

1. Copiez votre **clé publique** (commence par `-----BEGIN PGP PUBLIC KEY BLOCK-----`)
2. Envoyez-la à votre ami par Discord ou email
3. Demandez à votre ami de faire la même chose

### Étape 3 : Configurer les clés de votre ami

1. Faites un **clic droit** sur votre ami
2. Cliquez sur **"Gérer les clés PGP"**
3. Collez ces clés :
   - **Clé Publique** → La clé publique de votre ami
   - **Clé Privée** → VOTRE clé privée (pour déchiffrer)
4. Cliquez sur **"✓ Valider les clés"** pour vérifier
5. Cliquez sur **"💾 Sauvegarder"**

## 🎉 C'est tout !

Envoyez un message à votre ami :
- **Votre message** sera automatiquement chiffré
- **Ses messages** seront automatiquement déchiffrés

## 💡 Exemple visuel

```
Vous écrivez:
"Hello, comment ça va?"

Ce qui est envoyé:
-----BEGIN PGP MESSAGE-----
hQEMA5....[bloc chiffré]....==
-----END PGP MESSAGE-----

Ce que votre ami voit (si il a votre clé publique):
"Hello, comment ça va?"

Ce que vous voyez quand il répond:
🔓 "Très bien merci!"
```

## ⚙️ Paramètres recommandés

Dans **Paramètres Vencord → Plugins → PGP Encryption** :

- ✅ **Déchiffrer automatiquement** : Activé
- ✅ **Chiffrer automatiquement** : Activé

## 🔧 Dépannage rapide

**Les messages ne se chiffrent pas ?**
- Vérifiez que vous avez bien mis la **clé publique de votre ami**
- Assurez-vous d'être dans un **message direct** (DM)

**Les messages ne se déchiffrent pas ?**
- Vérifiez que vous avez bien mis **VOTRE clé privée**
- Vérifiez que votre ami utilise bien votre clé publique

**Besoin d'aide ?**
- Consultez le [README.md](README.md) complet
- Ouvrez la console (Ctrl+Shift+I) pour voir les erreurs

## 📝 Note importante

⚠️ **Stockage des clés**

Les clés par utilisateur :
- **Clé Publique** = Celle de votre ami (pour chiffrer)
- **Clé Privée** = La vôtre (pour déchiffrer)

C'est contre-intuitif mais c'est normal ! Vous chiffrez avec SA clé publique, et vous déchiffrez avec VOTRE clé privée.

---

Besoin de plus de détails ? Consultez le [README.md](README.md) complet !
