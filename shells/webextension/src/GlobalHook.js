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

// Inject hook via <script src="chrome-extension://..."> which runs in the
// page's world. This is allowed by the page's CSP because script-src 'self'
// permits loading scripts from the extension's own origin.
var script = document.createElement('script');
script.src = chrome.runtime.getURL('build/injectHook.js');
document.documentElement.appendChild(script);
script.parentNode.removeChild(script);
