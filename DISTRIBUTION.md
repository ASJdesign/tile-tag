# LinkCloud Extension Distribution Guide

## Quick 1-Click Build

For instant packaging, simply run:

```bash
./build-extension.sh
```

This creates installable packages for both Chrome and Firefox in the `extension-packages/` folder.

## Installation Methods

### Chrome Installation
1. **Drag & Drop**: Drag `linkcloud-chrome.zip` onto `chrome://extensions/`
2. **Developer Mode**: 
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

### Firefox Installation
1. **From File**: 
   - Go to `about:addons`
   - Click the gear icon → "Install Add-on From File"
   - Select `linkcloud-firefox.zip`

### Manual Installation (Any Browser)
1. Extract the zip file
2. Load as unpacked extension in developer mode

## Advanced Packaging

For signed packages and store distribution:

### Chrome Web Store
```bash
# Build and create CRX package
node scripts/build-extension.js
```

### Firefox Add-ons
```bash
# Build with web-ext
npm run build
npx web-ext build --source-dir=dist
```

## Package Contents

- `linkcloud-chrome.zip` - Chrome-compatible package
- `linkcloud-firefox.zip` - Firefox-compatible package (Manifest v2)
- Source files in `dist/` folder

## Troubleshooting

If installation fails:
1. Ensure you have the latest browser version
2. Enable Developer/Debug mode
3. Check browser console for errors
4. Try manual unpacked installation first

## Publishing to Stores

For official store distribution:
1. **Chrome Web Store**: Upload the zip to Chrome Developer Dashboard
2. **Firefox Add-ons**: Submit to addons.mozilla.org
3. **Edge**: Use same Chrome package on Edge Add-ons store