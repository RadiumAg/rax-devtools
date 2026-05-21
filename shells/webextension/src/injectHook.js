/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * Injected into the page via chrome.scripting.executeScript (MAIN world).
 * Creates the devtools hook and notifies the background directly.
 */
'use strict';

/* global chrome */

var installGlobalHook = require('../../../backend/installGlobalHook.js');

// Create the hook
installGlobalHook(window);

// Save native values
window.__RAX_DEVTOOLS_GLOBAL_HOOK__.nativeObjectCreate = Object.create;
window.__RAX_DEVTOOLS_GLOBAL_HOOK__.nativeMap = Map;
window.__RAX_DEVTOOLS_GLOBAL_HOOK__.nativeWeakMap = WeakMap;
window.__RAX_DEVTOOLS_GLOBAL_HOOK__.nativeSet = Set;

// Listen for renderer injection and notify background directly
window.__RAX_DEVTOOLS_GLOBAL_HOOK__.on('renderer', function(evt) {
  console.log('[Rax DevTools] Renderer detected:', evt.reactBuildType);
  try {
    chrome.runtime.sendMessage({
      hasDetectedReact: true,
      reactBuildType: evt.reactBuildType,
    });
    console.log('[Rax DevTools] Message sent to background');
  } catch (e) {
    console.log('[Rax DevTools] Failed to send message:', e);
  }
});
