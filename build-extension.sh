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
echo "📋 STEP-BY-STEP INSTALLATION INSTRUCTIONS:"
echo ""
echo "🔹 CHROME INSTALLATION (Method 1 - Drag & Drop):"
echo "   1. Open Chrome browser"
echo "   2. Go to chrome://extensions/"
echo "   3. Drag linkcloud-chrome.zip from extension-packages/ folder onto the page"
echo "   4. Click 'Add extension' when prompted"
echo ""
echo "🔹 CHROME INSTALLATION (Method 2 - Developer Mode):"
echo "   1. Open Chrome browser"
echo "   2. Go to chrome://extensions/"
echo "   3. Toggle 'Developer mode' ON (top-right corner)"
echo "   4. Click 'Load unpacked' button"
echo "   5. Select the 'dist' folder from this project"
echo "   6. Extension will be loaded and active"
echo ""
echo "🔹 FIREFOX INSTALLATION:"
echo "   1. Open Firefox browser"
echo "   2. Go to about:addons"
echo "   3. Click the gear icon (⚙️) in the top-right"
echo "   4. Select 'Install Add-on From File...'"
echo "   5. Navigate to extension-packages/ folder"
echo "   6. Select linkcloud-firefox.zip"
echo "   7. Click 'Add' when prompted"
echo ""
echo "🔹 MANUAL INSTALLATION (Any Browser):"
echo "   1. Extract linkcloud-chrome.zip to a folder"
echo "   2. Open your browser's extension management page"
echo "   3. Enable Developer/Debug mode"
echo "   4. Click 'Load unpacked' or similar option"
echo "   5. Select the extracted folder"
echo ""
echo "⚠️  TROUBLESHOOTING:"
echo "   • If installation fails, try enabling Developer mode first"
echo "   • Make sure you have the latest browser version"
echo "   • Check browser console for error messages"
echo "   • Try manual unpacked installation if zip method fails"
echo ""
echo "📦 Packages created in extension-packages/ folder:"
ls -la extension-packages/

# Make the script executable
chmod +x build-extension.sh