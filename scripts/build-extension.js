#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import crx3 from 'crx3';

const distDir = 'dist';
const outputDir = 'extension-packages';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function buildExtension() {
  console.log('🏗️  Building extension...');
  
  // Build the project
  execSync('npm run build', { stdio: 'inherit' });
  
  // Ensure index.html is in the root of dist (not in a subfolder)
  const indexSource = path.join(distDir, 'main.html');
  const indexTarget = path.join(distDir, 'index.html');
  
  if (fs.existsSync(indexSource)) {
    fs.renameSync(indexSource, indexTarget);
  }
  
  // Validate that all required files exist
  const requiredFiles = ['index.html', 'manifest.json', 'favicon.ico'];
  for (const file of requiredFiles) {
    const filePath = path.join(distDir, file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Required file missing: ${filePath}`);
      console.log('📁 Files in dist directory:');
      if (fs.existsSync(distDir)) {
        fs.readdirSync(distDir).forEach(f => console.log(`  - ${f}`));
      }
      throw new Error(`Required file missing: ${filePath}`);
    }
    console.log(`✅ Found: ${filePath}`);
  }
  
  console.log('✅ Build complete!');
  
  // Package for Chrome (.crx)
  await packageForChrome();
  
  // Package for Firefox (.xpi)
  await packageForFirefox();
  
  // Create zip for manual installation
  await createZipPackage();
  
  console.log('\n🎉 Extension packages created successfully!');
  console.log(`📦 Chrome package: ${outputDir}/linkcloud-chrome.crx`);
  console.log(`🦊 Firefox package: ${outputDir}/linkcloud-firefox.xpi`);
  console.log(`📁 Zip package: ${outputDir}/linkcloud.zip`);
  console.log('\n📋 Installation instructions:');
  console.log('Chrome: Drag and drop the .crx file onto chrome://extensions/');
  console.log('Firefox: Go to about:addons > Install Add-on From File > Select .xpi file');
  console.log('Manual: Extract .zip and load as unpacked extension');
}

async function packageForChrome() {
  console.log('📦 Packaging for Chrome...');
  
  try {
    // Generate a key if it doesn't exist
    const keyPath = 'scripts/extension.pem';
    if (!fs.existsSync(keyPath)) {
      console.log('🔑 Generating private key...');
      execSync(`openssl genrsa -out ${keyPath} 2048`, { stdio: 'inherit' });
    }
    
    const key = fs.readFileSync(keyPath);
    const crxBuffer = await crx3(fs.readFileSync(`${distDir}/manifest.json`), {
      keyPath,
      crxPath: `${outputDir}/linkcloud-chrome.crx`,
      manifestPath: `${distDir}/manifest.json`,
      directory: distDir
    });
    
    console.log('✅ Chrome package created!');
  } catch (error) {
    console.error('❌ Chrome packaging failed:', error.message);
    console.log('💡 Tip: You can manually package using Chrome Developer Mode');
  }
}

async function packageForFirefox() {
  console.log('🦊 Packaging for Firefox...');
  
  try {
    // Update manifest for Firefox compatibility
    const manifest = JSON.parse(fs.readFileSync(`${distDir}/manifest.json`, 'utf8'));
    manifest.manifest_version = 2; // Firefox still prefers v2
    manifest.browser_action = manifest.action;
    delete manifest.action;
    
    // Create Firefox-specific manifest
    fs.writeFileSync(`${distDir}/manifest-firefox.json`, JSON.stringify(manifest, null, 2));
    
    // Use web-ext to package
    execSync(`npx web-ext build --source-dir=${distDir} --artifacts-dir=${outputDir} --filename=linkcloud-firefox.xpi --overwrite-dest`, {
      stdio: 'inherit'
    });
    
    console.log('✅ Firefox package created!');
  } catch (error) {
    console.error('❌ Firefox packaging failed:', error.message);
    console.log('💡 Creating zip package instead...');
  }
}

async function createZipPackage() {
  console.log('📁 Creating zip package...');
  
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(`${outputDir}/linkcloud.zip`);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    output.on('close', () => {
      console.log('✅ Zip package created!');
      resolve();
    });
    
    archive.on('error', reject);
    archive.pipe(output);
    archive.directory(distDir, false);
    archive.finalize();
  });
}

// Run the build
buildExtension().catch(console.error);