#!/bin/bash

echo "🔧 Fixing react-native-gesture-handler installation..."

cd /Users/lavickim/_Dev/moneyshift/mshift-app

echo "📦 Removing existing node_modules and lock files..."
rm -rf node_modules
rm -f yarn.lock package-lock.json

echo "📲 Installing dependencies with expo install..."
npx expo install react-native-gesture-handler
npx expo install react-native-reanimated

echo "📦 Installing other dependencies..."
yarn install

echo "✅ Installation complete! Try starting the app again."
echo "Run: yarn start:clear"