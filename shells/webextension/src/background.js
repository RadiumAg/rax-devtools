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
var ports = {};

chrome.runtime.onConnect.addListener(function(port) {
  var tab = null;
  var name = null;
  if (isNumeric(port.name)) {
    tab = port.name;
    name = 'devtools';
    installContentScript(+port.name);
  } else {
    tab = port.sender.tab.id;
    name = 'content-script';
  }

  if (!ports[tab]) {
    ports[tab] = {
      devtools: null,
      'content-script': null,
    };
  }
  ports[tab][name] = port;

  if (ports[tab].devtools && ports[tab]['content-script']) {
    doublePipe(ports[tab].devtools, ports[tab]['content-script']);
  }
});

function isNumeric(str: string): boolean {
  return +str + '' === str;
}

function installContentScript(tabId: number) {
  chrome.scripting.executeScript({
    target: {tabId: tabId},
    files: ['/build/contentScript.js'],
  }).catch(function() {
    // Tab may not be ready yet, ignore
  });
}

// Inject the global hook into page's MAIN world via chrome.scripting API.
// This bypasses page CSP restrictions that block <script src="chrome-extension://...">.
function injectHookIntoPage(tabId: number) {
  chrome.scripting.executeScript({
    target: {tabId: tabId},
    files: ['/build/injectHook.js'],
    world: 'MAIN',
    injectImmediately: true,
  }).catch(function(err) {
    // Ignore errors for tabs where we cannot inject (chrome://, etc.)
  });
}

// Inject hook on every navigation so hook is available before Rax initializes
chrome.webNavigation.onCommitted.addListener(function(details) {
  if (details.frameId === 0) {
    injectHookIntoPage(details.tabId);
  }
});

function doublePipe(one, two) {
  one.onMessage.addListener(lOne);
  function lOne(message) {
    two.postMessage(message);
  }
  two.onMessage.addListener(lTwo);
  function lTwo(message) {
    one.postMessage(message);
  }
  function shutdown() {
    one.onMessage.removeListener(lOne);
    two.onMessage.removeListener(lTwo);
    one.disconnect();
    two.disconnect();
  }
  one.onDisconnect.addListener(shutdown);
  two.onDisconnect.addListener(shutdown);
}

function setIconAndPopup(reactBuildType, tabId) {
  chrome.action.setIcon({
    tabId: tabId,
    path: {
      '16': 'icons/16-' + reactBuildType + '.png',
      '32': 'icons/32-' + reactBuildType + '.png',
      '48': 'icons/48-' + reactBuildType + '.png',
      '128': 'icons/128-' + reactBuildType + '.png',
    },
  });
  chrome.action.setPopup({
    tabId: tabId,
    popup: 'popups/' + reactBuildType + '.html',
  });
}

chrome.runtime.onMessage.addListener((req, sender) => {
  if (req.hasDetectedReact && sender.tab) {
    setIconAndPopup(req.reactBuildType, sender.tab.id);
  }
});
