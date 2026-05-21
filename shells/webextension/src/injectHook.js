/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * This script is injected into the page via chrome.scripting.executeScript
 * (from the background service worker) to bypass page CSP restrictions.
 * It creates the __RAX_DEVTOOLS_GLOBAL_HOOK__ and sets up detection.
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

// Listen for renderer injection and notify the content script
window.__RAX_DEVTOOLS_GLOBAL_HOOK__.on('renderer', function(evt) {
  window.postMessage({
    source: 'react-devtools-detector',
    reactBuildType: evt.reactBuildType,
  }, '*');
});
