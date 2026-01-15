#!/bin/bash

# Script d'installation du plugin PGP Encryption pour Vencord
# Usage: ./install.sh

set -e

echo "🔐 Installation du plugin PGP Encryption pour Vencord"
echo "======================================================"
echo ""

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "index.tsx" ] || [ ! -f "KeyManagement.tsx" ]; then
    echo "❌ Erreur : Ce script doit être exécuté depuis le dossier pgpEncryptionPlugin"
    exit 1
fi

# Détecter le répertoire Vencord
VENCORD_DIR=""
POSSIBLE_DIRS=(
    "$HOME/Code/vencord/Vencord"
    "$HOME/Vencord"
    "$HOME/.config/Vencord"
    "$(pwd)/../../../"
)

for dir in "${POSSIBLE_DIRS[@]}"; do
    if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
        if grep -q "vencord" "$dir/package.json"; then
            VENCORD_DIR="$dir"
            break
        fi
    fi
done

if [ -z "$VENCORD_DIR" ]; then
    echo "❌ Impossible de trouver le répertoire Vencord"
    echo "   Veuillez spécifier le chemin manuellement :"
    read -p "   Chemin vers Vencord : " VENCORD_DIR
    
    if [ ! -d "$VENCORD_DIR" ]; then
        echo "❌ Le chemin spécifié n'existe pas"
        exit 1
    fi
fi

echo "✅ Vencord trouvé : $VENCORD_DIR"
echo ""

# Vérifier si openpgp est installé
echo "📦 Vérification des dépendances..."
cd "$VENCORD_DIR"

if ! grep -q "openpgp" "package.json" 2>/dev/null; then
    echo "📥 Installation de openpgp..."
    pnpm add -w openpgp
    echo "✅ openpgp installé"
else
    echo "✅ openpgp déjà installé"
fi

echo ""

# Vérifier si le dossier userplugins existe
USERPLUGINS_DIR="$VENCORD_DIR/src/userplugins"
if [ ! -d "$USERPLUGINS_DIR" ]; then
    echo "📁 Création du dossier userplugins..."
    mkdir -p "$USERPLUGINS_DIR"
    echo "✅ Dossier créé"
fi

# Créer le dossier du plugin
PLUGIN_DIR="$USERPLUGINS_DIR/pgpEncryptionPlugin"
if [ -d "$PLUGIN_DIR" ]; then
    echo "⚠️  Le plugin existe déjà. Voulez-vous le mettre à jour ? (o/N)"
    read -r response
    if [[ ! "$response" =~ ^[oO]$ ]]; then
        echo "❌ Installation annulée"
        exit 0
    fi
    echo "🔄 Mise à jour du plugin..."
else
    echo "📁 Création du dossier du plugin..."
    mkdir -p "$PLUGIN_DIR"
fi

# Copier les fichiers
echo "📋 Copie des fichiers..."
cp -v index.tsx "$PLUGIN_DIR/"
cp -v KeyManagement.tsx "$PLUGIN_DIR/"
cp -v storage.ts "$PLUGIN_DIR/"
cp -v types.d.ts "$PLUGIN_DIR/"
cp -v README.md "$PLUGIN_DIR/"
cp -v QUICKSTART.md "$PLUGIN_DIR/"
cp -v CHANGELOG.md "$PLUGIN_DIR/"
cp -v ADVANCED.md "$PLUGIN_DIR/"

echo ""
echo "✅ Fichiers copiés avec succès !"
echo ""

# Build Vencord
echo "🔨 Voulez-vous builder Vencord maintenant ? (O/n)"
read -r response
if [[ ! "$response" =~ ^[nN]$ ]]; then
    echo "🔨 Build en cours..."
    cd "$VENCORD_DIR"
    pnpm build
    echo "✅ Build terminé !"
    echo ""
    echo "🎉 Installation terminée avec succès !"
    echo ""
    echo "📝 Prochaines étapes :"
    echo "   1. Rechargez Discord (Ctrl+R)"
    echo "   2. Activez le plugin dans : Paramètres → Vencord → Plugins → PGP Encryption"
    echo "   3. Consultez QUICKSTART.md pour un guide rapide"
    echo ""
else
    echo ""
    echo "⚠️  N'oubliez pas de builder Vencord :"
    echo "   cd $VENCORD_DIR"
    echo "   pnpm build"
    echo ""
fi

echo "📚 Documentation disponible :"
echo "   - QUICKSTART.md : Guide de démarrage rapide"
echo "   - README.md : Documentation complète"
echo "   - ADVANCED.md : Configuration avancée"
echo ""
echo "Enjoy ! 🔐"
