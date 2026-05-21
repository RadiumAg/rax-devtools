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

// Inject the hook into pages via chrome.scripting.executeScript.
// This runs in the page's MAIN world, bypassing page CSP restrictions
// that would block inline <script> elements.
chrome.webNavigation.onCompleted.addListener(function(details) {
  if (details.frameId === 0) {
    chrome.scripting.executeScript({
      target: {tabId: details.tabId, allFrames: false},
      world: 'MAIN',
      files: ['/build/injectHook.js'],
    }).catch(function() {
      // Ignore errors (e.g. on chrome:// pages)
    });
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
  console.log('[Rax DevTools Background] Message received:', req, 'sender:', sender);
  if (req.hasDetectedReact && sender.tab) {
    var reactBuildType = req.reactBuildType;
    console.log('[Rax DevTools Background] Setting icon for tab', sender.tab.id, 'type:', reactBuildType);
    setIconAndPopup(reactBuildType, sender.tab.id);
  }
});
