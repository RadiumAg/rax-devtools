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

// The hook is now injected via chrome.scripting.executeScript (MAIN world)
// from background.js, which calls chrome.runtime.sendMessage directly.
// This content script is no longer needed for detection relay.
