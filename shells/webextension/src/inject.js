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

/* global chrome */

module.exports = function(scriptName: string, done: () => void) {
  // Use chrome.scripting.executeScript via background to inject into MAIN world.
  // This bypasses page CSP that blocks <script src="chrome-extension://...">.
  var tabId = chrome.devtools.inspectedWindow.tabId;
  // Extract relative path from full chrome-extension:// URL
  var filePath = scriptName.replace(/^chrome-extension:\/\/[^/]+\//, '/');

  chrome.runtime.sendMessage(
    {type: 'inject-backend', tabId: tabId, filePath: filePath},
    function() {
      done();
    }
  );
};
