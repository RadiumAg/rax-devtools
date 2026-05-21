/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * Injected into the page's MAIN world via chrome.scripting.executeScript.
 * Creates the devtools global hook. Uses window.postMessage to communicate
 * with the content script since chrome APIs are not available in MAIN world.
 */
'use strict';

var installGlobalHook = require('../../../backend/installGlobalHook.js');

// Create the hook
installGlobalHook(window);

// Save native values
window.__RAX_DEVTOOLS_GLOBAL_HOOK__.nativeObjectCreate = Object.create;
window.__RAX_DEVTOOLS_GLOBAL_HOOK__.nativeMap = Map;
window.__RAX_DEVTOOLS_GLOBAL_HOOK__.nativeWeakMap = WeakMap;
window.__RAX_DEVTOOLS_GLOBAL_HOOK__.nativeSet = Set;

// Listen for renderer injection and notify via postMessage (content script relays to background)
window.__RAX_DEVTOOLS_GLOBAL_HOOK__.on('renderer', function(evt) {
  window.postMessage({
    source: 'rax-devtools-hook',
    payload: {
      hasDetectedReact: true,
      reactBuildType: evt.reactBuildType,
    },
  }, '*');
});
