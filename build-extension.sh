#!/bin/bash

# Simple 1-click build script for LinkCloud Extension

echo "🚀 Building LinkCloud Extension for distribution..."

# Build the project
npm run build

# Create output directory
mkdir -p extension-packages

# Copy manifest to dist
cp public/manifest.json dist/

# Create Chrome-compatible zip
echo "📦 Creating Chrome package..."
cd dist && zip -r ../extension-packages/linkcloud-chrome.zip . && cd ..

# Create Firefox-compatible package
echo "🦊 Creating Firefox package..."
# Update manifest for Firefox (manifest v2)
cat public/manifest.json | \
  sed 's/"manifest_version": 3/"manifest_version": 2/' | \
  sed 's/"action"/"browser_action"/' > dist/manifest-firefox.json

cd dist && \
  cp manifest-firefox.json manifest.json && \
  zip -r ../extension-packages/linkcloud-firefox.zip . && \
  cd ..

# Restore original manifest
cp public/manifest.json dist/

echo "✅ Extension packages created successfully!"
echo ""
echo "📋 Installation Instructions:"
echo "Chrome: Go to chrome://extensions/, enable Developer mode, click 'Load unpacked' and select the dist folder"
echo "       OR drag linkcloud-chrome.zip onto the extensions page"
echo ""
echo "Firefox: Go to about:addons, click gear icon, 'Install Add-on From File', select linkcloud-firefox.zip"
echo ""
echo "📦 Packages created in extension-packages/ folder:"
ls -la extension-packages/

# Make the script executable
chmod +x build-extension.sh