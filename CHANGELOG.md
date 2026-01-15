# Changelog - PGP Encryption Plugin

## Version 1.0.0 (2026-01-15)

### 🎉 Version initiale

#### Fonctionnalités
- ✅ Chiffrement automatique des messages sortants avec la clé publique du destinataire
- ✅ Déchiffrement automatique des messages entrants avec votre clé privée
- ✅ Interface de gestion des clés par utilisateur (clic droit → menu contextuel)
- ✅ Génération de paires de clés RSA 4096 bits
- ✅ Validation des clés avant sauvegarde
- ✅ Stockage sécurisé local des clés (DataStore)
- ✅ Paramètres d'activation/désactivation du chiffrement/déchiffrement
- ✅ Indicateur visuel 🔓 pour les messages déchiffrés
- ✅ Support des messages directs (DM)

#### Sécurité
- RSA 4096 bits (standard industriel)
- Clés stockées localement uniquement
- Utilisation de la bibliothèque openpgp.js (v6.3.0)

#### Limitations connues
- ⚠️ Supporte uniquement les messages directs (DM) pour l'instant
- ⚠️ Pas de support des canaux de groupe
- ⚠️ Pas de support des clés protégées par mot de passe
- ⚠️ Pas de signatures numériques
- ⚠️ Les patches peuvent nécessiter des ajustements avec les mises à jour Discord

#### Documentation
- README.md complet avec guide d'utilisation
- QUICKSTART.md pour démarrage rapide
- Commentaires dans le code

---

## Roadmap (fonctionnalités prévues)

### Version 1.1.0
- [ ] Support des canaux de groupe
- [ ] Signatures numériques des messages
- [ ] Vérification des signatures

### Version 1.2.0
- [ ] Support des clés protégées par mot de passe
- [ ] Interface d'export/import de configuration
- [ ] Sauvegarde chiffrée des clés

### Version 2.0.0
- [ ] Indicateur visuel dans l'UI (badge sur les avatars)
- [ ] Gestion de l'expiration des clés
- [ ] Révocation de clés
- [ ] Historique des clés utilisées
- [ ] Support de multiples clés par utilisateur

---

## Contributions

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer des améliorations
- Soumettre des pull requests

## Notes de développement

### Structure du projet
```
pgpEncryptionPlugin/
├── index.tsx           # Plugin principal (173 lignes)
├── KeyManagement.tsx   # Interface de gestion des clés
├── storage.ts          # Utilitaires de stockage
├── types.d.ts          # Déclarations de types
├── README.md           # Documentation complète
├── QUICKSTART.md       # Guide de démarrage rapide
└── CHANGELOG.md        # Ce fichier
```

### Dépendances
- `openpgp@^6.3.0` - Bibliothèque de chiffrement PGP

### Patches appliqués
1. **Messages reçus** : Interception et déchiffrement automatique
2. **Messages envoyés** : Interception et chiffrement automatique

### Tests recommandés
- [ ] Génération de clés
- [ ] Validation de clés invalides
- [ ] Chiffrement/déchiffrement en DM
- [ ] Désactivation du plugin
- [ ] Suppression des clés
- [ ] Messages sans clés configurées
