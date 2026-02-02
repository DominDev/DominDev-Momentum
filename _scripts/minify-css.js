// Simple CSS Minifier
// Usage: node _scripts/minify-css.js (from root directory)

const fs = require('fs');
const path = require('path');

function minifyCSS(css) {
  return css
    // Remove comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove whitespace
    .replace(/\s+/g, ' ')
    // Remove spaces around special characters
    .replace(/\s*([{}:;,>+~])\s*/g, '$1')
    // Remove trailing semicolons
    .replace(/;}/g, '}')
    // Remove unnecessary quotes from URLs
    .replace(/url\((['"]?)([^'"()]+)\1\)/g, 'url($2)')
    .trim();
}

function processFile(inputFile, outputFile) {
  try {
    console.log(`📖 Reading: ${inputFile}`);
    const css = fs.readFileSync(inputFile, 'utf8');

    const originalSize = Buffer.byteLength(css, 'utf8');

    console.log('⚙️  Minifying...');
    const minified = minifyCSS(css);

    const minifiedSize = Buffer.byteLength(minified, 'utf8');
    const saved = originalSize - minifiedSize;
    const percentage = ((saved / originalSize) * 100).toFixed(2);

    fs.writeFileSync(outputFile, minified, 'utf8');

    console.log(`✅ Success!`);
    console.log(`   Original:  ${(originalSize / 1024).toFixed(2)} KB`);
    console.log(`   Minified:  ${(minifiedSize / 1024).toFixed(2)} KB`);
    console.log(`   Saved:     ${(saved / 1024).toFixed(2)} KB (${percentage}%)`);
    console.log(`   Output:    ${outputFile}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// ============================================
// Configuration
// ============================================

// Explicit files to minify
const FILES_TO_MINIFY = [
  { input: 'style.css', output: 'style.min.css' },
  { input: 'style-404.css', output: 'style-404.min.css' },
  { input: 'assets/fonts/critical.css', output: 'assets/fonts/critical.min.css' }
];

// Directories to scan for .css files (auto-discover, no need to list each file)
const DIRS_TO_SCAN = [
  'css'
];

const rootDir = path.join(__dirname, '..');

// ============================================
// Main Execution
// ============================================

console.log('🚀 CSS Minification Started\n');

// Process explicit files
FILES_TO_MINIFY.forEach(({ input, output }) => {
  const inputPath = path.join(rootDir, input);
  const outputPath = path.join(rootDir, output);

  if (fs.existsSync(inputPath)) {
    processFile(inputPath, outputPath);
    console.log('');
  } else {
    console.log(`⚠️  Skipping ${input} (not found)\n`);
  }
});

// Process directories (auto-scan)
DIRS_TO_SCAN.forEach(dir => {
  const fullDir = path.join(rootDir, dir);
  if (fs.existsSync(fullDir)) {
    const files = fs.readdirSync(fullDir);
    files.forEach(file => {
      if (file.endsWith('.css') && !file.endsWith('.min.css')) {
        const inputPath = path.join(fullDir, file);
        const outputPath = path.join(fullDir, file.replace('.css', '.min.css'));
        processFile(inputPath, outputPath);
        console.log('');
      }
    });
  }
});

console.log('🎉 All done!');
