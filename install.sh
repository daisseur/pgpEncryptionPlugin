#!/bin/bash

# Installation script for PGP Encryption plugin for Vencord
# Usage: ./install.sh

set -e

echo "🔐 Installing PGP Encryption plugin for Vencord"
echo "======================================================"
echo ""

# Check that we are in the correct directory
if [ ! -f "index.tsx" ] || [ ! -f "KeyManagement.tsx" ]; then
    echo "❌ Error: This script must be run from the pgpEncryptionPlugin folder"
    exit 1
fi

# Detect the Vencord directory
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
    echo "❌ Unable to find Vencord directory"
    echo "   Please specify the path manually:"
    read -p "   Path to Vencord: " VENCORD_DIR
    
    if [ ! -d "$VENCORD_DIR" ]; then
        echo "❌ The specified path does not exist"
        exit 1
    fi
fi

echo "✅ Vencord found: $VENCORD_DIR"
echo ""

# Check if openpgp is installed
echo "📦 Checking dependencies..."
cd "$VENCORD_DIR"

if ! grep -q "openpgp" "package.json" 2>/dev/null; then
    echo "📥 Installing openpgp..."
    pnpm add -w openpgp
    echo "✅ openpgp installed"
else
    echo "✅ openpgp already installed"
fi

echo ""

# Check if userplugins folder exists
USERPLUGINS_DIR="$VENCORD_DIR/src/userplugins"
if [ ! -d "$USERPLUGINS_DIR" ]; then
    echo "📁 Creating userplugins folder..."
    mkdir -p "$USERPLUGINS_DIR"
    echo "✅ Folder created"
fi

# Create plugin folder
PLUGIN_DIR="$USERPLUGINS_DIR/pgpEncryptionPlugin"
if [ -d "$PLUGIN_DIR" ]; then
    echo "⚠️  Plugin already exists. Do you want to update it? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[yY]$ ]]; then
        echo "❌ Installation cancelled"
        exit 0
    fi
    echo "🔄 Updating plugin..."
else
    echo "📁 Creating plugin folder..."
    mkdir -p "$PLUGIN_DIR"
fi

# Copy files
echo "📋 Copying files..."
cp -v index.tsx "$PLUGIN_DIR/"
cp -v KeyManagement.tsx "$PLUGIN_DIR/"
cp -v storage.ts "$PLUGIN_DIR/"
cp -v types.d.ts "$PLUGIN_DIR/"
cp -v README.md "$PLUGIN_DIR/"
cp -v QUICKSTART.md "$PLUGIN_DIR/"
cp -v CHANGELOG.md "$PLUGIN_DIR/"
cp -v ADVANCED.md "$PLUGIN_DIR/"

echo ""
echo "✅ Files copied successfully!"
echo ""

# Build Vencord
echo "🔨 Do you want to build Vencord now? (Y/n)"
read -r response
if [[ ! "$response" =~ ^[nN]$ ]]; then
    echo "🔨 Building..."
    cd "$VENCORD_DIR"
    pnpm build
    echo "✅ Build complete!"
    echo ""
    echo "🎉 Installation completed successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Reload Discord (Ctrl+R)"
    echo "   2. Enable the plugin in: Settings → Vencord → Plugins → PGP Encryption"
    echo "   3. Check QUICKSTART.md for a quick guide"
    echo ""
else
    echo ""
    echo "⚠️  Don't forget to build Vencord:"
    echo "   cd $VENCORD_DIR"
    echo "   pnpm build"
    echo ""
fi

echo "📚 Available documentation:"
echo "   - QUICKSTART.md: Quick start guide"
echo "   - README.md: Complete documentation"
echo "   - ADVANCED.md: Advanced configuration"
echo ""
echo "Enjoy! 🔐"
