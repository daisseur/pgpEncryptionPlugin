# Tests manuels du plugin PGP Encryption

## Checklist de tests

### ✅ Installation et activation

- [ ] Le plugin apparaît dans la liste des plugins Vencord
- [ ] Le plugin peut être activé sans erreur
- [ ] Aucune erreur dans la console après activation
- [ ] Les paramètres du plugin sont accessibles

### ✅ Génération de clés

- [ ] Le menu contextuel "Gérer les clés PGP" apparaît sur clic droit utilisateur
- [ ] La fenêtre modale s'ouvre correctement
- [ ] Le bouton "Générer une paire de clés" fonctionne
- [ ] Les clés générées sont valides (bouton "Valider les clés")
- [ ] Les clés peuvent être sauvegardées

### ✅ Gestion des clés

- [ ] Les clés peuvent être collées manuellement
- [ ] La validation détecte les clés invalides
- [ ] Les clés sauvegardées persistent après redémarrage Discord
- [ ] Les clés peuvent être supprimées
- [ ] Plusieurs utilisateurs peuvent avoir des clés différentes

### ✅ Chiffrement des messages

- [ ] Messages DM automatiquement chiffrés quand clé publique configurée
- [ ] Format PGP correct (-----BEGIN PGP MESSAGE-----)
- [ ] Messages non chiffrés si pas de clé publique
- [ ] Désactivation du chiffrement via paramètres fonctionne
- [ ] Messages longs sont correctement chiffrés

### ✅ Déchiffrement des messages

- [ ] Messages PGP reçus sont automatiquement déchiffrés
- [ ] Préfixe 🔓 apparaît sur les messages déchiffrés
- [ ] Messages non PGP ne sont pas affectés
- [ ] Désactivation du déchiffrement via paramètres fonctionne
- [ ] Messages invalides n'empêchent pas l'affichage

### ✅ Cas limites

- [ ] Messages vides
- [ ] Clés avec caractères spéciaux
- [ ] Très longs messages (>2000 caractères)
- [ ] Clés RSA 2048 bits (en plus de 4096)
- [ ] Envoi rapide de plusieurs messages
- [ ] Désactivation puis réactivation du plugin

### ✅ Performance

- [ ] Pas de lag notable lors de l'envoi
- [ ] Pas de lag notable lors de la réception
- [ ] Génération de clés en moins de 10 secondes
- [ ] Interface réactive

### ✅ Sécurité

- [ ] Clés privées ne sont pas affichées en clair dans les logs
- [ ] Clés sont stockées localement uniquement
- [ ] Pas d'envoi de clés privées par erreur
- [ ] Messages déchiffrés ne sont pas stockés en clair

### ✅ Interface utilisateur

- [ ] Textes en français corrects
- [ ] Boutons réactifs
- [ ] Messages d'erreur clairs
- [ ] Instructions compréhensibles
- [ ] Pas d'erreurs d'affichage

## Scénarios de test

### Scénario 1 : Premier échange chiffré

1. **Alice** génère une paire de clés
2. **Bob** génère une paire de clés
3. **Alice** envoie sa clé publique à **Bob**
4. **Bob** envoie sa clé publique à **Alice**
5. **Alice** configure les clés de **Bob** :
   - Clé publique de Bob
   - Sa propre clé privée
6. **Bob** configure les clés d'**Alice** :
   - Clé publique d'Alice
   - Sa propre clé privée
7. **Alice** envoie "Hello Bob!"
8. **Vérifier** : Bob reçoit "🔓 Hello Bob!"
9. **Bob** répond "Hi Alice!"
10. **Vérifier** : Alice reçoit "🔓 Hi Alice!"

**Résultat attendu** : ✅ Messages chiffrés et déchiffrés correctement

### Scénario 2 : Utilisateur sans clé

1. **Alice** a des clés configurées
2. **Charlie** n'a pas de clés
3. **Alice** envoie un message à **Charlie**
4. **Vérifier** : Le message est envoyé en clair
5. **Charlie** envoie un message à **Alice**
6. **Vérifier** : Alice reçoit le message en clair

