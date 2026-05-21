/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */
'use strict';

/* globals chrome */

// The hook (__RAX_DEVTOOLS_GLOBAL_HOOK__) is now injected into the page
// via chrome.scripting.executeScript from the background service worker.
// This content script only listens for detection messages from the page
// and forwards them to the background script.

var lastDetectionResult;

// Listen for detection messages from the page (posted by injectHook.js)
window.addEventListener('message', function(evt) {
  if (evt.source === window && evt.data && evt.data.source === 'react-devtools-detector') {
    lastDetectionResult = {
      hasDetectedReact: true,
      reactBuildType: evt.data.reactBuildType,
    };
    chrome.runtime.sendMessage(lastDetectionResult);
  }
});

// Replay last detection result on pageshow (for Firefox navigation)
window.addEventListener('pageshow', function(evt) {
  if (!lastDetectionResult || evt.target !== window.document) {
    return;
  }
  chrome.runtime.sendMessage(lastDetectionResult);
});
