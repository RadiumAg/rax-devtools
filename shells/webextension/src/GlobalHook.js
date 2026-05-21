/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * Content script that relays messages from the page's MAIN world
 * (where injectHook.js runs) to the extension's background service worker.
 *
 * @flow
 */
'use strict';

/* globals chrome */

// Relay renderer detection messages from page (MAIN world) to background
window.addEventListener('message', function(event) {
  if (
    event.source === window &&
    event.data &&
    event.data.source === 'rax-devtools-hook' &&
    event.data.payload
  ) {
    chrome.runtime.sendMessage(event.data.payload);
  }
});
