#!/usr/bin/env node

'use strict';

const {join} = require('path');
const {spawn} = require('child_process');
const {copySync, ensureDirSync, removeSync} = require('fs-extra');

const ROOT = join(__dirname, '..', '..');
const WEBEXT_DIR = join(__dirname, '..', 'webextension');
const DEST = join(__dirname, 'build', 'unpacked');
const DEST_BUILD = join(DEST, 'build');

const STATIC_FILES = ['icons', 'popups', 'main.html', 'panel.html'];
const MANIFEST = join(__dirname, 'manifest.json');

function copyStaticFiles() {
  ensureDirSync(DEST);

  for (const file of STATIC_FILES) {
    const src = join(WEBEXT_DIR, file);
    const dest = join(DEST, file);
    try {
      copySync(src, dest, {recursive: true});
    } catch (e) {
      console.error(`Failed to copy ${file}:`, e.message);
    }
  }

  try {
    copySync(MANIFEST, join(DEST, 'manifest.json'));
  } catch (e) {
    console.error('Failed to copy manifest.json:', e.message);
  }

  console.log('[dev] Static files copied to', DEST);
}

function watchStaticFiles() {
  const watchPaths = STATIC_FILES.map(f => join(WEBEXT_DIR, f)).concat([MANIFEST]);
  const {FSWatcher} = require('fs');
  let debounceTimer = null;

  for (const watchPath of watchPaths) {
    try {
      const watcher = new FSWatcher(watchPath, {recursive: true});
      watcher.on('change', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          console.log('[dev] Static file changed, re-copying...');
          copyStaticFiles();
        }, 200);
      });
    } catch (e) {
      // fs.watch may not work on all platforms for directories, skip silently
    }
  }
}

function runWebpack(config, label) {
  const webpackBin = join(ROOT, 'node_modules', '.bin', 'webpack');
  const args = [
    '--config', config,
    '--output-path', DEST_BUILD,
    '--watch',
  ];

  const child = spawn(webpackBin, args, {
    cwd: WEBEXT_DIR,
    stdio: 'inherit',
    env: Object.assign({}, process.env, {
      NODE_ENV: 'development',
      NODE_OPTIONS: '--openssl-legacy-provider',
    }),
  });

  child.on('error', (err) => {
    console.error(`[dev] ${label} webpack error:`, err.message);
  });

  return child;
}

// Clean previous build
removeSync(DEST);

// Copy static files
copyStaticFiles();

// Start webpack watchers
console.log('[dev] Starting webpack watchers...');
runWebpack('webpack.config.js', 'frontend');
runWebpack('webpack.backend.js', 'backend');

// Watch static files for changes
watchStaticFiles();

console.log('[dev] Dev mode running. Edit source files to auto-rebuild.');
console.log('[dev] Load extension from:', DEST);