**Résultat attendu** : ✅ Pas de chiffrement si pas de clés

### Scénario 3 : Changement de clés

1. **Alice** et **Bob** ont des clés configurées
2. **Bob** génère de nouvelles clés
3. **Bob** envoie sa nouvelle clé publique à **Alice**
4. **Alice** met à jour la clé publique de **Bob**
5. **Alice** envoie un message
6. **Vérifier** : Bob peut déchiffrer avec sa nouvelle clé privée
7. **Vérifier** : Les anciens messages restent lisibles

**Résultat attendu** : ✅ Transition de clés sans perte de messages

### Scénario 4 : Clé invalide

1. **Alice** essaie de sauvegarder une clé invalide
2. **Vérifier** : La validation échoue
3. **Alice** corrige la clé
4. **Vérifier** : La validation réussit
5. **Alice** sauvegarde

**Résultat attendu** : ✅ Validation empêche les clés invalides

### Scénario 5 : Désactivation temporaire

1. **Alice** a le plugin activé
2. **Alice** désactive "Chiffrer automatiquement"
3. **Alice** envoie un message
4. **Vérifier** : Message envoyé en clair
5. **Alice** réactive l'option
6. **Alice** envoie un message
7. **Vérifier** : Message chiffré

**Résultat attendu** : ✅ Contrôle via paramètres fonctionne

## Tests de régression (après mise à jour Discord)

- [ ] Patches toujours appliqués
- [ ] Menu contextuel toujours accessible
- [ ] Chiffrement/déchiffrement fonctionnels
- [ ] Pas de nouvelles erreurs dans la console

## Tests de compatibilité

### Avec d'autres outils PGP

- [ ] Clés GPG peuvent être importées
- [ ] Messages peuvent être déchiffrés par GPG
- [ ] Messages GPG peuvent être déchiffrés par le plugin

### Avec d'autres plugins Vencord

- [ ] Pas de conflit avec d'autres plugins de messages
- [ ] Pas de conflit avec les plugins d'UI
- [ ] Fonctionnement avec BetterDiscord (si applicable)

## Commandes de test console

```javascript
// Vérifier que le plugin est chargé
Vencord.Plugins.plugins["PGP Encryption"]

// Tester le chiffrement
const testPublicKey = "-----BEGIN PGP PUBLIC KEY BLOCK-----\n...";
await Vencord.Plugins.plugins["PGP Encryption"].encryptMessage("Test", testPublicKey);

// Tester le déchiffrement
const testPrivateKey = "-----BEGIN PGP PRIVATE KEY BLOCK-----\n...";
const encrypted = "-----BEGIN PGP MESSAGE-----\n...";
await Vencord.Plugins.plugins["PGP Encryption"].decryptMessage(encrypted, testPrivateKey);

// Vérifier le stockage
Vencord.Plugins.plugins["PGP Encryption"].getAllKeys();

// Nettoyer les tests
Vencord.Plugins.plugins["PGP Encryption"].clearAllKeys();
```

## Rapport de bug

Si vous trouvez un bug, veuillez inclure :

1. **Description** : Que s'est-il passé ?
2. **Étapes pour reproduire** : Comment reproduire le bug ?
3. **Résultat attendu** : Que devrait-il se passer ?
4. **Résultat obtenu** : Que s'est-il passé à la place ?
5. **Console** : Y a-t-il des erreurs dans la console ?
6. **Version** : Quelle version de Vencord et du plugin ?
7. **Environnement** : OS, version Discord, etc.

## Notes de test

### Environnement de test recommandé

- Vencord build dev (`pnpm build --watch`)
- Console ouverte pour surveiller les erreurs
- Deux comptes Discord de test
- Clés de test (ne pas utiliser vos vraies clés)

### Bonnes pratiques

- ⚠️ **Ne testez PAS avec vos vraies clés privées**
- ✅ Générez des clés de test dédiées
- ✅ Testez sur un serveur/compte de test
- ✅ Documentez tous les bugs trouvés
- ✅ Vérifiez la console régulièrement

---

**Dernière mise à jour** : 2026-01-15  
**Version testée** : 1.0.0
