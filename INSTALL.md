# 📦 Installation Rapide

## Étapes d'installation (2 minutes)

```bash
# 1. Allez dans le dossier du plugin
cd /home/delta/Code/vencord/Vencord/userplugins/pgpEncryptionPlugin

# 2. Lancez le script d'installation
./install.sh

# 3. Ou manuellement :
cd /home/delta/Code/vencord/Vencord
pnpm add -w openpgp
pnpm build

# 4. Rechargez Discord (Ctrl+R)
```

## ✅ Vérification de l'installation

1. Ouvrez Discord
2. Allez dans **Paramètres** → **Vencord** → **Plugins**
3. Recherchez **"PGP Encryption"**
4. Activez-le

## 🎯 Premier test (30 secondes)

1. **Clic droit** sur vous-même ou un ami
2. Cliquez sur **"Gérer les clés PGP"**
3. **"🔑 Générer une paire de clés"**
4. **"💾 Sauvegarder"**

🎉 **C'est fait !**

## 📚 Documentation

| Fichier | Description | Temps de lecture |
|---------|-------------|------------------|
| [QUICKSTART.md](QUICKSTART.md) | Guide de démarrage rapide | ⏱️ 5 min |
| [README.md](README.md) | Documentation complète | ⏱️ 15 min |
| [ADVANCED.md](ADVANCED.md) | Configuration avancée | ⏱️ 10 min |
| [TESTING.md](TESTING.md) | Guide de tests | ⏱️ 10 min |
| [PROJECT.md](PROJECT.md) | Structure du projet | ⏱️ 5 min |

## 🔗 Liens rapides

- 🚀 [Guide rapide](QUICKSTART.md) - Commencez ici !
- 📖 [Documentation complète](README.md)
- 🔧 [Configuration avancée](ADVANCED.md)
- 🧪 [Tests](TESTING.md)

## 💡 En bref

### Ce que fait ce plugin

```
Vous écrivez :           Discord envoie :                  Ami reçoit :
"Hello!"       →    -----BEGIN PGP MESSAGE-----    →    🔓 "Hello!"
                    [message chiffré]
                    -----END PGP MESSAGE-----
```

### Fonctionnalités clés

✅ Chiffrement automatique PGP/OpenPGP  
✅ Déchiffrement automatique  
✅ Génération de clés RSA 4096 bits  
✅ Gestion des clés par utilisateur  
✅ Interface graphique complète  
✅ Validation des clés  

## ⚡ Utilisation rapide

### Configurer pour un ami

1. **Clic droit** sur l'ami
2. **"Gérer les clés PGP"**
3. Collez :
   - **Clé Publique** → Sa clé publique (pour chiffrer)
   - **Clé Privée** → Votre clé privée (pour déchiffrer)
4. **"💾 Sauvegarder"**

### C'est tout ! 🎉

Les messages seront automatiquement :
- 🔒 Chiffrés quand vous envoyez
- 🔓 Déchiffrés quand vous recevez

## 🆘 Besoin d'aide ?

| Problème | Solution |
|----------|----------|
| Plugin ne charge pas | `pnpm build && Ctrl+R` |
| Messages ne chiffrent pas | Vérifier clé publique de l'ami |
| Messages ne déchiffrent pas | Vérifier votre clé privée |
| Erreurs dans la console | Voir [README.md](README.md) |

## 📊 Fichiers du projet

```
pgpEncryptionPlugin/
├── 🔧 Code (4 fichiers)
│   ├── index.tsx              # Plugin principal
│   ├── KeyManagement.tsx      # Interface UI
│   ├── storage.ts             # Stockage
│   └── types.d.ts             # Types TypeScript
│
├── 📚 Documentation (6 fichiers)
│   ├── README.md              # Documentation complète
│   ├── QUICKSTART.md          # Guide rapide
│   ├── ADVANCED.md            # Configuration avancée
│   ├── TESTING.md             # Tests
│   ├── PROJECT.md             # Structure projet
│   └── INSTALL.md             # Ce fichier
│
└── 🛠️ Outils (1 fichier)
    └── install.sh             # Installation automatique
```

## 🔐 Sécurité

- 🔒 **RSA 4096 bits** (standard militaire)
- 💾 **Stockage local uniquement**
- 🔐 **OpenPGP standard** (compatible GPG)
- ⚠️ **Gardez vos clés privées secrètes !**

## ⚙️ Configuration minimale

- Vencord installé
- Node.js et pnpm
- Discord (client desktop)

## 🎓 Niveau requis

- 🟢 **Basique** : Suivez QUICKSTART.md
- 🟡 **Intermédiaire** : Lisez README.md
- 🔴 **Avancé** : Consultez ADVANCED.md

## 📞 Support

- 📖 Documentation complète : [README.md](README.md)
- 🐛 Bugs : Consultez la console (Ctrl+Shift+I)
- 💬 Questions : Voir [TESTING.md](TESTING.md)

---

**🎉 Prêt à commencer ? Ouvrez [QUICKSTART.md](QUICKSTART.md) !**

---

Made with 💚 by daisseur  
Version 1.0.0 • 2026-01-15
