#!/usr/bin/env node
/**
 * Simple JavaScript Minifier (No dependencies)
 * Targets project JS files.
 *
 * Usage: node _scripts/minify-js.js
 */

const fs = require('fs');
const path = require('path');

// ============================================ 
// Configuration
// ============================================ 

// Files to explicitly minify
const FILES_TO_MINIFY = [
  { input: 'js/main.js', output: 'js/main.min.js' },
  { input: 'js/config.js', output: 'js/config.min.js' },
  { input: 'js/404.js', output: 'js/404.min.js' }
];

// Directories to scan for additional modules (optional, recursive)
const DIRS_TO_SCAN = [
  'js/core',
  'js/modules'
];

const ROOT_DIR = path.join(__dirname, '..');

// ============================================ 
// Minification Logic (Regex-based)
// ============================================ 

function minifyJS(code) {
  return code
    // Remove single-line comments (careful with URLs)
    .replace(/\/\/[^(\n|\r)]*/g, '')
    // Remove multi-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Remove spaces around operators
    .replace(/\s*([=+\-*/%&|^<>!?:;,{}()[\]])\s*/g, '$1')
    .trim();
}

// ============================================ 
// Process Single File
// ============================================ 

function processFile(inputFile, outputFile) {
  const inputPath = path.join(ROOT_DIR, inputFile);
  const outputPath = path.join(ROOT_DIR, outputFile);

  try {
    if (!fs.existsSync(inputPath)) {
      // Quietly skip if not found, or log warning
      // console.log(`⚠️  Skipping ${inputFile} (not found)`);
      return false;
    }

    console.log(`📖 Reading: ${inputFile}`);
    const code = fs.readFileSync(inputPath, 'utf8');
    const originalSize = Buffer.byteLength(code, 'utf8');

    console.log('⚙️  Minifying...');
    const minified = minifyJS(code);
    const minifiedSize = Buffer.byteLength(minified, 'utf8');
    
    // Check if changed
    if (fs.existsSync(outputPath)) {
      const existing = fs.readFileSync(outputPath, 'utf8');
      if (existing === minified) {
         console.log(`✓ No changes for ${outputFile}\n`);
         return true;
      }
    }

    fs.writeFileSync(outputPath, minified, 'utf8');

    const saved = originalSize - minifiedSize;
    const percentage = originalSize > 0 ? ((saved / originalSize) * 100).toFixed(2) : 0;

    console.log(`✅ Success!`);
    console.log(`   Original:  ${(originalSize / 1024).toFixed(2)} KB`);
    console.log(`   Minified:  ${(minifiedSize / 1024).toFixed(2)} KB`);
    console.log(`   Saved:     ${(saved / 1024).toFixed(2)} KB (${percentage}%)`);
    console.log(`   Output:    ${outputFile}\n`);

    return true;
  } catch (error) {
    console.error(`❌ Error processing ${inputFile}: ${error.message}\n`);
    return false;
  }
}

// ============================================ 
// Main Execution
// ============================================ 

function main() {
  console.log('🚀 JS Minification Started\n');

  // Process explicit files
  FILES_TO_MINIFY.forEach(({ input, output }) => {
    processFile(input, output);
  });
  
  // Process subdirectories
  DIRS_TO_SCAN.forEach(dir => {
    const fullDir = path.join(ROOT_DIR, dir);
    if (fs.existsSync(fullDir)) {
      const files = fs.readdirSync(fullDir);
      files.forEach(file => {
        if (file.endsWith('.js') && !file.endsWith('.min.js')) {
            const input = path.join(dir, file);
            const output = path.join(dir, file.replace('.js', '.min.js'));
            processFile(input, output);
        }
      });
    }
  });

  console.log('🎉 Done!');
}

main();