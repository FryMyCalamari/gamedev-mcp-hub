#!/usr/bin/env node

/**
 * Post-build script for GameDev MCP Hub
 * Runs after TypeScript compilation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Copy GUI public files to dist
const publicSrc = path.join(__dirname, '../src/gui/public');
const publicDest = path.join(__dirname, '../dist/gui/public');

if (fs.existsSync(publicSrc)) {
  console.log('📦 Copying GUI public files...');
  
  // Create destination directory
  fs.mkdirSync(publicDest, { recursive: true });
  
  // Copy all files from public folder
  const files = fs.readdirSync(publicSrc);
  files.forEach(file => {
    const srcFile = path.join(publicSrc, file);
    const destFile = path.join(publicDest, file);
    fs.copyFileSync(srcFile, destFile);
    console.log(`  ✓ Copied ${file}`);
  });
  
  console.log('✓ GUI public files copied successfully!');
}

console.log('✓ Build completed successfully!');
console.log('✓ Output directory: dist/');
