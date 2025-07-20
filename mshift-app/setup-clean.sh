#!/bin/bash

echo "🧹 Clean setup for MoneyShift mobile app"
echo "========================================="

cd "$(dirname "$0")"

echo "🗑️  Removing old dependencies..."
rm -rf node_modules
rm -f yarn.lock package-lock.json

echo "📦 Installing dependencies with yarn..."
yarn install

echo "✅ Setup complete!"
echo ""
echo "📱 To start the app:"
echo "  yarn start        # Normal start"
echo "  yarn start:clear  # Start with cache clear"
echo ""
echo "📋 Dependency management:"
echo "  - Only use 'yarn add [package]' for new packages"
echo "  - Do NOT use 'expo install' (versions are fixed in package.json)"
echo "  - See DEPENDENCY_MANAGEMENT.md for details"