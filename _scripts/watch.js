/**
 * Watcher Script
 * Monitors CSS and JS changes and runs minification automatically.
 */

const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');

// Define watch targets
const WATCH_CONFIG = [
  {
    path: '.', // Root directory
    files: ['style.css', 'style-404.css'], // Specific files to match
    script: 'node _scripts/minify-css.js'
  },
  {
    path: 'js',
    recursive: true,
    ext: '.js',
    ignore: '.min.js',
    script: 'node _scripts/minify-js.js'
  }
];

console.log('👀 Watcher started... (Press Ctrl+C to stop)');

WATCH_CONFIG.forEach(config => {
  const watchPath = path.join(ROOT_DIR, config.path);
  
  if (!fs.existsSync(watchPath)) {
    console.log(`⚠️  Warning: Path not found: ${watchPath}`);
    return;
  }

  console.log(`   Watching: ${config.path} ${config.recursive ? '(recursive)' : ''}`);

  let fsWait = false;
  
  fs.watch(watchPath, { recursive: config.recursive || false }, (eventType, filename) => {
    if (!filename) return;

    // Debounce
    if (fsWait) return;
    fsWait = setTimeout(() => { fsWait = false; }, 100);

    // Normalize slashes
    filename = filename.replace(/\\/g, '/');

    // Check matches
    let match = false;

    // Type 1: Specific files
    if (config.files && config.files.includes(filename)) {
      match = true;
    }
    
    // Type 2: Extension match
    if (config.ext && filename.endsWith(config.ext)) {
      match = true;
      if (config.ignore && filename.includes(config.ignore)) {
        match = false;
      }
    }

    if (match) {
      console.log(`\n⚡ Change detected in ${filename}. Running minifier...`);
      
      exec(config.script, { cwd: ROOT_DIR }, (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ Error: ${error.message}`);
          return;
        }
        if (stderr) {
           // Some tools output to stderr for info, so just log it
           // console.error(`⚠️  Stderr: ${stderr}`);
        }
        console.log(stdout.trim());
      });
    }
  });
});