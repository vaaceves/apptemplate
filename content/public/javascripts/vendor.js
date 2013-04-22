(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    definition(module.exports, localRequire(name), module);
    var exports = cache[name] = module.exports;
    return exports;
  };

  var require = function(name) {
    var path = expand(name, '.');

    if (has(cache, path)) return cache[path];
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex];
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '"');
  };

  var define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.brunch = true;
})();

// Platform: ios

// commit ac725f6ae0bd655789771e2a40b8d60cb4c8c221

// File generated at :: Tue Feb 05 2013 05:30:42 GMT+0100 (CET)

/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at
 
     http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
*/

;(function() {

// file: lib/scripts/require.js

var require,
    define;

(function () {
    var modules = {};
    // Stack of moduleIds currently being built.
    var requireStack = [];
    // Map of module ID -> index into requireStack of modules currently being built.
    var inProgressModules = {};

    function build(module) {
        var factory = module.factory;
        module.exports = {};
        delete module.factory;
        factory(require, module.exports, module);
        return module.exports;
    }

    require = function (id) {
        if (!modules[id]) {
            throw "module " + id + " not found";
        } else if (id in inProgressModules) {
            var cycle = requireStack.slice(inProgressModules[id]).join('->') + '->' + id;
            throw "Cycle in require graph: " + cycle;
        }
        if (modules[id].factory) {
            try {
                inProgressModules[id] = requireStack.length;
                requireStack.push(id);
                return build(modules[id]);
            } finally {
                delete inProgressModules[id];
                requireStack.pop();
            }
        }
        return modules[id].exports;
    };

    define = function (id, factory) {
        if (modules[id]) {
            throw "module " + id + " already defined";
        }

        modules[id] = {
            id: id,
            factory: factory
        };
    };

    define.remove = function (id) {
        delete modules[id];
    };

    define.moduleMap = modules;
})();

//Export for use in node
if (typeof module === "object" && typeof require === "function") {
    module.exports.require = require;
    module.exports.define = define;
}

// file: lib/cordova.js
define("cordova", function(require, exports, module) {


var channel = require('cordova/channel');

/**
 * Listen for DOMContentLoaded and notify our channel subscribers.
 */
document.addEventListener('DOMContentLoaded', function() {
    channel.onDOMContentLoaded.fire();
}, false);
if (document.readyState == 'complete' || document.readyState == 'interactive') {
    channel.onDOMContentLoaded.fire();
}

/**
 * Intercept calls to addEventListener + removeEventListener and handle deviceready,
 * resume, and pause events.
 */
var m_document_addEventListener = document.addEventListener;
var m_document_removeEventListener = document.removeEventListener;
var m_window_addEventListener = window.addEventListener;
var m_window_removeEventListener = window.removeEventListener;

/**
 * Houses custom event handlers to intercept on document + window event listeners.
 */
var documentEventHandlers = {},
    windowEventHandlers = {};

document.addEventListener = function(evt, handler, capture) {
    var e = evt.toLowerCase();
    if (typeof documentEventHandlers[e] != 'undefined') {
        documentEventHandlers[e].subscribe(handler);
    } else {
        m_document_addEventListener.call(document, evt, handler, capture);
    }
};

window.addEventListener = function(evt, handler, capture) {
    var e = evt.toLowerCase();
    if (typeof windowEventHandlers[e] != 'undefined') {
        windowEventHandlers[e].subscribe(handler);
    } else {
        m_window_addEventListener.call(window, evt, handler, capture);
    }
};

document.removeEventListener = function(evt, handler, capture) {
    var e = evt.toLowerCase();
    // If unsubscribing from an event that is handled by a plugin
    if (typeof documentEventHandlers[e] != "undefined") {
        documentEventHandlers[e].unsubscribe(handler);
    } else {
        m_document_removeEventListener.call(document, evt, handler, capture);
    }
};

window.removeEventListener = function(evt, handler, capture) {
    var e = evt.toLowerCase();
    // If unsubscribing from an event that is handled by a plugin
    if (typeof windowEventHandlers[e] != "undefined") {
        windowEventHandlers[e].unsubscribe(handler);
    } else {
        m_window_removeEventListener.call(window, evt, handler, capture);
    }
};

function createEvent(type, data) {
    var event = document.createEvent('Events');
    event.initEvent(type, false, false);
    if (data) {
        for (var i in data) {
            if (data.hasOwnProperty(i)) {
                event[i] = data[i];
            }
        }
    }
    return event;
}

if(typeof window.console === "undefined") {
    window.console = {
        log:function(){}
    };
}

var cordova = {
    define:define,
    require:require,
    /**
     * Methods to add/remove your own addEventListener hijacking on document + window.
     */
    addWindowEventHandler:function(event) {
        return (windowEventHandlers[event] = channel.create(event));
    },
    addStickyDocumentEventHandler:function(event) {
        return (documentEventHandlers[event] = channel.createSticky(event));
    },
    addDocumentEventHandler:function(event) {
        return (documentEventHandlers[event] = channel.create(event));
    },
    removeWindowEventHandler:function(event) {
        delete windowEventHandlers[event];
    },
    removeDocumentEventHandler:function(event) {
        delete documentEventHandlers[event];
    },
    /**
     * Retrieve original event handlers that were replaced by Cordova
     *
     * @return object
     */
    getOriginalHandlers: function() {
        return {'document': {'addEventListener': m_document_addEventListener, 'removeEventListener': m_document_removeEventListener},
        'window': {'addEventListener': m_window_addEventListener, 'removeEventListener': m_window_removeEventListener}};
    },
    /**
     * Method to fire event from native code
     * bNoDetach is required for events which cause an exception which needs to be caught in native code
     */
    fireDocumentEvent: function(type, data, bNoDetach) {
        var evt = createEvent(type, data);
        if (typeof documentEventHandlers[type] != 'undefined') {
            if( bNoDetach ) {
              documentEventHandlers[type].fire(evt);
            }
            else {
              setTimeout(function() {
                  documentEventHandlers[type].fire(evt);
              }, 0);
            }
        } else {
            document.dispatchEvent(evt);
        }
    },
    fireWindowEvent: function(type, data) {
        var evt = createEvent(type,data);
        if (typeof windowEventHandlers[type] != 'undefined') {
            setTimeout(function() {
                windowEventHandlers[type].fire(evt);
            }, 0);
        } else {
            window.dispatchEvent(evt);
        }
    },

    /**
     * Plugin callback mechanism.
     */
    // Randomize the starting callbackId to avoid collisions after refreshing or navigating.
    // This way, it's very unlikely that any new callback would get the same callbackId as an old callback.
    callbackId: Math.floor(Math.random() * 2000000000),
    callbacks:  {},
    callbackStatus: {
        NO_RESULT: 0,
        OK: 1,
        CLASS_NOT_FOUND_EXCEPTION: 2,
        ILLEGAL_ACCESS_EXCEPTION: 3,
        INSTANTIATION_EXCEPTION: 4,
        MALFORMED_URL_EXCEPTION: 5,
        IO_EXCEPTION: 6,
        INVALID_ACTION: 7,
        JSON_EXCEPTION: 8,
        ERROR: 9
    },

    /**
     * Called by native code when returning successful result from an action.
     */
    callbackSuccess: function(callbackId, args) {
        try {
            cordova.callbackFromNative(callbackId, true, args.status, args.message, args.keepCallback);
        } catch (e) {
            console.log("Error in error callback: " + callbackId + " = "+e);
        }
    },

    /**
     * Called by native code when returning error result from an action.
     */
    callbackError: function(callbackId, args) {
        // TODO: Deprecate callbackSuccess and callbackError in favour of callbackFromNative.
        // Derive success from status.
        try {
            cordova.callbackFromNative(callbackId, false, args.status, args.message, args.keepCallback);
        } catch (e) {
            console.log("Error in error callback: " + callbackId + " = "+e);
        }
    },

    /**
     * Called by native code when returning the result from an action.
     */
    callbackFromNative: function(callbackId, success, status, message, keepCallback) {
        var callback = cordova.callbacks[callbackId];
        if (callback) {
            if (success && status == cordova.callbackStatus.OK) {
                callback.success && callback.success(message);
            } else if (!success) {
                callback.fail && callback.fail(message);
            }

            // Clear callback if not expecting any more results
            if (!keepCallback) {
                delete cordova.callbacks[callbackId];
            }
        }
    },
    addConstructor: function(func) {
        channel.onCordovaReady.subscribe(function() {
            try {
                func();
            } catch(e) {
                console.log("Failed to run constructor: " + e);
            }
        });
    }
};

// Register pause, resume and deviceready channels as events on document.
channel.onPause = cordova.addDocumentEventHandler('pause');
channel.onResume = cordova.addDocumentEventHandler('resume');
channel.onDeviceReady = cordova.addStickyDocumentEventHandler('deviceready');

module.exports = cordova;

});

// file: lib/common/argscheck.js
define("cordova/argscheck", function(require, exports, module) {

var exec = require('cordova/exec');
var utils = require('cordova/utils');

var moduleExports = module.exports;

var typeMap = {
    'A': 'Array',
    'D': 'Date',
    'N': 'Number',
    'S': 'String',
    'F': 'Function',
    'O': 'Object'
};

function extractParamName(callee, argIndex) {
  return (/.*?\((.*?)\)/).exec(callee)[1].split(', ')[argIndex];
}

function checkArgs(spec, functionName, args, opt_callee) {
    if (!moduleExports.enableChecks) {
        return;
    }
    var errMsg = null;
    var typeName;
    for (var i = 0; i < spec.length; ++i) {
        var c = spec.charAt(i),
            cUpper = c.toUpperCase(),
            arg = args[i];
        // Asterix means allow anything.
        if (c == '*') {
            continue;
        }
        typeName = utils.typeName(arg);
        if ((arg === null || arg === undefined) && c == cUpper) {
            continue;
        }
        if (typeName != typeMap[cUpper]) {
            errMsg = 'Expected ' + typeMap[cUpper];
            break;
        }
    }
    if (errMsg) {
        errMsg += ', but got ' + typeName + '.';
        errMsg = 'Wrong type for parameter "' + extractParamName(opt_callee || args.callee, i) + '" of ' + functionName + ': ' + errMsg;
        // Don't log when running jake test.
        if (typeof jasmine == 'undefined') {
            console.error(errMsg);
        }
        throw TypeError(errMsg);
    }
}

function getValue(value, defaultValue) {
    return value === undefined ? defaultValue : value;
}

moduleExports.checkArgs = checkArgs;
moduleExports.getValue = getValue;
moduleExports.enableChecks = true;


});

// file: lib/common/builder.js
define("cordova/builder", function(require, exports, module) {

var utils = require('cordova/utils');

function each(objects, func, context) {
    for (var prop in objects) {
        if (objects.hasOwnProperty(prop)) {
            func.apply(context, [objects[prop], prop]);
        }
    }
}

function clobber(obj, key, value) {
    obj[key] = value;
    // Getters can only be overridden by getters.
    if (obj[key] !== value) {
        utils.defineGetter(obj, key, function() {
            return value;
        });
    }
}

function assignOrWrapInDeprecateGetter(obj, key, value, message) {
    if (message) {
        utils.defineGetter(obj, key, function() {
            console.log(message);
            delete obj[key];
            clobber(obj, key, value);
            return value;
        });
    } else {
        clobber(obj, key, value);
    }
}

function include(parent, objects, clobber, merge) {
    each(objects, function (obj, key) {
        try {
          var result = obj.path ? require(obj.path) : {};

          if (clobber) {
              // Clobber if it doesn't exist.
              if (typeof parent[key] === 'undefined') {
                  assignOrWrapInDeprecateGetter(parent, key, result, obj.deprecated);
              } else if (typeof obj.path !== 'undefined') {
                  // If merging, merge properties onto parent, otherwise, clobber.
                  if (merge) {
                      recursiveMerge(parent[key], result);
                  } else {
                      assignOrWrapInDeprecateGetter(parent, key, result, obj.deprecated);
                  }
              }
              result = parent[key];
          } else {
            // Overwrite if not currently defined.
            if (typeof parent[key] == 'undefined') {
              assignOrWrapInDeprecateGetter(parent, key, result, obj.deprecated);
            } else {
              // Set result to what already exists, so we can build children into it if they exist.
              result = parent[key];
            }
          }

          if (obj.children) {
            include(result, obj.children, clobber, merge);
          }
        } catch(e) {
          utils.alert('Exception building cordova JS globals: ' + e + ' for key "' + key + '"');
        }
    });
}

/**
 * Merge properties from one object onto another recursively.  Properties from
 * the src object will overwrite existing target property.
 *
 * @param target Object to merge properties into.
 * @param src Object to merge properties from.
 */
function recursiveMerge(target, src) {
    for (var prop in src) {
        if (src.hasOwnProperty(prop)) {
            if (target.prototype && target.prototype.constructor === target) {
                // If the target object is a constructor override off prototype.
                clobber(target.prototype, prop, src[prop]);
            } else {
                if (typeof src[prop] === 'object' && typeof target[prop] === 'object') {
                    recursiveMerge(target[prop], src[prop]);
                } else {
                    clobber(target, prop, src[prop]);
                }
            }
        }
    }
}

module.exports = {
    buildIntoButDoNotClobber: function(objects, target) {
        include(target, objects, false, false);
    },
    buildIntoAndClobber: function(objects, target) {
        include(target, objects, true, false);
    },
    buildIntoAndMerge: function(objects, target) {
        include(target, objects, true, true);
    },
    recursiveMerge: recursiveMerge,
    assignOrWrapInDeprecateGetter: assignOrWrapInDeprecateGetter
};

});

// file: lib/common/channel.js
define("cordova/channel", function(require, exports, module) {

var utils = require('cordova/utils'),
    nextGuid = 1;

/**
 * Custom pub-sub "channel" that can have functions subscribed to it
 * This object is used to define and control firing of events for
 * cordova initialization, as well as for custom events thereafter.
 *
 * The order of events during page load and Cordova startup is as follows:
 *
 * onDOMContentLoaded*         Internal event that is received when the web page is loaded and parsed.
 * onNativeReady*              Internal event that indicates the Cordova native side is ready.
 * onCordovaReady*             Internal event fired when all Cordova JavaScript objects have been created.
 * onCordovaInfoReady*         Internal event fired when device properties are available.
 * onCordovaConnectionReady*   Internal event fired when the connection property has been set.
 * onDeviceReady*              User event fired to indicate that Cordova is ready
 * onResume                    User event fired to indicate a start/resume lifecycle event
 * onPause                     User event fired to indicate a pause lifecycle event
 * onDestroy*                  Internal event fired when app is being destroyed (User should use window.onunload event, not this one).
 *
 * The events marked with an * are sticky. Once they have fired, they will stay in the fired state.
 * All listeners that subscribe after the event is fired will be executed right away.
 *
 * The only Cordova events that user code should register for are:
 *      deviceready           Cordova native code is initialized and Cordova APIs can be called from JavaScript
 *      pause                 App has moved to background
 *      resume                App has returned to foreground
 *
 * Listeners can be registered as:
 *      document.addEventListener("deviceready", myDeviceReadyListener, false);
 *      document.addEventListener("resume", myResumeListener, false);
 *      document.addEventListener("pause", myPauseListener, false);
 *
 * The DOM lifecycle events should be used for saving and restoring state
 *      window.onload
 *      window.onunload
 *
 */

/**
 * Channel
 * @constructor
 * @param type  String the channel name
 */
var Channel = function(type, sticky) {
    this.type = type;
    // Map of guid -> function.
    this.handlers = {};
    // 0 = Non-sticky, 1 = Sticky non-fired, 2 = Sticky fired.
    this.state = sticky ? 1 : 0;
    // Used in sticky mode to remember args passed to fire().
    this.fireArgs = null;
    // Used by onHasSubscribersChange to know if there are any listeners.
    this.numHandlers = 0;
    // Function that is called when the first listener is subscribed, or when
    // the last listener is unsubscribed.
    this.onHasSubscribersChange = null;
},
    channel = {
        /**
         * Calls the provided function only after all of the channels specified
         * have been fired. All channels must be sticky channels.
         */
        join: function(h, c) {
            var len = c.length,
                i = len,
                f = function() {
                    if (!(--i)) h();
                };
            for (var j=0; j<len; j++) {
                if (c[j].state === 0) {
                    throw Error('Can only use join with sticky channels.');
                }
                c[j].subscribe(f);
            }
            if (!len) h();
        },
        create: function(type) {
            return channel[type] = new Channel(type, false);
        },
        createSticky: function(type) {
            return channel[type] = new Channel(type, true);
        },

        /**
         * cordova Channels that must fire before "deviceready" is fired.
         */
        deviceReadyChannelsArray: [],
        deviceReadyChannelsMap: {},

        /**
         * Indicate that a feature needs to be initialized before it is ready to be used.
         * This holds up Cordova's "deviceready" event until the feature has been initialized
         * and Cordova.initComplete(feature) is called.
         *
         * @param feature {String}     The unique feature name
         */
        waitForInitialization: function(feature) {
            if (feature) {
                var c = channel[feature] || this.createSticky(feature);
                this.deviceReadyChannelsMap[feature] = c;
                this.deviceReadyChannelsArray.push(c);
            }
        },

        /**
         * Indicate that initialization code has completed and the feature is ready to be used.
         *
         * @param feature {String}     The unique feature name
         */
        initializationComplete: function(feature) {
            var c = this.deviceReadyChannelsMap[feature];
            if (c) {
                c.fire();
            }
        }
    };

function forceFunction(f) {
    if (typeof f != 'function') throw "Function required as first argument!";
}

/**
 * Subscribes the given function to the channel. Any time that
 * Channel.fire is called so too will the function.
 * Optionally specify an execution context for the function
 * and a guid that can be used to stop subscribing to the channel.
 * Returns the guid.
 */
Channel.prototype.subscribe = function(f, c) {
    // need a function to call
    forceFunction(f);
    if (this.state == 2) {
        f.apply(c || this, this.fireArgs);
        return;
    }

    var func = f,
        guid = f.observer_guid;
    if (typeof c == "object") { func = utils.close(c, f); }

    if (!guid) {
        // first time any channel has seen this subscriber
        guid = '' + nextGuid++;
    }
    func.observer_guid = guid;
    f.observer_guid = guid;

    // Don't add the same handler more than once.
    if (!this.handlers[guid]) {
        this.handlers[guid] = func;
        this.numHandlers++;
        if (this.numHandlers == 1) {
            this.onHasSubscribersChange && this.onHasSubscribersChange();
        }
    }
};

/**
 * Unsubscribes the function with the given guid from the channel.
 */
Channel.prototype.unsubscribe = function(f) {
    // need a function to unsubscribe
    forceFunction(f);

    var guid = f.observer_guid,
        handler = this.handlers[guid];
    if (handler) {
        delete this.handlers[guid];
        this.numHandlers--;
        if (this.numHandlers === 0) {
            this.onHasSubscribersChange && this.onHasSubscribersChange();
        }
    }
};

/**
 * Calls all functions subscribed to this channel.
 */
Channel.prototype.fire = function(e) {
    var fail = false,
        fireArgs = Array.prototype.slice.call(arguments);
    // Apply stickiness.
    if (this.state == 1) {
        this.state = 2;
        this.fireArgs = fireArgs;
    }
    if (this.numHandlers) {
        // Copy the values first so that it is safe to modify it from within
        // callbacks.
        var toCall = [];
        for (var item in this.handlers) {
            toCall.push(this.handlers[item]);
        }
        for (var i = 0; i < toCall.length; ++i) {
            toCall[i].apply(this, fireArgs);
        }
        if (this.state == 2 && this.numHandlers) {
            this.numHandlers = 0;
            this.handlers = {};
            this.onHasSubscribersChange && this.onHasSubscribersChange();
        }
    }
};


// defining them here so they are ready super fast!
// DOM event that is received when the web page is loaded and parsed.
channel.createSticky('onDOMContentLoaded');

// Event to indicate the Cordova native side is ready.
channel.createSticky('onNativeReady');

// Event to indicate that all Cordova JavaScript objects have been created
// and it's time to run plugin constructors.
channel.createSticky('onCordovaReady');

// Event to indicate that device properties are available
channel.createSticky('onCordovaInfoReady');

// Event to indicate that the connection property has been set.
channel.createSticky('onCordovaConnectionReady');

// Event to indicate that Cordova is ready
channel.createSticky('onDeviceReady');

// Event to indicate a resume lifecycle event
channel.create('onResume');

// Event to indicate a pause lifecycle event
channel.create('onPause');

// Event to indicate a destroy lifecycle event
channel.createSticky('onDestroy');

// Channels that must fire before "deviceready" is fired.
channel.waitForInitialization('onCordovaReady');
channel.waitForInitialization('onCordovaConnectionReady');

module.exports = channel;

});

// file: lib/common/commandProxy.js
define("cordova/commandProxy", function(require, exports, module) {


// internal map of proxy function
var CommandProxyMap = {};

module.exports = {

    // example: cordova.commandProxy.add("Accelerometer",{getCurrentAcceleration: function(successCallback, errorCallback, options) {...},...);
    add:function(id,proxyObj) {
        console.log("adding proxy for " + id);
        CommandProxyMap[id] = proxyObj;
        return proxyObj;
    },

    // cordova.commandProxy.remove("Accelerometer");
    remove:function(id) {
        var proxy = CommandProxyMap[id];
        delete CommandProxyMap[id];
        CommandProxyMap[id] = null;
        return proxy;
    },

    get:function(service,action) {
        return ( CommandProxyMap[service] ? CommandProxyMap[service][action] : null );
    }
};
});

// file: lib/common/common.js
define("cordova/common", function(require, exports, module) {

module.exports = {
    defaults: {
        cordova: {
            path: 'cordova',
            children: {
                exec: {
                    path: 'cordova/exec'
                },
                logger: {
                    path: 'cordova/plugin/logger'
                }
            }
        },
        Cordova: {
            children: {
                exec: {
                    path: 'cordova/exec'
                }
            }
        },
        open : {
            path: 'cordova/plugin/InAppBrowser'
        },
        navigator: {
            children: {
                notification: {
                    path: 'cordova/plugin/notification'
                },
                accelerometer: {
                    path: 'cordova/plugin/accelerometer'
                },
                battery: {
                    path: 'cordova/plugin/battery'
                },
                camera:{
                    path: 'cordova/plugin/Camera'
                },
                compass:{
                    path: 'cordova/plugin/compass'
                },
                contacts: {
                    path: 'cordova/plugin/contacts'
                },
                device:{
                    children:{
                        capture: {
                            path: 'cordova/plugin/capture'
                        }
                    }
                },
                geolocation: {
                    path: 'cordova/plugin/geolocation'
                },
                globalization: {
                    path: 'cordova/plugin/globalization'
                },
                network: {
                    children: {
                        connection: {
                            path: 'cordova/plugin/network',
                            deprecated: 'navigator.network.connection is deprecated. Use navigator.connection instead.'
                        }
                    }
                },
                splashscreen: {
                    path: 'cordova/plugin/splashscreen'
                }
            }
        },
        Acceleration: {
            path: 'cordova/plugin/Acceleration'
        },
        Camera:{
            path: 'cordova/plugin/CameraConstants'
        },
        CameraPopoverOptions: {
            path: 'cordova/plugin/CameraPopoverOptions'
        },
        CaptureError: {
            path: 'cordova/plugin/CaptureError'
        },
        CaptureAudioOptions:{
            path: 'cordova/plugin/CaptureAudioOptions'
        },
        CaptureImageOptions: {
            path: 'cordova/plugin/CaptureImageOptions'
        },
        CaptureVideoOptions: {
            path: 'cordova/plugin/CaptureVideoOptions'
        },
        CompassHeading:{
            path: 'cordova/plugin/CompassHeading'
        },
        CompassError:{
            path: 'cordova/plugin/CompassError'
        },
        ConfigurationData: {
            path: 'cordova/plugin/ConfigurationData'
        },
        Connection: {
            path: 'cordova/plugin/Connection'
        },
        Contact: {
            path: 'cordova/plugin/Contact'
        },
        ContactAddress: {
            path: 'cordova/plugin/ContactAddress'
        },
        ContactError: {
            path: 'cordova/plugin/ContactError'
        },
        ContactField: {
            path: 'cordova/plugin/ContactField'
        },
        ContactFindOptions: {
            path: 'cordova/plugin/ContactFindOptions'
        },
        ContactName: {
            path: 'cordova/plugin/ContactName'
        },
        ContactOrganization: {
            path: 'cordova/plugin/ContactOrganization'
        },
        Coordinates: {
            path: 'cordova/plugin/Coordinates'
        },
        device: {
            path: 'cordova/plugin/device'
        },
        GlobalizationError: {
            path: 'cordova/plugin/GlobalizationError'
        },
        Media: {
            path: 'cordova/plugin/Media'
        },
        MediaError: {
            path: 'cordova/plugin/MediaError'
        },
        MediaFile: {
            path: 'cordova/plugin/MediaFile'
        },
        MediaFileData:{
            path: 'cordova/plugin/MediaFileData'
        },
        Position: {
            path: 'cordova/plugin/Position'
        },
        PositionError: {
            path: 'cordova/plugin/PositionError'
        },
        ProgressEvent: {
            path: 'cordova/plugin/ProgressEvent'
        }
    },
    clobbers: {
        navigator: {
            children: {
                connection: {
                    path: 'cordova/plugin/network'
                }
            }
        }
    }
};

});

// file: lib/ios/exec.js
define("cordova/exec", function(require, exports, module) {

/**
 * Creates a gap bridge iframe used to notify the native code about queued
 * commands.
 *
 * @private
 */
var cordova = require('cordova'),
    channel = require('cordova/channel'),
    utils = require('cordova/utils'),
    jsToNativeModes = {
        IFRAME_NAV: 0,
        XHR_NO_PAYLOAD: 1,
        XHR_WITH_PAYLOAD: 2,
        XHR_OPTIONAL_PAYLOAD: 3
    },
    bridgeMode,
    execIframe,
    execXhr,
    requestCount = 0,
    vcHeaderValue = null,
    commandQueue = [], // Contains pending JS->Native messages.
    isInContextOfEvalJs = 0;

function createExecIframe() {
    var iframe = document.createElement("iframe");
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    return iframe;
}

function shouldBundleCommandJson() {
    if (bridgeMode == jsToNativeModes.XHR_WITH_PAYLOAD) {
        return true;
    }
    if (bridgeMode == jsToNativeModes.XHR_OPTIONAL_PAYLOAD) {
        var payloadLength = 0;
        for (var i = 0; i < commandQueue.length; ++i) {
            payloadLength += commandQueue[i].length;
        }
        // The value here was determined using the benchmark within CordovaLibApp on an iPad 3.
        return payloadLength < 4500;
    }
    return false;
}

function massageArgsJsToNative(args) {
    var encodeArrayBufferAs8bitString = function(ab) {
        return String.fromCharCode.apply(null, new Uint8Array(ab));
    };
    var encodeArrayBufferAsBase64 = function(ab) {
        return window.btoa(encodeArrayBufferAs8bitString(ab));
    };
    args.forEach(function(arg, i) {
        if (utils.typeName(arg) == 'ArrayBuffer') {
            args[i] = {
                'CDVType': 'ArrayBuffer',
                'data': encodeArrayBufferAsBase64(arg)
            };
        }
    });
    return args;
}

function massagePayloadNativeToJs(payload) {
    if (payload && payload.hasOwnProperty('CDVType') && payload.CDVType == 'ArrayBuffer') {
        var stringToArrayBuffer = function(str) {
            var ret = new Uint8Array(str.length);
            for (var i = 0; i < str.length; i++) {
                ret[i] = str.charCodeAt(i);
            }
            return ret.buffer;
        };
        var base64ToArrayBuffer = function(b64) {
            return stringToArrayBuffer(atob(b64));
        };
        payload = base64ToArrayBuffer(payload.data);
    }
    return payload;
}

function iOSExec() {
    // XHR mode does not work on iOS 4.2, so default to IFRAME_NAV for such devices.
    // XHR mode's main advantage is working around a bug in -webkit-scroll, which
    // doesn't exist in 4.X devices anyways.
    if (bridgeMode === undefined) {
        bridgeMode = navigator.userAgent.indexOf(' 4_') == -1 ? jsToNativeModes.XHR_NO_PAYLOAD : jsToNativeModes.IFRAME_NAV;
    }

    var successCallback, failCallback, service, action, actionArgs, splitCommand;
    var callbackId = null;
    if (typeof arguments[0] !== "string") {
        // FORMAT ONE
        successCallback = arguments[0];
        failCallback = arguments[1];
        service = arguments[2];
        action = arguments[3];
        actionArgs = arguments[4];

        // Since we need to maintain backwards compatibility, we have to pass
        // an invalid callbackId even if no callback was provided since plugins
        // will be expecting it. The Cordova.exec() implementation allocates
        // an invalid callbackId and passes it even if no callbacks were given.
        callbackId = 'INVALID';
    } else {
        // FORMAT TWO
        splitCommand = arguments[0].split(".");
        action = splitCommand.pop();
        service = splitCommand.join(".");
        actionArgs = Array.prototype.splice.call(arguments, 1);
    }

    // Register the callbacks and add the callbackId to the positional
    // arguments if given.
    if (successCallback || failCallback) {
        callbackId = service + cordova.callbackId++;
        cordova.callbacks[callbackId] =
            {success:successCallback, fail:failCallback};
    }

    actionArgs = massageArgsJsToNative(actionArgs);

    var command = [callbackId, service, action, actionArgs];

    // Stringify and queue the command. We stringify to command now to
    // effectively clone the command arguments in case they are mutated before
    // the command is executed.
    commandQueue.push(JSON.stringify(command));

    // If we're in the context of a stringByEvaluatingJavaScriptFromString call,
    // then the queue will be flushed when it returns; no need for a poke.
    // Also, if there is already a command in the queue, then we've already
    // poked the native side, so there is no reason to do so again.
    if (!isInContextOfEvalJs && commandQueue.length == 1) {
        if (bridgeMode != jsToNativeModes.IFRAME_NAV) {
            // This prevents sending an XHR when there is already one being sent.
            // This should happen only in rare circumstances (refer to unit tests).
            if (execXhr && execXhr.readyState != 4) {
                execXhr = null;
            }
            // Re-using the XHR improves exec() performance by about 10%.
            execXhr = execXhr || new XMLHttpRequest();
            // Changing this to a GET will make the XHR reach the URIProtocol on 4.2.
            // For some reason it still doesn't work though...
            // Add a timestamp to the query param to prevent caching.
            execXhr.open('HEAD', "/!gap_exec?" + (+new Date()), true);
            if (!vcHeaderValue) {
                vcHeaderValue = /.*\((.*)\)/.exec(navigator.userAgent)[1];
            }
            execXhr.setRequestHeader('vc', vcHeaderValue);
            execXhr.setRequestHeader('rc', ++requestCount);
            if (shouldBundleCommandJson()) {
                execXhr.setRequestHeader('cmds', iOSExec.nativeFetchMessages());
            }
            execXhr.send(null);
        } else {
            execIframe = execIframe || createExecIframe();
            execIframe.src = "gap://ready";
        }
    }
}

iOSExec.jsToNativeModes = jsToNativeModes;

iOSExec.setJsToNativeBridgeMode = function(mode) {
    // Remove the iFrame since it may be no longer required, and its existence
    // can trigger browser bugs.
    // https://issues.apache.org/jira/browse/CB-593
    if (execIframe) {
        execIframe.parentNode.removeChild(execIframe);
        execIframe = null;
    }
    bridgeMode = mode;
};

iOSExec.nativeFetchMessages = function() {
    // Each entry in commandQueue is a JSON string already.
    if (!commandQueue.length) {
        return '';
    }
    var json = '[' + commandQueue.join(',') + ']';
    commandQueue.length = 0;
    return json;
};

iOSExec.nativeCallback = function(callbackId, status, payload, keepCallback) {
    return iOSExec.nativeEvalAndFetch(function() {
        var success = status === 0 || status === 1;
        payload = massagePayloadNativeToJs(payload);
        cordova.callbackFromNative(callbackId, success, status, payload, keepCallback);
    });
};

iOSExec.nativeEvalAndFetch = function(func) {
    // This shouldn't be nested, but better to be safe.
    isInContextOfEvalJs++;
    try {
        func();
        return iOSExec.nativeFetchMessages();
    } finally {
        isInContextOfEvalJs--;
    }
};

module.exports = iOSExec;

});

// file: lib/common/modulemapper.js
define("cordova/modulemapper", function(require, exports, module) {

var builder = require('cordova/builder'),
    moduleMap = define.moduleMap,
    symbolList,
    deprecationMap;

exports.reset = function() {
    symbolList = [];
    deprecationMap = {};
};

function addEntry(strategy, moduleName, symbolPath, opt_deprecationMessage) {
    if (!(moduleName in moduleMap)) {
        throw new Error('Module ' + moduleName + ' does not exist.');
    }
    symbolList.push(strategy, moduleName, symbolPath);
    if (opt_deprecationMessage) {
        deprecationMap[symbolPath] = opt_deprecationMessage;
    }
}

// Note: Android 2.3 does have Function.bind().
exports.clobbers = function(moduleName, symbolPath, opt_deprecationMessage) {
    addEntry('c', moduleName, symbolPath, opt_deprecationMessage);
};

exports.merges = function(moduleName, symbolPath, opt_deprecationMessage) {
    addEntry('m', moduleName, symbolPath, opt_deprecationMessage);
};

exports.defaults = function(moduleName, symbolPath, opt_deprecationMessage) {
    addEntry('d', moduleName, symbolPath, opt_deprecationMessage);
};

function prepareNamespace(symbolPath, context) {
    if (!symbolPath) {
        return context;
    }
    var parts = symbolPath.split('.');
    var cur = context;
    for (var i = 0, part; part = parts[i]; ++i) {
        cur[part] = cur[part] || {};
    }
    return cur[parts[i-1]];
}

exports.mapModules = function(context) {
    var origSymbols = {};
    context.CDV_origSymbols = origSymbols;
    for (var i = 0, len = symbolList.length; i < len; i += 3) {
        var strategy = symbolList[i];
        var moduleName = symbolList[i + 1];
        var symbolPath = symbolList[i + 2];
        var lastDot = symbolPath.lastIndexOf('.');
        var namespace = symbolPath.substr(0, lastDot);
        var lastName = symbolPath.substr(lastDot + 1);

        var module = require(moduleName);
        var deprecationMsg = symbolPath in deprecationMap ? 'Access made to deprecated symbol: ' + symbolPath + '. ' + deprecationMsg : null;
        var parentObj = prepareNamespace(namespace, context);
        var target = parentObj[lastName];

        if (strategy == 'm' && target) {
            builder.recursiveMerge(target, module);
        } else if ((strategy == 'd' && !target) || (strategy != 'd')) {
            if (target) {
                origSymbols[symbolPath] = target;
            }
            builder.assignOrWrapInDeprecateGetter(parentObj, lastName, module, deprecationMsg);
        }
    }
};

exports.getOriginalSymbol = function(context, symbolPath) {
    var origSymbols = context.CDV_origSymbols;
    if (origSymbols && (symbolPath in origSymbols)) {
        return origSymbols[symbolPath];
    }
    var parts = symbolPath.split('.');
    var obj = context;
    for (var i = 0; i < parts.length; ++i) {
        obj = obj && obj[parts[i]];
    }
    return obj;
};

exports.loadMatchingModules = function(matchingRegExp) {
    for (var k in moduleMap) {
        if (matchingRegExp.exec(k)) {
            require(k);
        }
    }
};

exports.reset();


});

// file: lib/ios/platform.js
define("cordova/platform", function(require, exports, module) {

module.exports = {
    id: "ios",
    initialize:function() {
        var modulemapper = require('cordova/modulemapper');

        modulemapper.loadMatchingModules(/cordova.*\/symbols$/);
        modulemapper.mapModules(window);
    },
    clobbers: {
        MediaError: { // exists natively, override
            path: "cordova/plugin/MediaError"
        },
        console: {
            path: 'cordova/plugin/ios/console'
        },
        open : {
            path: 'cordova/plugin/InAppBrowser'
        }
    },
    merges:{
        Contact:{
            path: "cordova/plugin/ios/Contact"
        },
        navigator:{
            children:{
                notification:{
                    path:"cordova/plugin/ios/notification"
                },
                contacts:{
                    path:"cordova/plugin/ios/contacts"
                },
                geolocation: {
                    path: 'cordova/plugin/geolocation'
                }
            }
        }
    }
};

// use the native logger
var logger = require("cordova/plugin/logger");
logger.useConsole(false);

});

// file: lib/common/plugin/Acceleration.js
define("cordova/plugin/Acceleration", function(require, exports, module) {

var Acceleration = function(x, y, z, timestamp) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.timestamp = timestamp || (new Date()).getTime();
};

module.exports = Acceleration;

});

// file: lib/common/plugin/Camera.js
define("cordova/plugin/Camera", function(require, exports, module) {

var argscheck = require('cordova/argscheck'),
    exec = require('cordova/exec'),
    Camera = require('cordova/plugin/CameraConstants');

var cameraExport = {};

// Tack on the Camera Constants to the base camera plugin.
for (var key in Camera) {
    cameraExport[key] = Camera[key];
}

/**
 * Gets a picture from source defined by "options.sourceType", and returns the
 * image as defined by the "options.destinationType" option.

 * The defaults are sourceType=CAMERA and destinationType=FILE_URI.
 *
 * @param {Function} successCallback
 * @param {Function} errorCallback
 * @param {Object} options
 */
cameraExport.getPicture = function(successCallback, errorCallback, options) {
    argscheck.checkArgs('fFO', 'Camera.getPicture', arguments);
    options = options || {};
    var getValue = argscheck.getValue;

    var quality = getValue(options.quality, 50);
    var destinationType = getValue(options.destinationType, Camera.DestinationType.FILE_URI);
    var sourceType = getValue(options.sourceType, Camera.PictureSourceType.CAMERA);
    var targetWidth = getValue(options.targetWidth, -1);
    var targetHeight = getValue(options.targetHeight, -1);
    var encodingType = getValue(options.encodingType, Camera.EncodingType.JPEG);
    var mediaType = getValue(options.mediaType, Camera.MediaType.PICTURE);
    var allowEdit = !!options.allowEdit;
    var correctOrientation = !!options.correctOrientation;
    var saveToPhotoAlbum = !!options.saveToPhotoAlbum;
    var popoverOptions = getValue(options.popoverOptions, null);

    var args = [quality, destinationType, sourceType, targetWidth, targetHeight, encodingType,
                mediaType, allowEdit, correctOrientation, saveToPhotoAlbum, popoverOptions];

    exec(successCallback, errorCallback, "Camera", "takePicture", args);
};

cameraExport.cleanup = function(successCallback, errorCallback) {
    exec(successCallback, errorCallback, "Camera", "cleanup", []);
};

module.exports = cameraExport;

});

// file: lib/common/plugin/CameraConstants.js
define("cordova/plugin/CameraConstants", function(require, exports, module) {

module.exports = {
  DestinationType:{
    DATA_URL: 0,         // Return base64 encoded string
    FILE_URI: 1,         // Return file uri (content://media/external/images/media/2 for Android)
    NATIVE_URI: 2        // Return native uri (eg. asset-library://... for iOS)
  },
  EncodingType:{
    JPEG: 0,             // Return JPEG encoded image
    PNG: 1               // Return PNG encoded image
  },
  MediaType:{
    PICTURE: 0,          // allow selection of still pictures only. DEFAULT. Will return format specified via DestinationType
    VIDEO: 1,            // allow selection of video only, ONLY RETURNS URL
    ALLMEDIA : 2         // allow selection from all media types
  },
  PictureSourceType:{
    PHOTOLIBRARY : 0,    // Choose image from picture library (same as SAVEDPHOTOALBUM for Android)
    CAMERA : 1,          // Take picture from camera
    SAVEDPHOTOALBUM : 2  // Choose image from picture library (same as PHOTOLIBRARY for Android)
  },
  PopoverArrowDirection:{
      ARROW_UP : 1,        // matches iOS UIPopoverArrowDirection constants to specify arrow location on popover
      ARROW_DOWN : 2,
      ARROW_LEFT : 4,
      ARROW_RIGHT : 8,
      ARROW_ANY : 15
  }
};

});

// file: lib/common/plugin/CameraPopoverOptions.js
define("cordova/plugin/CameraPopoverOptions", function(require, exports, module) {

var Camera = require('cordova/plugin/CameraConstants');

/**
 * Encapsulates options for iOS Popover image picker
 */
var CameraPopoverOptions = function(x,y,width,height,arrowDir){
    // information of rectangle that popover should be anchored to
    this.x = x || 0;
    this.y = y || 32;
    this.width = width || 320;
    this.height = height || 480;
    // The direction of the popover arrow
    this.arrowDir = arrowDir || Camera.PopoverArrowDirection.ARROW_ANY;
};

module.exports = CameraPopoverOptions;

});

// file: lib/common/plugin/CaptureAudioOptions.js
define("cordova/plugin/CaptureAudioOptions", function(require, exports, module) {

/**
 * Encapsulates all audio capture operation configuration options.
 */
var CaptureAudioOptions = function(){
    // Upper limit of sound clips user can record. Value must be equal or greater than 1.
    this.limit = 1;
    // Maximum duration of a single sound clip in seconds.
    this.duration = 0;
    // The selected audio mode. Must match with one of the elements in supportedAudioModes array.
    this.mode = null;
};

module.exports = CaptureAudioOptions;

});

// file: lib/common/plugin/CaptureError.js
define("cordova/plugin/CaptureError", function(require, exports, module) {

/**
 * The CaptureError interface encapsulates all errors in the Capture API.
 */
var CaptureError = function(c) {
   this.code = c || null;
};

// Camera or microphone failed to capture image or sound.
CaptureError.CAPTURE_INTERNAL_ERR = 0;
// Camera application or audio capture application is currently serving other capture request.
CaptureError.CAPTURE_APPLICATION_BUSY = 1;
// Invalid use of the API (e.g. limit parameter has value less than one).
CaptureError.CAPTURE_INVALID_ARGUMENT = 2;
// User exited camera application or audio capture application before capturing anything.
CaptureError.CAPTURE_NO_MEDIA_FILES = 3;
// The requested capture operation is not supported.
CaptureError.CAPTURE_NOT_SUPPORTED = 20;

module.exports = CaptureError;

});

// file: lib/common/plugin/CaptureImageOptions.js
define("cordova/plugin/CaptureImageOptions", function(require, exports, module) {

/**
 * Encapsulates all image capture operation configuration options.
 */
var CaptureImageOptions = function(){
    // Upper limit of images user can take. Value must be equal or greater than 1.
    this.limit = 1;
    // The selected image mode. Must match with one of the elements in supportedImageModes array.
    this.mode = null;
};

module.exports = CaptureImageOptions;

});

// file: lib/common/plugin/CaptureVideoOptions.js
define("cordova/plugin/CaptureVideoOptions", function(require, exports, module) {

/**
 * Encapsulates all video capture operation configuration options.
 */
var CaptureVideoOptions = function(){
    // Upper limit of videos user can record. Value must be equal or greater than 1.
    this.limit = 1;
    // Maximum duration of a single video clip in seconds.
    this.duration = 0;
    // The selected video mode. Must match with one of the elements in supportedVideoModes array.
    this.mode = null;
};

module.exports = CaptureVideoOptions;

});

// file: lib/common/plugin/CompassError.js
define("cordova/plugin/CompassError", function(require, exports, module) {

/**
 *  CompassError.
 *  An error code assigned by an implementation when an error has occurred
 * @constructor
 */
var CompassError = function(err) {
    this.code = (err !== undefined ? err : null);
};

CompassError.COMPASS_INTERNAL_ERR = 0;
CompassError.COMPASS_NOT_SUPPORTED = 20;

module.exports = CompassError;

});

// file: lib/common/plugin/CompassHeading.js
define("cordova/plugin/CompassHeading", function(require, exports, module) {

var CompassHeading = function(magneticHeading, trueHeading, headingAccuracy, timestamp) {
  this.magneticHeading = magneticHeading || null;
  this.trueHeading = trueHeading || null;
  this.headingAccuracy = headingAccuracy || null;
  this.timestamp = timestamp || new Date().getTime();
};

module.exports = CompassHeading;

});

// file: lib/common/plugin/ConfigurationData.js
define("cordova/plugin/ConfigurationData", function(require, exports, module) {

/**
 * Encapsulates a set of parameters that the capture device supports.
 */
function ConfigurationData() {
    // The ASCII-encoded string in lower case representing the media type.
    this.type = null;
    // The height attribute represents height of the image or video in pixels.
    // In the case of a sound clip this attribute has value 0.
    this.height = 0;
    // The width attribute represents width of the image or video in pixels.
    // In the case of a sound clip this attribute has value 0
    this.width = 0;
}

module.exports = ConfigurationData;

});

// file: lib/common/plugin/Connection.js
define("cordova/plugin/Connection", function(require, exports, module) {

/**
 * Network status
 */
module.exports = {
        UNKNOWN: "unknown",
        ETHERNET: "ethernet",
        WIFI: "wifi",
        CELL_2G: "2g",
        CELL_3G: "3g",
        CELL_4G: "4g",
        CELL:"cellular",
        NONE: "none"
};

});

// file: lib/common/plugin/Contact.js
define("cordova/plugin/Contact", function(require, exports, module) {

var argscheck = require('cordova/argscheck'),
    exec = require('cordova/exec'),
    ContactError = require('cordova/plugin/ContactError'),
    utils = require('cordova/utils');

/**
* Converts primitives into Complex Object
* Currently only used for Date fields
*/
function convertIn(contact) {
    var value = contact.birthday;
    try {
      contact.birthday = new Date(parseFloat(value));
    } catch (exception){
      console.log("Cordova Contact convertIn error: exception creating date.");
    }
    return contact;
}

/**
* Converts Complex objects into primitives
* Only conversion at present is for Dates.
**/

function convertOut(contact) {
    var value = contact.birthday;
    if (value !== null) {
        // try to make it a Date object if it is not already
        if (!utils.isDate(value)){
            try {
                value = new Date(value);
            } catch(exception){
                value = null;
            }
        }
        if (utils.isDate(value)){
            value = value.valueOf(); // convert to milliseconds
        }
        contact.birthday = value;
    }
    return contact;
}

/**
* Contains information about a single contact.
* @constructor
* @param {DOMString} id unique identifier
* @param {DOMString} displayName
* @param {ContactName} name
* @param {DOMString} nickname
* @param {Array.<ContactField>} phoneNumbers array of phone numbers
* @param {Array.<ContactField>} emails array of email addresses
* @param {Array.<ContactAddress>} addresses array of addresses
* @param {Array.<ContactField>} ims instant messaging user ids
* @param {Array.<ContactOrganization>} organizations
* @param {DOMString} birthday contact's birthday
* @param {DOMString} note user notes about contact
* @param {Array.<ContactField>} photos
* @param {Array.<ContactField>} categories
* @param {Array.<ContactField>} urls contact's web sites
*/
var Contact = function (id, displayName, name, nickname, phoneNumbers, emails, addresses,
    ims, organizations, birthday, note, photos, categories, urls) {
    this.id = id || null;
    this.rawId = null;
    this.displayName = displayName || null;
    this.name = name || null; // ContactName
    this.nickname = nickname || null;
    this.phoneNumbers = phoneNumbers || null; // ContactField[]
    this.emails = emails || null; // ContactField[]
    this.addresses = addresses || null; // ContactAddress[]
    this.ims = ims || null; // ContactField[]
    this.organizations = organizations || null; // ContactOrganization[]
    this.birthday = birthday || null;
    this.note = note || null;
    this.photos = photos || null; // ContactField[]
    this.categories = categories || null; // ContactField[]
    this.urls = urls || null; // ContactField[]
};

/**
* Removes contact from device storage.
* @param successCB success callback
* @param errorCB error callback
*/
Contact.prototype.remove = function(successCB, errorCB) {
    argscheck.checkArgs('FF', 'Contact.remove', arguments);
    var fail = errorCB && function(code) {
        errorCB(new ContactError(code));
    };
    if (this.id === null) {
        fail(ContactError.UNKNOWN_ERROR);
    }
    else {
        exec(successCB, fail, "Contacts", "remove", [this.id]);
    }
};

/**
* Creates a deep copy of this Contact.
* With the contact ID set to null.
* @return copy of this Contact
*/
Contact.prototype.clone = function() {
    var clonedContact = utils.clone(this);
    clonedContact.id = null;
    clonedContact.rawId = null;

    function nullIds(arr) {
        if (arr) {
            for (var i = 0; i < arr.length; ++i) {
                arr[i].id = null;
            }
        }
    }

    // Loop through and clear out any id's in phones, emails, etc.
    nullIds(clonedContact.phoneNumbers);
    nullIds(clonedContact.emails);
    nullIds(clonedContact.addresses);
    nullIds(clonedContact.ims);
    nullIds(clonedContact.organizations);
    nullIds(clonedContact.categories);
    nullIds(clonedContact.photos);
    nullIds(clonedContact.urls);
    return clonedContact;
};

/**
* Persists contact to device storage.
* @param successCB success callback
* @param errorCB error callback
*/
Contact.prototype.save = function(successCB, errorCB) {
    argscheck.checkArgs('FFO', 'Contact.save', arguments);
    var fail = errorCB && function(code) {
        errorCB(new ContactError(code));
    };
    var success = function(result) {
        if (result) {
            if (successCB) {
                var fullContact = require('cordova/plugin/contacts').create(result);
                successCB(convertIn(fullContact));
            }
        }
        else {
            // no Entry object returned
            fail(ContactError.UNKNOWN_ERROR);
        }
    };
    var dupContact = convertOut(utils.clone(this));
    exec(success, fail, "Contacts", "save", [dupContact]);
};


module.exports = Contact;

});

// file: lib/common/plugin/ContactAddress.js
define("cordova/plugin/ContactAddress", function(require, exports, module) {

/**
* Contact address.
* @constructor
* @param {DOMString} id unique identifier, should only be set by native code
* @param formatted // NOTE: not a W3C standard
* @param streetAddress
* @param locality
* @param region
* @param postalCode
* @param country
*/

var ContactAddress = function(pref, type, formatted, streetAddress, locality, region, postalCode, country) {
    this.id = null;
    this.pref = (typeof pref != 'undefined' ? pref : false);
    this.type = type || null;
    this.formatted = formatted || null;
    this.streetAddress = streetAddress || null;
    this.locality = locality || null;
    this.region = region || null;
    this.postalCode = postalCode || null;
    this.country = country || null;
};

module.exports = ContactAddress;

});

// file: lib/common/plugin/ContactError.js
define("cordova/plugin/ContactError", function(require, exports, module) {

/**
 *  ContactError.
 *  An error code assigned by an implementation when an error has occurred
 * @constructor
 */
var ContactError = function(err) {
    this.code = (typeof err != 'undefined' ? err : null);
};

/**
 * Error codes
 */
ContactError.UNKNOWN_ERROR = 0;
ContactError.INVALID_ARGUMENT_ERROR = 1;
ContactError.TIMEOUT_ERROR = 2;
ContactError.PENDING_OPERATION_ERROR = 3;
ContactError.IO_ERROR = 4;
ContactError.NOT_SUPPORTED_ERROR = 5;
ContactError.PERMISSION_DENIED_ERROR = 20;

module.exports = ContactError;

});

// file: lib/common/plugin/ContactField.js
define("cordova/plugin/ContactField", function(require, exports, module) {

/**
* Generic contact field.
* @constructor
* @param {DOMString} id unique identifier, should only be set by native code // NOTE: not a W3C standard
* @param type
* @param value
* @param pref
*/
var ContactField = function(type, value, pref) {
    this.id = null;
    this.type = (type && type.toString()) || null;
    this.value = (value && value.toString()) || null;
    this.pref = (typeof pref != 'undefined' ? pref : false);
};

module.exports = ContactField;

});

// file: lib/common/plugin/ContactFindOptions.js
define("cordova/plugin/ContactFindOptions", function(require, exports, module) {

/**
 * ContactFindOptions.
 * @constructor
 * @param filter used to match contacts against
 * @param multiple boolean used to determine if more than one contact should be returned
 */

var ContactFindOptions = function(filter, multiple) {
    this.filter = filter || '';
    this.multiple = (typeof multiple != 'undefined' ? multiple : false);
};

module.exports = ContactFindOptions;

});

// file: lib/common/plugin/ContactName.js
define("cordova/plugin/ContactName", function(require, exports, module) {

/**
* Contact name.
* @constructor
* @param formatted // NOTE: not part of W3C standard
* @param familyName
* @param givenName
* @param middle
* @param prefix
* @param suffix
*/
var ContactName = function(formatted, familyName, givenName, middle, prefix, suffix) {
    this.formatted = formatted || null;
    this.familyName = familyName || null;
    this.givenName = givenName || null;
    this.middleName = middle || null;
    this.honorificPrefix = prefix || null;
    this.honorificSuffix = suffix || null;
};

module.exports = ContactName;

});

// file: lib/common/plugin/ContactOrganization.js
define("cordova/plugin/ContactOrganization", function(require, exports, module) {

/**
* Contact organization.
* @constructor
* @param {DOMString} id unique identifier, should only be set by native code // NOTE: not a W3C standard
* @param name
* @param dept
* @param title
* @param startDate
* @param endDate
* @param location
* @param desc
*/

var ContactOrganization = function(pref, type, name, dept, title) {
    this.id = null;
    this.pref = (typeof pref != 'undefined' ? pref : false);
    this.type = type || null;
    this.name = name || null;
    this.department = dept || null;
    this.title = title || null;
};

module.exports = ContactOrganization;

});

// file: lib/common/plugin/Coordinates.js
define("cordova/plugin/Coordinates", function(require, exports, module) {

/**
 * This class contains position information.
 * @param {Object} lat
 * @param {Object} lng
 * @param {Object} alt
 * @param {Object} acc
 * @param {Object} head
 * @param {Object} vel
 * @param {Object} altacc
 * @constructor
 */
var Coordinates = function(lat, lng, alt, acc, head, vel, altacc) {
    /**
     * The latitude of the position.
     */
    this.latitude = lat;
    /**
     * The longitude of the position,
     */
    this.longitude = lng;
    /**
     * The accuracy of the position.
     */
    this.accuracy = acc;
    /**
     * The altitude of the position.
     */
    this.altitude = (alt !== undefined ? alt : null);
    /**
     * The direction the device is moving at the position.
     */
    this.heading = (head !== undefined ? head : null);
    /**
     * The velocity with which the device is moving at the position.
     */
    this.speed = (vel !== undefined ? vel : null);

    if (this.speed === 0 || this.speed === null) {
        this.heading = NaN;
    }

    /**
     * The altitude accuracy of the position.
     */
    this.altitudeAccuracy = (altacc !== undefined) ? altacc : null;
};

module.exports = Coordinates;

});

// file: lib/common/plugin/DirectoryEntry.js
define("cordova/plugin/DirectoryEntry", function(require, exports, module) {

var argscheck = require('cordova/argscheck'),
    utils = require('cordova/utils'),
    exec = require('cordova/exec'),
    Entry = require('cordova/plugin/Entry'),
    FileError = require('cordova/plugin/FileError'),
    DirectoryReader = require('cordova/plugin/DirectoryReader');

/**
 * An interface representing a directory on the file system.
 *
 * {boolean} isFile always false (readonly)
 * {boolean} isDirectory always true (readonly)
 * {DOMString} name of the directory, excluding the path leading to it (readonly)
 * {DOMString} fullPath the absolute full path to the directory (readonly)
 * TODO: implement this!!! {FileSystem} filesystem on which the directory resides (readonly)
 */
var DirectoryEntry = function(name, fullPath) {
     DirectoryEntry.__super__.constructor.call(this, false, true, name, fullPath);
};

utils.extend(DirectoryEntry, Entry);

/**
 * Creates a new DirectoryReader to read entries from this directory
 */
DirectoryEntry.prototype.createReader = function() {
    return new DirectoryReader(this.fullPath);
};

/**
 * Creates or looks up a directory
 *
 * @param {DOMString} path either a relative or absolute path from this directory in which to look up or create a directory
 * @param {Flags} options to create or exclusively create the directory
 * @param {Function} successCallback is called with the new entry
 * @param {Function} errorCallback is called with a FileError
 */
DirectoryEntry.prototype.getDirectory = function(path, options, successCallback, errorCallback) {
    argscheck.checkArgs('sOFF', 'DirectoryEntry.getDirectory', arguments);
    var win = successCallback && function(result) {
        var entry = new DirectoryEntry(result.name, result.fullPath);
        successCallback(entry);
    };
    var fail = errorCallback && function(code) {
        errorCallback(new FileError(code));
    };
    exec(win, fail, "File", "getDirectory", [this.fullPath, path, options]);
};

/**
 * Deletes a directory and all of it's contents
 *
 * @param {Function} successCallback is called with no parameters
 * @param {Function} errorCallback is called with a FileError
 */
DirectoryEntry.prototype.removeRecursively = function(successCallback, errorCallback) {
    argscheck.checkArgs('FF', 'DirectoryEntry.removeRecursively', arguments);
    var fail = errorCallback && function(code) {
        errorCallback(new FileError(code));
    };
    exec(successCallback, fail, "File", "removeRecursively", [this.fullPath]);
};

/**
 * Creates or looks up a file
 *
 * @param {DOMString} path either a relative or absolute path from this directory in which to look up or create a file
 * @param {Flags} options to create or exclusively create the file
 * @param {Function} successCallback is called with the new entry
 * @param {Function} errorCallback is called with a FileError
 */
DirectoryEntry.prototype.getFile = function(path, options, successCallback, errorCallback) {
    argscheck.checkArgs('sOFF', 'DirectoryEntry.getFile', arguments);
    var win = successCallback && function(result) {
        var FileEntry = require('cordova/plugin/FileEntry');
        var entry = new FileEntry(result.name, result.fullPath);
        successCallback(entry);
    };
    var fail = errorCallback && function(code) {
        errorCallback(new FileError(code));
    };
    exec(win, fail, "File", "getFile", [this.fullPath, path, options]);
};

module.exports = DirectoryEntry;

});

// file: lib/common/plugin/DirectoryReader.js
define("cordova/plugin/DirectoryReader", function(require, exports, module) {

var exec = require('cordova/exec'),
    FileError = require('cordova/plugin/FileError') ;

/**
 * An interface that lists the files and directories in a directory.
 */
function DirectoryReader(path) {
    this.path = path || null;
}

/**
 * Returns a list of entries from a directory.
 *
 * @param {Function} successCallback is called with a list of entries
 * @param {Function} errorCallback is called with a FileError
 */
DirectoryReader.prototype.readEntries = function(successCallback, errorCallback) {
    var win = typeof successCallback !== 'function' ? null : function(result) {
        var retVal = [];
        for (var i=0; i<result.length; i++) {
            var entry = null;
            if (result[i].isDirectory) {
                entry = new (require('cordova/plugin/DirectoryEntry'))();
            }
            else if (result[i].isFile) {
                entry = new (require('cordova/plugin/FileEntry'))();
            }
            entry.isDirectory = result[i].isDirectory;
            entry.isFile = result[i].isFile;
            entry.name = result[i].name;
            entry.fullPath = result[i].fullPath;
            retVal.push(entry);
        }
        successCallback(retVal);
    };
    var fail = typeof errorCallback !== 'function' ? null : function(code) {
        errorCallback(new FileError(code));
    };
    exec(win, fail, "File", "readEntries", [this.path]);
};

module.exports = DirectoryReader;

});

// file: lib/common/plugin/Entry.js
define("cordova/plugin/Entry", function(require, exports, module) {

var argscheck = require('cordova/argscheck'),
    exec = require('cordova/exec'),
    FileError = require('cordova/plugin/FileError'),
    Metadata = require('cordova/plugin/Metadata');

/**
 * Represents a file or directory on the local file system.
 *
 * @param isFile
 *            {boolean} true if Entry is a file (readonly)
 * @param isDirectory
 *            {boolean} true if Entry is a directory (readonly)
 * @param name
 *            {DOMString} name of the file or directory, excluding the path
 *            leading to it (readonly)
 * @param fullPath
 *            {DOMString} the absolute full path to the file or directory
 *            (readonly)
 */
function Entry(isFile, isDirectory, name, fullPath, fileSystem) {
    this.isFile = !!isFile;
    this.isDirectory = !!isDirectory;
    this.name = name || '';
    this.fullPath = fullPath || '';
    this.filesystem = fileSystem || null;
}

/**
 * Look up the metadata of the entry.
 *
 * @param successCallback
 *            {Function} is called with a Metadata object
 * @param errorCallback
 *            {Function} is called with a FileError
 */
Entry.prototype.getMetadata = function(successCallback, errorCallback) {
    argscheck.checkArgs('FF', 'Entry.getMetadata', arguments);
    var success = successCallback && function(lastModified) {
        var metadata = new Metadata(lastModified);
        successCallback(metadata);
    };
    var fail = errorCallback && function(code) {
        errorCallback(new FileError(code));
    };

    exec(success, fail, "File", "getMetadata", [this.fullPath]);
};

/**
 * Set the metadata of the entry.
 *
 * @param successCallback
 *            {Function} is called with a Metadata object
 * @param errorCallback
 *            {Function} is called with a FileError
 * @param metadataObject
 *            {Object} keys and values to set
 */
Entry.prototype.setMetadata = function(successCallback, errorCallback, metadataObject) {
    argscheck.checkArgs('FFO', 'Entry.setMetadata', arguments);
    exec(successCallback, errorCallback, "File", "setMetadata", [this.fullPath, metadataObject]);
};

/**
 * Move a file or directory to a new location.
 *
 * @param parent
 *            {DirectoryEntry} the directory to which to move this entry
 * @param newName
 *            {DOMString} new name of the entry, defaults to the current name
 * @param successCallback
 *            {Function} called with the new DirectoryEntry object
 * @param errorCallback
 *            {Function} called with a FileError
 */
Entry.prototype.moveTo = function(parent, newName, successCallback, errorCallback) {
    argscheck.checkArgs('oSFF', 'Entry.moveTo', arguments);
    var fail = errorCallback && function(code) {
        errorCallback(new FileError(code));
    };
    // source path
    var srcPath = this.fullPath,
        // entry name
        name = newName || this.name,
        success = function(entry) {
            if (entry) {
                if (successCallback) {
                    // create appropriate Entry object
                    var result = (entry.isDirectory) ? new (require('cordova/plugin/DirectoryEntry'))(entry.name, entry.fullPath) : new (require('cordova/plugin/FileEntry'))(entry.name, entry.fullPath);
                    successCallback(result);
                }
            }
            else {
                // no Entry object returned
                fail && fail(FileError.NOT_FOUND_ERR);
            }
        };

    // copy
    exec(success, fail, "File", "moveTo", [srcPath, parent.fullPath, name]);
};

/**
 * Copy a directory to a different location.
 *
 * @param parent
 *            {DirectoryEntry} the directory to which to copy the entry
 * @param newName
 *            {DOMString} new name of the entry, defaults to the current name
 * @param successCallback
 *            {Function} called with the new Entry object
 * @param errorCallback
 *            {Function} called with a FileError
 */
Entry.prototype.copyTo = function(parent, newName, successCallback, errorCallback) {
    argscheck.checkArgs('oSFF', 'Entry.copyTo', arguments);
    var fail = errorCallback && function(code) {
        errorCallback(new FileError(code));
    };

        // source path
    var srcPath = this.fullPath,
        // entry name
        name = newName || this.name,
        // success callback
        success = function(entry) {
            if (entry) {
                if (successCallback) {
                    // create appropriate Entry object
                    var result = (entry.isDirectory) ? new (require('cordova/plugin/DirectoryEntry'))(entry.name, entry.fullPath) : new (require('cordova/plugin/FileEntry'))(entry.name, entry.fullPath);
                    successCallback(result);
                }
            }
            else {
                // no Entry object returned
                fail && fail(FileError.NOT_FOUND_ERR);
            }
        };

    // copy
    exec(success, fail, "File", "copyTo", [srcPath, parent.fullPath, name]);
};

/**
 * Return a URL that can be used to identify this entry.
 */
Entry.prototype.toURL = function() {
    // fullPath attribute contains the full URL
    return this.fullPath;
};

/**
 * Returns a URI that can be used to identify this entry.
 *
 * @param {DOMString} mimeType for a FileEntry, the mime type to be used to interpret the file, when loaded through this URI.
 * @return uri
 */
Entry.prototype.toURI = function(mimeType) {
    console.log("DEPRECATED: Update your code to use 'toURL'");
    // fullPath attribute contains the full URI
    return this.toURL();
};

/**
 * Remove a file or directory. It is an error to attempt to delete a
 * directory that is not empty. It is an error to attempt to delete a
 * root directory of a file system.
 *
 * @param successCallback {Function} called with no parameters
 * @param errorCallback {Function} called with a FileError
 */
Entry.prototype.remove = function(successCallback, errorCallback) {
    argscheck.checkArgs('FF', 'Entry.remove', arguments);
    var fail = errorCallback && function(code) {
        errorCallback(new FileError(code));
    };
    exec(successCallback, fail, "File", "remove", [this.fullPath]);
};

/**
 * Look up the parent DirectoryEntry of this entry.
 *
 * @param successCallback {Function} called with the parent DirectoryEntry object
 * @param errorCallback {Function} called with a FileError
 */
Entry.prototype.getParent = function(successCallback, errorCallback) {
    argscheck.checkArgs('FF', 'Entry.getParent', arguments);
    var win = successCallback && function(result) {
        var DirectoryEntry = require('cordova/plugin/DirectoryEntry');
        var entry = new DirectoryEntry(result.name, result.fullPath);
        successCallback(entry);
    };
    var fail = errorCallback && function(code) {
        errorCallback(new FileError(code));
    };
    exec(win, fail, "File", "getParent", [this.fullPath]);
};

module.exports = Entry;

});

// file: lib/common/plugin/File.js
define("cordova/plugin/File", function(require, exports, module) {

/**
 * Constructor.
 * name {DOMString} name of the file, without path information
 * fullPath {DOMString} the full path of the file, including the name
 * type {DOMString} mime type
 * lastModifiedDate {Date} last modified date
 * size {Number} size of the file in bytes
 */

var File = function(name, fullPath, type, lastModifiedDate, size){
    this.name = name || '';
    this.fullPath = fullPath || null;
    this.type = type || null;
    this.lastModifiedDate = lastModifiedDate || null;
    this.size = size || 0;

    // These store the absolute start and end for slicing the file.
    this.start = 0;
    this.end = this.size;
};

/**
 * Returns a "slice" of the file. Since Cordova Files don't contain the actual
 * content, this really returns a File with adjusted start and end.
 * Slices of slices are supported.
 * start {Number} The index at which to start the slice (inclusive).
 * end {Number} The index at which to end the slice (exclusive).
 */
File.prototype.slice = function(start, end) {
    var size = this.end - this.start;
    var newStart = 0;
    var newEnd = size;
    if (arguments.length) {
        if (start < 0) {
            newStart = Math.max(size + start, 0);
        } else {
            newStart = Math.min(size, start);
        }
    }

    if (arguments.length >= 2) {
        if (end < 0) {
            newEnd = Math.max(size + end, 0);
        } else {
            newEnd = Math.min(end, size);
        }
    }

    var newFile = new File(this.name, this.fullPath, this.type, this.lastModifiedData, this.size);
    newFile.start = this.start + newStart;
    newFile.end = this.start + newEnd;
    return newFile;
};


module.exports = File;

});

// file: lib/common/plugin/FileEntry.js
define("cordova/plugin/FileEntry", function(require, exports, module) {

var utils = require('cordova/utils'),
    exec = require('cordova/exec'),
    Entry = require('cordova/plugin/Entry'),
    FileWriter = require('cordova/plugin/FileWriter'),
    File = require('cordova/plugin/File'),
    FileError = require('cordova/plugin/FileError');

/**
 * An interface representing a file on the file system.
 *
 * {boolean} isFile always true (readonly)
 * {boolean} isDirectory always false (readonly)
 * {DOMString} name of the file, excluding the path leading to it (readonly)
 * {DOMString} fullPath the absolute full path to the file (readonly)
 * {FileSystem} filesystem on which the file resides (readonly)
 */
var FileEntry = function(name, fullPath) {
     FileEntry.__super__.constructor.apply(this, [true, false, name, fullPath]);
};

utils.extend(FileEntry, Entry);

/**
 * Creates a new FileWriter associated with the file that this FileEntry represents.
 *
 * @param {Function} successCallback is called with the new FileWriter
 * @param {Function} errorCallback is called with a FileError
 */
FileEntry.prototype.createWriter = function(successCallback, errorCallback) {
    this.file(function(filePointer) {
        var writer = new FileWriter(filePointer);

        if (writer.fileName === null || writer.fileName === "") {
            errorCallback && errorCallback(new FileError(FileError.INVALID_STATE_ERR));
        } else {
            successCallback && successCallback(writer);
        }
    }, errorCallback);
};

/**
 * Returns a File that represents the current state of the file that this FileEntry represents.
 *
 * @param {Function} successCallback is called with the new File object
 * @param {Function} errorCallback is called with a FileError
 */
FileEntry.prototype.file = function(successCallback, errorCallback) {
    var win = successCallback && function(f) {
        var file = new File(f.name, f.fullPath, f.type, f.lastModifiedDate, f.size);
        successCallback(file);
    };
    var fail = errorCallback && function(code) {
        errorCallback(new FileError(code));
    };
    exec(win, fail, "File", "getFileMetadata", [this.fullPath]);
};


module.exports = FileEntry;

});

// file: lib/common/plugin/FileError.js
define("cordova/plugin/FileError", function(require, exports, module) {

/**
 * FileError
 */
function FileError(error) {
  this.code = error || null;
}

// File error codes
// Found in DOMException
FileError.NOT_FOUND_ERR = 1;
FileError.SECURITY_ERR = 2;
FileError.ABORT_ERR = 3;

// Added by File API specification
FileError.NOT_READABLE_ERR = 4;
FileError.ENCODING_ERR = 5;
FileError.NO_MODIFICATION_ALLOWED_ERR = 6;
FileError.INVALID_STATE_ERR = 7;
FileError.SYNTAX_ERR = 8;
FileError.INVALID_MODIFICATION_ERR = 9;
FileError.QUOTA_EXCEEDED_ERR = 10;
FileError.TYPE_MISMATCH_ERR = 11;
FileError.PATH_EXISTS_ERR = 12;

module.exports = FileError;

});

// file: lib/common/plugin/FileReader.js
define("cordova/plugin/FileReader", function(require, exports, module) {

var exec = require('cordova/exec'),
    modulemapper = require('cordova/modulemapper'),
    utils = require('cordova/utils'),
    File = require('cordova/plugin/File'),
    FileError = require('cordova/plugin/FileError'),
    ProgressEvent = require('cordova/plugin/ProgressEvent'),
    origFileReader = modulemapper.getOriginalSymbol(this, 'FileReader');

/**
 * This class reads the mobile device file system.
 *
 * For Android:
 *      The root directory is the root of the file system.
 *      To read from the SD card, the file name is "sdcard/my_file.txt"
 * @constructor
 */
var FileReader = function() {
    this._readyState = 0;
    this._error = null;
    this._result = null;
    this._fileName = '';
    this._realReader = origFileReader ? new origFileReader() : {};
};

// States
FileReader.EMPTY = 0;
FileReader.LOADING = 1;
FileReader.DONE = 2;

utils.defineGetter(FileReader.prototype, 'readyState', function() {
    return this._fileName ? this._readyState : this._realReader.readyState;
});

utils.defineGetter(FileReader.prototype, 'error', function() {
    return this._fileName ? this._error: this._realReader.error;
});

utils.defineGetter(FileReader.prototype, 'result', function() {
    return this._fileName ? this._result: this._realReader.result;
});

function defineEvent(eventName) {
    utils.defineGetterSetter(FileReader.prototype, eventName, function() {
        return this._realReader[eventName] || null;
    }, function(value) {
        this._realReader[eventName] = value;
    });
}
defineEvent('onloadstart');    // When the read starts.
defineEvent('onprogress');     // While reading (and decoding) file or fileBlob data, and reporting partial file data (progress.loaded/progress.total)
defineEvent('onload');         // When the read has successfully completed.
defineEvent('onerror');        // When the read has failed (see errors).
defineEvent('onloadend');      // When the request has completed (either in success or failure).
defineEvent('onabort');        // When the read has been aborted. For instance, by invoking the abort() method.

function initRead(reader, file) {
    // Already loading something
    if (reader.readyState == FileReader.LOADING) {
      throw new FileError(FileError.INVALID_STATE_ERR);
    }

    reader._result = null;
    reader._error = null;
    reader._readyState = FileReader.LOADING;

    if (typeof file == 'string') {
        // Deprecated in Cordova 2.4.
        console.warning('Using a string argument with FileReader.readAs functions is deprecated.');
        reader._fileName = file;
    } else if (typeof file.fullPath == 'string') {
        reader._fileName = file.fullPath;
    } else {
        reader._fileName = '';
        return true;
    }

    reader.onloadstart && reader.onloadstart(new ProgressEvent("loadstart", {target:reader}));
}

/**
 * Abort reading file.
 */
FileReader.prototype.abort = function() {
    if (origFileReader && !this._fileName) {
        return this._realReader.abort();
    }
    this._result = null;

    if (this._readyState == FileReader.DONE || this._readyState == FileReader.EMPTY) {
      return;
    }

    this._readyState = FileReader.DONE;

    // If abort callback
    if (typeof this.onabort === 'function') {
        this.onabort(new ProgressEvent('abort', {target:this}));
    }
    // If load end callback
    if (typeof this.onloadend === 'function') {
        this.onloadend(new ProgressEvent('loadend', {target:this}));
    }
};

/**
 * Read text file.
 *
 * @param file          {File} File object containing file properties
 * @param encoding      [Optional] (see http://www.iana.org/assignments/character-sets)
 */
FileReader.prototype.readAsText = function(file, encoding) {
    if (initRead(this, file)) {
        return this._realReader.readAsText(file, encoding);
    }

    // Default encoding is UTF-8
    var enc = encoding ? encoding : "UTF-8";
    var me = this;
    var execArgs = [this._fileName, enc];

    // Maybe add slice parameters.
    if (file.end < file.size) {
        execArgs.push(file.start, file.end);
    } else if (file.start > 0) {
        execArgs.push(file.start);
    }

    // Read file
    exec(
        // Success callback
        function(r) {
            // If DONE (cancelled), then don't do anything
            if (me._readyState === FileReader.DONE) {
                return;
            }

            // Save result
            me._result = r;

            // If onload callback
            if (typeof me.onload === "function") {
                me.onload(new ProgressEvent("load", {target:me}));
            }

            // DONE state
            me._readyState = FileReader.DONE;

            // If onloadend callback
            if (typeof me.onloadend === "function") {
                me.onloadend(new ProgressEvent("loadend", {target:me}));
            }
        },
        // Error callback
        function(e) {
            // If DONE (cancelled), then don't do anything
            if (me._readyState === FileReader.DONE) {
                return;
            }

            // DONE state
            me._readyState = FileReader.DONE;

            // null result
            me._result = null;

            // Save error
            me._error = new FileError(e);

            // If onerror callback
            if (typeof me.onerror === "function") {
                me.onerror(new ProgressEvent("error", {target:me}));
            }

            // If onloadend callback
            if (typeof me.onloadend === "function") {
                me.onloadend(new ProgressEvent("loadend", {target:me}));
            }
        }, "File", "readAsText", execArgs);
};


/**
 * Read file and return data as a base64 encoded data url.
 * A data url is of the form:
 *      data:[<mediatype>][;base64],<data>
 *
 * @param file          {File} File object containing file properties
 */
FileReader.prototype.readAsDataURL = function(file) {
    if (initRead(this, file)) {
        return this._realReader.readAsDataURL(file);
    }

    var me = this;
    var execArgs = [this._fileName];

    // Maybe add slice parameters.
    if (file.end < file.size) {
        execArgs.push(file.start, file.end);
    } else if (file.start > 0) {
        execArgs.push(file.start);
    }

    // Read file
    exec(
        // Success callback
        function(r) {
            // If DONE (cancelled), then don't do anything
            if (me._readyState === FileReader.DONE) {
                return;
            }

            // DONE state
            me._readyState = FileReader.DONE;

            // Save result
            me._result = r;

            // If onload callback
            if (typeof me.onload === "function") {
                me.onload(new ProgressEvent("load", {target:me}));
            }

            // If onloadend callback
            if (typeof me.onloadend === "function") {
                me.onloadend(new ProgressEvent("loadend", {target:me}));
            }
        },
        // Error callback
        function(e) {
            // If DONE (cancelled), then don't do anything
            if (me._readyState === FileReader.DONE) {
                return;
            }

            // DONE state
            me._readyState = FileReader.DONE;

            me._result = null;

            // Save error
            me._error = new FileError(e);

            // If onerror callback
            if (typeof me.onerror === "function") {
                me.onerror(new ProgressEvent("error", {target:me}));
            }

            // If onloadend callback
            if (typeof me.onloadend === "function") {
                me.onloadend(new ProgressEvent("loadend", {target:me}));
            }
        }, "File", "readAsDataURL", execArgs);
};

/**
 * Read file and return data as a binary data.
 *
 * @param file          {File} File object containing file properties
 */
FileReader.prototype.readAsBinaryString = function(file) {
    if (initRead(this, file)) {
        return this._realReader.readAsBinaryString(file);
    }
    // TODO - Can't return binary data to browser.
    console.log('method "readAsBinaryString" is not supported at this time.');
    this.abort();
};

/**
 * Read file and return data as a binary data.
 *
 * @param file          {File} File object containing file properties
 */
FileReader.prototype.readAsArrayBuffer = function(file) {
    if (initRead(this, file)) {
        return this._realReader.readAsArrayBuffer(file);
    }
    // TODO - Can't return binary data to browser.
    console.log('This method is not supported at this time.');
    this.abort();
};

module.exports = FileReader;

});

// file: lib/common/plugin/FileSystem.js
define("cordova/plugin/FileSystem", function(require, exports, module) {

var DirectoryEntry = require('cordova/plugin/DirectoryEntry');

/**
 * An interface representing a file system
 *
 * @constructor
 * {DOMString} name the unique name of the file system (readonly)
 * {DirectoryEntry} root directory of the file system (readonly)
 */
var FileSystem = function(name, root) {
    this.name = name || null;
    if (root) {
        this.root = new DirectoryEntry(root.name, root.fullPath);
    }
};

module.exports = FileSystem;

});

// file: lib/common/plugin/FileTransfer.js
define("cordova/plugin/FileTransfer", function(require, exports, module) {

var argscheck = require('cordova/argscheck'),
    exec = require('cordova/exec'),
    FileTransferError = require('cordova/plugin/FileTransferError'),
    ProgressEvent = require('cordova/plugin/ProgressEvent');

function newProgressEvent(result) {
    var pe = new ProgressEvent();
    pe.lengthComputable = result.lengthComputable;
    pe.loaded = result.loaded;
    pe.total = result.total;
    return pe;
}

var idCounter = 0;

/**
 * FileTransfer uploads a file to a remote server.
 * @constructor
 */
var FileTransfer = function() {
    this._id = ++idCounter;
    this.onprogress = null; // optional callback
};

/**
* Given an absolute file path, uploads a file on the device to a remote server
* using a multipart HTTP request.
* @param filePath {String}           Full path of the file on the device
* @param server {String}             URL of the server to receive the file
* @param successCallback (Function}  Callback to be invoked when upload has completed
* @param errorCallback {Function}    Callback to be invoked upon error
* @param options {FileUploadOptions} Optional parameters such as file name and mimetype
* @param trustAllHosts {Boolean} Optional trust all hosts (e.g. for self-signed certs), defaults to false
*/
FileTransfer.prototype.upload = function(filePath, server, successCallback, errorCallback, options, trustAllHosts) {
    argscheck.checkArgs('ssFFO*', 'FileTransfer.upload', arguments);
    // check for options
    var fileKey = null;
    var fileName = null;
    var mimeType = null;
    var params = null;
    var chunkedMode = true;
    var headers = null;
    if (options) {
        fileKey = options.fileKey;
        fileName = options.fileName;
        mimeType = options.mimeType;
        headers = options.headers;
        if (options.chunkedMode !== null || typeof options.chunkedMode != "undefined") {
            chunkedMode = options.chunkedMode;
        }
        if (options.params) {
            params = options.params;
        }
        else {
            params = {};
        }
    }

    var fail = errorCallback && function(e) {
        var error = new FileTransferError(e.code, e.source, e.target, e.http_status);
        errorCallback(error);
    };

    var self = this;
    var win = function(result) {
        if (typeof result.lengthComputable != "undefined") {
            if (self.onprogress) {
                self.onprogress(newProgressEvent(result));
            }
        } else {
            successCallback && successCallback(result);
        }
    };
    exec(win, fail, 'FileTransfer', 'upload', [filePath, server, fileKey, fileName, mimeType, params, trustAllHosts, chunkedMode, headers, this._id]);
};

/**
 * Downloads a file form a given URL and saves it to the specified directory.
 * @param source {String}          URL of the server to receive the file
 * @param target {String}         Full path of the file on the device
 * @param successCallback (Function}  Callback to be invoked when upload has completed
 * @param errorCallback {Function}    Callback to be invoked upon error
 * @param trustAllHosts {Boolean} Optional trust all hosts (e.g. for self-signed certs), defaults to false
 */
FileTransfer.prototype.download = function(source, target, successCallback, errorCallback, trustAllHosts) {
    argscheck.checkArgs('ssFF*', 'FileTransfer.download', arguments);
    var self = this;
    var win = function(result) {
        if (typeof result.lengthComputable != "undefined") {
            if (self.onprogress) {
                return self.onprogress(newProgressEvent(result));
            }
        } else if (successCallback) {
            var entry = null;
            if (result.isDirectory) {
                entry = new (require('cordova/plugin/DirectoryEntry'))();
            }
            else if (result.isFile) {
                entry = new (require('cordova/plugin/FileEntry'))();
            }
            entry.isDirectory = result.isDirectory;
            entry.isFile = result.isFile;
            entry.name = result.name;
            entry.fullPath = result.fullPath;
            successCallback(entry);
        }
    };

    var fail = errorCallback && function(e) {
        var error = new FileTransferError(e.code, e.source, e.target, e.http_status);
        errorCallback(error);
    };

    exec(win, fail, 'FileTransfer', 'download', [source, target, trustAllHosts, this._id]);
};

/**
 * Aborts the ongoing file transfer on this object
 * @param successCallback {Function}  Callback to be invoked upon success
 * @param errorCallback {Function}    Callback to be invoked upon error
 */
FileTransfer.prototype.abort = function(successCallback, errorCallback) {
    exec(successCallback, errorCallback, 'FileTransfer', 'abort', [this._id]);
};

module.exports = FileTransfer;

});

// file: lib/common/plugin/FileTransferError.js
define("cordova/plugin/FileTransferError", function(require, exports, module) {

/**
 * FileTransferError
 * @constructor
 */
var FileTransferError = function(code, source, target, status) {
    this.code = code || null;
    this.source = source || null;
    this.target = target || null;
    this.http_status = status || null;
};

FileTransferError.FILE_NOT_FOUND_ERR = 1;
FileTransferError.INVALID_URL_ERR = 2;
FileTransferError.CONNECTION_ERR = 3;
FileTransferError.ABORT_ERR = 4;

module.exports = FileTransferError;

});

// file: lib/common/plugin/FileUploadOptions.js
define("cordova/plugin/FileUploadOptions", function(require, exports, module) {

/**
 * Options to customize the HTTP request used to upload files.
 * @constructor
 * @param fileKey {String}   Name of file request parameter.
 * @param fileName {String}  Filename to be used by the server. Defaults to image.jpg.
 * @param mimeType {String}  Mimetype of the uploaded file. Defaults to image/jpeg.
 * @param params {Object}    Object with key: value params to send to the server.
 * @param headers {Object}   Keys are header names, values are header values. Multiple
 *                           headers of the same name are not supported.
 */
var FileUploadOptions = function(fileKey, fileName, mimeType, params, headers) {
    this.fileKey = fileKey || null;
    this.fileName = fileName || null;
    this.mimeType = mimeType || null;
    this.params = params || null;
    this.headers = headers || null;
};

module.exports = FileUploadOptions;

});

// file: lib/common/plugin/FileUploadResult.js
define("cordova/plugin/FileUploadResult", function(require, exports, module) {

/**
 * FileUploadResult
 * @constructor
 */
var FileUploadResult = function() {
    this.bytesSent = 0;
    this.responseCode = null;
    this.response = null;
};

module.exports = FileUploadResult;

});

// file: lib/common/plugin/FileWriter.js
define("cordova/plugin/FileWriter", function(require, exports, module) {

var exec = require('cordova/exec'),
    FileError = require('cordova/plugin/FileError'),
    ProgressEvent = require('cordova/plugin/ProgressEvent');

/**
 * This class writes to the mobile device file system.
 *
 * For Android:
 *      The root directory is the root of the file system.
 *      To write to the SD card, the file name is "sdcard/my_file.txt"
 *
 * @constructor
 * @param file {File} File object containing file properties
 * @param append if true write to the end of the file, otherwise overwrite the file
 */
var FileWriter = function(file) {
    this.fileName = "";
    this.length = 0;
    if (file) {
        this.fileName = file.fullPath || file;
        this.length = file.size || 0;
    }
    // default is to write at the beginning of the file
    this.position = 0;

    this.readyState = 0; // EMPTY

    this.result = null;

    // Error
    this.error = null;

    // Event handlers
    this.onwritestart = null;   // When writing starts
    this.onprogress = null;     // While writing the file, and reporting partial file data
    this.onwrite = null;        // When the write has successfully completed.
    this.onwriteend = null;     // When the request has completed (either in success or failure).
    this.onabort = null;        // When the write has been aborted. For instance, by invoking the abort() method.
    this.onerror = null;        // When the write has failed (see errors).
};

// States
FileWriter.INIT = 0;
FileWriter.WRITING = 1;
FileWriter.DONE = 2;

/**
 * Abort writing file.
 */
FileWriter.prototype.abort = function() {
    // check for invalid state
    if (this.readyState === FileWriter.DONE || this.readyState === FileWriter.INIT) {
        throw new FileError(FileError.INVALID_STATE_ERR);
    }

    // set error
    this.error = new FileError(FileError.ABORT_ERR);

    this.readyState = FileWriter.DONE;

    // If abort callback
    if (typeof this.onabort === "function") {
        this.onabort(new ProgressEvent("abort", {"target":this}));
    }

    // If write end callback
    if (typeof this.onwriteend === "function") {
        this.onwriteend(new ProgressEvent("writeend", {"target":this}));
    }
};

/**
 * Writes data to the file
 *
 * @param text to be written
 */
FileWriter.prototype.write = function(text) {
    // Throw an exception if we are already writing a file
    if (this.readyState === FileWriter.WRITING) {
        throw new FileError(FileError.INVALID_STATE_ERR);
    }

    // WRITING state
    this.readyState = FileWriter.WRITING;

    var me = this;

    // If onwritestart callback
    if (typeof me.onwritestart === "function") {
        me.onwritestart(new ProgressEvent("writestart", {"target":me}));
    }

    // Write file
    exec(
        // Success callback
        function(r) {
            // If DONE (cancelled), then don't do anything
            if (me.readyState === FileWriter.DONE) {
                return;
            }

            // position always increases by bytes written because file would be extended
            me.position += r;
            // The length of the file is now where we are done writing.

            me.length = me.position;

            // DONE state
            me.readyState = FileWriter.DONE;

            // If onwrite callback
            if (typeof me.onwrite === "function") {
                me.onwrite(new ProgressEvent("write", {"target":me}));
            }

            // If onwriteend callback
            if (typeof me.onwriteend === "function") {
                me.onwriteend(new ProgressEvent("writeend", {"target":me}));
            }
        },
        // Error callback
        function(e) {
            // If DONE (cancelled), then don't do anything
            if (me.readyState === FileWriter.DONE) {
                return;
            }

            // DONE state
            me.readyState = FileWriter.DONE;

            // Save error
            me.error = new FileError(e);

            // If onerror callback
            if (typeof me.onerror === "function") {
                me.onerror(new ProgressEvent("error", {"target":me}));
            }

            // If onwriteend callback
            if (typeof me.onwriteend === "function") {
                me.onwriteend(new ProgressEvent("writeend", {"target":me}));
            }
        }, "File", "write", [this.fileName, text, this.position]);
};

/**
 * Moves the file pointer to the location specified.
 *
 * If the offset is a negative number the position of the file
 * pointer is rewound.  If the offset is greater than the file
 * size the position is set to the end of the file.
 *
 * @param offset is the location to move the file pointer to.
 */
FileWriter.prototype.seek = function(offset) {
    // Throw an exception if we are already writing a file
    if (this.readyState === FileWriter.WRITING) {
        throw new FileError(FileError.INVALID_STATE_ERR);
    }

    if (!offset && offset !== 0) {
        return;
    }

    // See back from end of file.
    if (offset < 0) {
        this.position = Math.max(offset + this.length, 0);
    }
    // Offset is bigger than file size so set position
    // to the end of the file.
    else if (offset > this.length) {
        this.position = this.length;
    }
    // Offset is between 0 and file size so set the position
    // to start writing.
    else {
        this.position = offset;
    }
};

/**
 * Truncates the file to the size specified.
 *
 * @param size to chop the file at.
 */
FileWriter.prototype.truncate = function(size) {
    // Throw an exception if we are already writing a file
    if (this.readyState === FileWriter.WRITING) {
        throw new FileError(FileError.INVALID_STATE_ERR);
    }

    // WRITING state
    this.readyState = FileWriter.WRITING;

    var me = this;

    // If onwritestart callback
    if (typeof me.onwritestart === "function") {
        me.onwritestart(new ProgressEvent("writestart", {"target":this}));
    }

    // Write file
    exec(
        // Success callback
        function(r) {
            // If DONE (cancelled), then don't do anything
            if (me.readyState === FileWriter.DONE) {
                return;
            }

            // DONE state
            me.readyState = FileWriter.DONE;

            // Update the length of the file
            me.length = r;
            me.position = Math.min(me.position, r);

            // If onwrite callback
            if (typeof me.onwrite === "function") {
                me.onwrite(new ProgressEvent("write", {"target":me}));
            }

            // If onwriteend callback
            if (typeof me.onwriteend === "function") {
                me.onwriteend(new ProgressEvent("writeend", {"target":me}));
            }
        },
        // Error callback
        function(e) {
            // If DONE (cancelled), then don't do anything
            if (me.readyState === FileWriter.DONE) {
                return;
            }

            // DONE state
            me.readyState = FileWriter.DONE;

            // Save error
            me.error = new FileError(e);

            // If onerror callback
            if (typeof me.onerror === "function") {
                me.onerror(new ProgressEvent("error", {"target":me}));
            }

            // If onwriteend callback
            if (typeof me.onwriteend === "function") {
                me.onwriteend(new ProgressEvent("writeend", {"target":me}));
            }
        }, "File", "truncate", [this.fileName, size]);
};

module.exports = FileWriter;

});

// file: lib/common/plugin/Flags.js
define("cordova/plugin/Flags", function(require, exports, module) {

/**
 * Supplies arguments to methods that lookup or create files and directories.
 *
 * @param create
 *            {boolean} file or directory if it doesn't exist
 * @param exclusive
 *            {boolean} used with create; if true the command will fail if
 *            target path exists
 */
function Flags(create, exclusive) {
    this.create = create || false;
    this.exclusive = exclusive || false;
}

module.exports = Flags;

});

// file: lib/common/plugin/GlobalizationError.js
define("cordova/plugin/GlobalizationError", function(require, exports, module) {


/**
 * Globalization error object
 *
 * @constructor
 * @param code
 * @param message
 */
var GlobalizationError = function(code, message) {
    this.code = code || null;
    this.message = message || '';
};

// Globalization error codes
GlobalizationError.UNKNOWN_ERROR = 0;
GlobalizationError.FORMATTING_ERROR = 1;
GlobalizationError.PARSING_ERROR = 2;
GlobalizationError.PATTERN_ERROR = 3;

module.exports = GlobalizationError;

});

// file: lib/common/plugin/InAppBrowser.js
define("cordova/plugin/InAppBrowser", function(require, exports, module) {

var exec = require('cordova/exec');
var channel = require('cordova/channel');

function InAppBrowser() {
   this.channels = {
        'loadstart': channel.create('loadstart'),
        'loadstop' : channel.create('loadstop'),
        'exit' : channel.create('exit')
   };
}

InAppBrowser.prototype = {
    _eventHandler: function (event) {
        if (event.type in this.channels) {
            this.channels[event.type].fire(event);
        }
    },
    close: function (eventname) {
        exec(null, null, "InAppBrowser", "close", []);
    },
    addEventListener: function (eventname,f) {
        if (eventname in this.channels) {
            this.channels[eventname].subscribe(f);
        }
    },
    removeEventListener: function(eventname, f) {
        if (eventname in this.channels) {
            this.channels[eventname].unsubscribe(f);
        }
    }
};

module.exports = function(strUrl, strWindowName, strWindowFeatures) {
    var iab = new InAppBrowser();
    var cb = function(eventname) {
       iab._eventHandler(eventname);
    };
    exec(cb, null, "InAppBrowser", "open", [strUrl, strWindowName, strWindowFeatures]);
    return iab;
};

//Export the original open so it can be used if needed
module.exports._orig = window.open;

});

// file: lib/common/plugin/LocalFileSystem.js
define("cordova/plugin/LocalFileSystem", function(require, exports, module) {

var exec = require('cordova/exec');

/**
 * Represents a local file system.
 */
var LocalFileSystem = function() {

};

LocalFileSystem.TEMPORARY = 0; //temporary, with no guarantee of persistence
LocalFileSystem.PERSISTENT = 1; //persistent

module.exports = LocalFileSystem;

});

// file: lib/common/plugin/Media.js
define("cordova/plugin/Media", function(require, exports, module) {

var argscheck = require('cordova/argscheck'),
    utils = require('cordova/utils'),
    exec = require('cordova/exec');

var mediaObjects = {};

/**
 * This class provides access to the device media, interfaces to both sound and video
 *
 * @constructor
 * @param src                   The file name or url to play
 * @param successCallback       The callback to be called when the file is done playing or recording.
 *                                  successCallback()
 * @param errorCallback         The callback to be called if there is an error.
 *                                  errorCallback(int errorCode) - OPTIONAL
 * @param statusCallback        The callback to be called when media status has changed.
 *                                  statusCallback(int statusCode) - OPTIONAL
 */
var Media = function(src, successCallback, errorCallback, statusCallback) {
    argscheck.checkArgs('SFFF', 'Media', arguments);
    this.id = utils.createUUID();
    mediaObjects[this.id] = this;
    this.src = src;
    this.successCallback = successCallback;
    this.errorCallback = errorCallback;
    this.statusCallback = statusCallback;
    this._duration = -1;
    this._position = -1;
    exec(null, this.errorCallback, "Media", "create", [this.id, this.src]);
};

// Media messages
Media.MEDIA_STATE = 1;
Media.MEDIA_DURATION = 2;
Media.MEDIA_POSITION = 3;
Media.MEDIA_ERROR = 9;

// Media states
Media.MEDIA_NONE = 0;
Media.MEDIA_STARTING = 1;
Media.MEDIA_RUNNING = 2;
Media.MEDIA_PAUSED = 3;
Media.MEDIA_STOPPED = 4;
Media.MEDIA_MSG = ["None", "Starting", "Running", "Paused", "Stopped"];

// "static" function to return existing objs.
Media.get = function(id) {
    return mediaObjects[id];
};

/**
 * Start or resume playing audio file.
 */
Media.prototype.play = function(options) {
    exec(null, null, "Media", "startPlayingAudio", [this.id, this.src, options]);
};

/**
 * Stop playing audio file.
 */
Media.prototype.stop = function() {
    var me = this;
    exec(function() {
        me._position = 0;
    }, this.errorCallback, "Media", "stopPlayingAudio", [this.id]);
};

/**
 * Seek or jump to a new time in the track..
 */
Media.prototype.seekTo = function(milliseconds) {
    var me = this;
    exec(function(p) {
        me._position = p;
    }, this.errorCallback, "Media", "seekToAudio", [this.id, milliseconds]);
};

/**
 * Pause playing audio file.
 */
Media.prototype.pause = function() {
    exec(null, this.errorCallback, "Media", "pausePlayingAudio", [this.id]);
};

/**
 * Get duration of an audio file.
 * The duration is only set for audio that is playing, paused or stopped.
 *
 * @return      duration or -1 if not known.
 */
Media.prototype.getDuration = function() {
    return this._duration;
};

/**
 * Get position of audio.
 */
Media.prototype.getCurrentPosition = function(success, fail) {
    var me = this;
    exec(function(p) {
        me._position = p;
        success(p);
    }, fail, "Media", "getCurrentPositionAudio", [this.id]);
};

/**
 * Start recording audio file.
 */
Media.prototype.startRecord = function() {
    exec(null, this.errorCallback, "Media", "startRecordingAudio", [this.id, this.src]);
};

/**
 * Stop recording audio file.
 */
Media.prototype.stopRecord = function() {
    exec(null, this.errorCallback, "Media", "stopRecordingAudio", [this.id]);
};

/**
 * Release the resources.
 */
Media.prototype.release = function() {
    exec(null, this.errorCallback, "Media", "release", [this.id]);
};

/**
 * Adjust the volume.
 */
Media.prototype.setVolume = function(volume) {
    exec(null, null, "Media", "setVolume", [this.id, volume]);
};

/**
 * Audio has status update.
 * PRIVATE
 *
 * @param id            The media object id (string)
 * @param msgType       The 'type' of update this is
 * @param value         Use of value is determined by the msgType
 */
Media.onStatus = function(id, msgType, value) {

    var media = mediaObjects[id];

    if(media) {
        switch(msgType) {
            case Media.MEDIA_STATE :
                media.statusCallback && media.statusCallback(value);
                if(value == Media.MEDIA_STOPPED) {
                    media.successCallback && media.successCallback();
                }
                break;
            case Media.MEDIA_DURATION :
                media._duration = value;
                break;
            case Media.MEDIA_ERROR :
                media.errorCallback && media.errorCallback(value);
                break;
            case Media.MEDIA_POSITION :
                media._position = Number(value);
                break;
            default :
                console.error && console.error("Unhandled Media.onStatus :: " + msgType);
                break;
        }
    }
    else {
         console.error && console.error("Received Media.onStatus callback for unknown media :: " + id);
    }

};

module.exports = Media;

});

// file: lib/common/plugin/MediaError.js
define("cordova/plugin/MediaError", function(require, exports, module) {

/**
 * This class contains information about any Media errors.
*/
/*
 According to :: http://dev.w3.org/html5/spec-author-view/video.html#mediaerror
 We should never be creating these objects, we should just implement the interface
 which has 1 property for an instance, 'code'

 instead of doing :
    errorCallbackFunction( new MediaError(3,'msg') );
we should simply use a literal :
    errorCallbackFunction( {'code':3} );
 */

 var _MediaError = window.MediaError;


if(!_MediaError) {
    window.MediaError = _MediaError = function(code, msg) {
        this.code = (typeof code != 'undefined') ? code : null;
        this.message = msg || ""; // message is NON-standard! do not use!
    };
}

_MediaError.MEDIA_ERR_NONE_ACTIVE    = _MediaError.MEDIA_ERR_NONE_ACTIVE    || 0;
_MediaError.MEDIA_ERR_ABORTED        = _MediaError.MEDIA_ERR_ABORTED        || 1;
_MediaError.MEDIA_ERR_NETWORK        = _MediaError.MEDIA_ERR_NETWORK        || 2;
_MediaError.MEDIA_ERR_DECODE         = _MediaError.MEDIA_ERR_DECODE         || 3;
_MediaError.MEDIA_ERR_NONE_SUPPORTED = _MediaError.MEDIA_ERR_NONE_SUPPORTED || 4;
// TODO: MediaError.MEDIA_ERR_NONE_SUPPORTED is legacy, the W3 spec now defines it as below.
// as defined by http://dev.w3.org/html5/spec-author-view/video.html#error-codes
_MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED = _MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED || 4;

module.exports = _MediaError;

});

// file: lib/common/plugin/MediaFile.js
define("cordova/plugin/MediaFile", function(require, exports, module) {

var utils = require('cordova/utils'),
    exec = require('cordova/exec'),
    File = require('cordova/plugin/File'),
    CaptureError = require('cordova/plugin/CaptureError');
/**
 * Represents a single file.
 *
 * name {DOMString} name of the file, without path information
 * fullPath {DOMString} the full path of the file, including the name
 * type {DOMString} mime type
 * lastModifiedDate {Date} last modified date
 * size {Number} size of the file in bytes
 */
var MediaFile = function(name, fullPath, type, lastModifiedDate, size){
    MediaFile.__super__.constructor.apply(this, arguments);
};

utils.extend(MediaFile, File);

/**
 * Request capture format data for a specific file and type
 *
 * @param {Function} successCB
 * @param {Function} errorCB
 */
MediaFile.prototype.getFormatData = function(successCallback, errorCallback) {
    if (typeof this.fullPath === "undefined" || this.fullPath === null) {
        errorCallback(new CaptureError(CaptureError.CAPTURE_INVALID_ARGUMENT));
    } else {
        exec(successCallback, errorCallback, "Capture", "getFormatData", [this.fullPath, this.type]);
    }
};

module.exports = MediaFile;

});

// file: lib/common/plugin/MediaFileData.js
define("cordova/plugin/MediaFileData", function(require, exports, module) {

/**
 * MediaFileData encapsulates format information of a media file.
 *
 * @param {DOMString} codecs
 * @param {long} bitrate
 * @param {long} height
 * @param {long} width
 * @param {float} duration
 */
var MediaFileData = function(codecs, bitrate, height, width, duration){
    this.codecs = codecs || null;
    this.bitrate = bitrate || 0;
    this.height = height || 0;
    this.width = width || 0;
    this.duration = duration || 0;
};

module.exports = MediaFileData;

});

// file: lib/common/plugin/Metadata.js
define("cordova/plugin/Metadata", function(require, exports, module) {

/**
 * Information about the state of the file or directory
 *
 * {Date} modificationTime (readonly)
 */
var Metadata = function(time) {
    this.modificationTime = (typeof time != 'undefined'?new Date(time):null);
};

module.exports = Metadata;

});

// file: lib/common/plugin/Position.js
define("cordova/plugin/Position", function(require, exports, module) {

var Coordinates = require('cordova/plugin/Coordinates');

var Position = function(coords, timestamp) {
    if (coords) {
        this.coords = new Coordinates(coords.latitude, coords.longitude, coords.altitude, coords.accuracy, coords.heading, coords.velocity, coords.altitudeAccuracy);
    } else {
        this.coords = new Coordinates();
    }
    this.timestamp = (timestamp !== undefined) ? timestamp : new Date();
};

module.exports = Position;

});

// file: lib/common/plugin/PositionError.js
define("cordova/plugin/PositionError", function(require, exports, module) {

/**
 * Position error object
 *
 * @constructor
 * @param code
 * @param message
 */
var PositionError = function(code, message) {
    this.code = code || null;
    this.message = message || '';
};

PositionError.PERMISSION_DENIED = 1;
PositionError.POSITION_UNAVAILABLE = 2;
PositionError.TIMEOUT = 3;

module.exports = PositionError;

});

// file: lib/common/plugin/ProgressEvent.js
define("cordova/plugin/ProgressEvent", function(require, exports, module) {

// If ProgressEvent exists in global context, use it already, otherwise use our own polyfill
// Feature test: See if we can instantiate a native ProgressEvent;
// if so, use that approach,
// otherwise fill-in with our own implementation.
//
// NOTE: right now we always fill in with our own. Down the road would be nice if we can use whatever is native in the webview.
var ProgressEvent = (function() {
    /*
    var createEvent = function(data) {
        var event = document.createEvent('Events');
        event.initEvent('ProgressEvent', false, false);
        if (data) {
            for (var i in data) {
                if (data.hasOwnProperty(i)) {
                    event[i] = data[i];
                }
            }
            if (data.target) {
                // TODO: cannot call <some_custom_object>.dispatchEvent
                // need to first figure out how to implement EventTarget
            }
        }
        return event;
    };
    try {
        var ev = createEvent({type:"abort",target:document});
        return function ProgressEvent(type, data) {
            data.type = type;
            return createEvent(data);
        };
    } catch(e){
    */
        return function ProgressEvent(type, dict) {
            this.type = type;
            this.bubbles = false;
            this.cancelBubble = false;
            this.cancelable = false;
            this.lengthComputable = false;
            this.loaded = dict && dict.loaded ? dict.loaded : 0;
            this.total = dict && dict.total ? dict.total : 0;
            this.target = dict && dict.target ? dict.target : null;
        };
    //}
})();

module.exports = ProgressEvent;

});

// file: lib/common/plugin/accelerometer.js
define("cordova/plugin/accelerometer", function(require, exports, module) {

/**
 * This class provides access to device accelerometer data.
 * @constructor
 */
var argscheck = require('cordova/argscheck'),
    utils = require("cordova/utils"),
    exec = require("cordova/exec"),
    Acceleration = require('cordova/plugin/Acceleration');

// Is the accel sensor running?
var running = false;

// Keeps reference to watchAcceleration calls.
var timers = {};

// Array of listeners; used to keep track of when we should call start and stop.
var listeners = [];

// Last returned acceleration object from native
var accel = null;

// Tells native to start.
function start() {
    exec(function(a) {
        var tempListeners = listeners.slice(0);
        accel = new Acceleration(a.x, a.y, a.z, a.timestamp);
        for (var i = 0, l = tempListeners.length; i < l; i++) {
            tempListeners[i].win(accel);
        }
    }, function(e) {
        var tempListeners = listeners.slice(0);
        for (var i = 0, l = tempListeners.length; i < l; i++) {
            tempListeners[i].fail(e);
        }
    }, "Accelerometer", "start", []);
    running = true;
}

// Tells native to stop.
function stop() {
    exec(null, null, "Accelerometer", "stop", []);
    running = false;
}

// Adds a callback pair to the listeners array
function createCallbackPair(win, fail) {
    return {win:win, fail:fail};
}

// Removes a win/fail listener pair from the listeners array
function removeListeners(l) {
    var idx = listeners.indexOf(l);
    if (idx > -1) {
        listeners.splice(idx, 1);
        if (listeners.length === 0) {
            stop();
        }
    }
}

var accelerometer = {
    /**
     * Asynchronously acquires the current acceleration.
     *
     * @param {Function} successCallback    The function to call when the acceleration data is available
     * @param {Function} errorCallback      The function to call when there is an error getting the acceleration data. (OPTIONAL)
     * @param {AccelerationOptions} options The options for getting the accelerometer data such as timeout. (OPTIONAL)
     */
    getCurrentAcceleration: function(successCallback, errorCallback, options) {
        argscheck.checkArgs('fFO', 'accelerometer.getCurrentAcceleration', arguments);

        var p;
        var win = function(a) {
            removeListeners(p);
            successCallback(a);
        };
        var fail = function(e) {
            removeListeners(p);
            errorCallback && errorCallback(e);
        };

        p = createCallbackPair(win, fail);
        listeners.push(p);

        if (!running) {
            start();
        }
    },

    /**
     * Asynchronously acquires the acceleration repeatedly at a given interval.
     *
     * @param {Function} successCallback    The function to call each time the acceleration data is available
     * @param {Function} errorCallback      The function to call when there is an error getting the acceleration data. (OPTIONAL)
     * @param {AccelerationOptions} options The options for getting the accelerometer data such as timeout. (OPTIONAL)
     * @return String                       The watch id that must be passed to #clearWatch to stop watching.
     */
    watchAcceleration: function(successCallback, errorCallback, options) {
        argscheck.checkArgs('fFO', 'accelerometer.watchAcceleration', arguments);
        // Default interval (10 sec)
        var frequency = (options && options.frequency && typeof options.frequency == 'number') ? options.frequency : 10000;

        // Keep reference to watch id, and report accel readings as often as defined in frequency
        var id = utils.createUUID();

        var p = createCallbackPair(function(){}, function(e) {
            removeListeners(p);
            errorCallback && errorCallback(e);
        });
        listeners.push(p);

        timers[id] = {
            timer:window.setInterval(function() {
                if (accel) {
                    successCallback(accel);
                }
            }, frequency),
            listeners:p
        };

        if (running) {
            // If we're already running then immediately invoke the success callback
            // but only if we have retrieved a value, sample code does not check for null ...
            if (accel) {
                successCallback(accel);
            }
        } else {
            start();
        }

        return id;
    },

    /**
     * Clears the specified accelerometer watch.
     *
     * @param {String} id       The id of the watch returned from #watchAcceleration.
     */
    clearWatch: function(id) {
        // Stop javascript timer & remove from timer list
        if (id && timers[id]) {
            window.clearInterval(timers[id].timer);
            removeListeners(timers[id].listeners);
            delete timers[id];
        }
    }
};

module.exports = accelerometer;

});

// file: lib/common/plugin/battery.js
define("cordova/plugin/battery", function(require, exports, module) {

/**
 * This class contains information about the current battery status.
 * @constructor
 */
var cordova = require('cordova'),
    exec = require('cordova/exec');

function handlers() {
  return battery.channels.batterystatus.numHandlers +
         battery.channels.batterylow.numHandlers +
         battery.channels.batterycritical.numHandlers;
}

var Battery = function() {
    this._level = null;
    this._isPlugged = null;
    // Create new event handlers on the window (returns a channel instance)
    this.channels = {
      batterystatus:cordova.addWindowEventHandler("batterystatus"),
      batterylow:cordova.addWindowEventHandler("batterylow"),
      batterycritical:cordova.addWindowEventHandler("batterycritical")
    };
    for (var key in this.channels) {
        this.channels[key].onHasSubscribersChange = Battery.onHasSubscribersChange;
    }
};
/**
 * Event handlers for when callbacks get registered for the battery.
 * Keep track of how many handlers we have so we can start and stop the native battery listener
 * appropriately (and hopefully save on battery life!).
 */
Battery.onHasSubscribersChange = function() {
  // If we just registered the first handler, make sure native listener is started.
  if (this.numHandlers === 1 && handlers() === 1) {
      exec(battery._status, battery._error, "Battery", "start", []);
  } else if (handlers() === 0) {
      exec(null, null, "Battery", "stop", []);
  }
};

/**
 * Callback for battery status
 *
 * @param {Object} info            keys: level, isPlugged
 */
Battery.prototype._status = function(info) {
    if (info) {
        var me = battery;
    var level = info.level;
        if (me._level !== level || me._isPlugged !== info.isPlugged) {
            // Fire batterystatus event
            cordova.fireWindowEvent("batterystatus", info);

            // Fire low battery event
            if (level === 20 || level === 5) {
                if (level === 20) {
                    cordova.fireWindowEvent("batterylow", info);
                }
                else {
                    cordova.fireWindowEvent("batterycritical", info);
                }
            }
        }
        me._level = level;
        me._isPlugged = info.isPlugged;
    }
};

/**
 * Error callback for battery start
 */
Battery.prototype._error = function(e) {
    console.log("Error initializing Battery: " + e);
};

var battery = new Battery();

module.exports = battery;

});

// file: lib/common/plugin/capture.js
define("cordova/plugin/capture", function(require, exports, module) {

var exec = require('cordova/exec'),
    MediaFile = require('cordova/plugin/MediaFile');

/**
 * Launches a capture of different types.
 *
 * @param (DOMString} type
 * @param {Function} successCB
 * @param {Function} errorCB
 * @param {CaptureVideoOptions} options
 */
function _capture(type, successCallback, errorCallback, options) {
    var win = function(pluginResult) {
        var mediaFiles = [];
        var i;
        for (i = 0; i < pluginResult.length; i++) {
            var mediaFile = new MediaFile();
            mediaFile.name = pluginResult[i].name;
            mediaFile.fullPath = pluginResult[i].fullPath;
            mediaFile.type = pluginResult[i].type;
            mediaFile.lastModifiedDate = pluginResult[i].lastModifiedDate;
            mediaFile.size = pluginResult[i].size;
            mediaFiles.push(mediaFile);
        }
        successCallback(mediaFiles);
    };
    exec(win, errorCallback, "Capture", type, [options]);
}
/**
 * The Capture interface exposes an interface to the camera and microphone of the hosting device.
 */
function Capture() {
    this.supportedAudioModes = [];
    this.supportedImageModes = [];
    this.supportedVideoModes = [];
}

/**
 * Launch audio recorder application for recording audio clip(s).
 *
 * @param {Function} successCB
 * @param {Function} errorCB
 * @param {CaptureAudioOptions} options
 */
Capture.prototype.captureAudio = function(successCallback, errorCallback, options){
    _capture("captureAudio", successCallback, errorCallback, options);
};

/**
 * Launch camera application for taking image(s).
 *
 * @param {Function} successCB
 * @param {Function} errorCB
 * @param {CaptureImageOptions} options
 */
Capture.prototype.captureImage = function(successCallback, errorCallback, options){
    _capture("captureImage", successCallback, errorCallback, options);
};

/**
 * Launch device camera application for recording video(s).
 *
 * @param {Function} successCB
 * @param {Function} errorCB
 * @param {CaptureVideoOptions} options
 */
Capture.prototype.captureVideo = function(successCallback, errorCallback, options){
    _capture("captureVideo", successCallback, errorCallback, options);
};


module.exports = new Capture();

});

// file: lib/common/plugin/compass.js
define("cordova/plugin/compass", function(require, exports, module) {

var argscheck = require('cordova/argscheck'),
    exec = require('cordova/exec'),
    utils = require('cordova/utils'),
    CompassHeading = require('cordova/plugin/CompassHeading'),
    CompassError = require('cordova/plugin/CompassError'),
    timers = {},
    compass = {
        /**
         * Asynchronously acquires the current heading.
         * @param {Function} successCallback The function to call when the heading
         * data is available
         * @param {Function} errorCallback The function to call when there is an error
         * getting the heading data.
         * @param {CompassOptions} options The options for getting the heading data (not used).
         */
        getCurrentHeading:function(successCallback, errorCallback, options) {
            argscheck.checkArgs('fFO', 'compass.getCurrentHeading', arguments);

            var win = function(result) {
                var ch = new CompassHeading(result.magneticHeading, result.trueHeading, result.headingAccuracy, result.timestamp);
                successCallback(ch);
            };
            var fail = errorCallback && function(code) {
                var ce = new CompassError(code);
                errorCallback(ce);
            };

            // Get heading
            exec(win, fail, "Compass", "getHeading", [options]);
        },

        /**
         * Asynchronously acquires the heading repeatedly at a given interval.
         * @param {Function} successCallback The function to call each time the heading
         * data is available
         * @param {Function} errorCallback The function to call when there is an error
         * getting the heading data.
         * @param {HeadingOptions} options The options for getting the heading data
         * such as timeout and the frequency of the watch. For iOS, filter parameter
         * specifies to watch via a distance filter rather than time.
         */
        watchHeading:function(successCallback, errorCallback, options) {
            argscheck.checkArgs('fFO', 'compass.watchHeading', arguments);
            // Default interval (100 msec)
            var frequency = (options !== undefined && options.frequency !== undefined) ? options.frequency : 100;
            var filter = (options !== undefined && options.filter !== undefined) ? options.filter : 0;

            var id = utils.createUUID();
            if (filter > 0) {
                // is an iOS request for watch by filter, no timer needed
                timers[id] = "iOS";
                compass.getCurrentHeading(successCallback, errorCallback, options);
            } else {
                // Start watch timer to get headings
                timers[id] = window.setInterval(function() {
                    compass.getCurrentHeading(successCallback, errorCallback);
                }, frequency);
            }

            return id;
        },

        /**
         * Clears the specified heading watch.
         * @param {String} watchId The ID of the watch returned from #watchHeading.
         */
        clearWatch:function(id) {
            // Stop javascript timer & remove from timer list
            if (id && timers[id]) {
                if (timers[id] != "iOS") {
                    clearInterval(timers[id]);
                } else {
                    // is iOS watch by filter so call into device to stop
                    exec(null, null, "Compass", "stopHeading", []);
                }
                delete timers[id];
            }
        }
    };

module.exports = compass;

});

// file: lib/common/plugin/console-via-logger.js
define("cordova/plugin/console-via-logger", function(require, exports, module) {

//------------------------------------------------------------------------------

var logger = require("cordova/plugin/logger");
var utils  = require("cordova/utils");

//------------------------------------------------------------------------------
// object that we're exporting
//------------------------------------------------------------------------------
var console = module.exports;

//------------------------------------------------------------------------------
// copy of the original console object
//------------------------------------------------------------------------------
var WinConsole = window.console;

//------------------------------------------------------------------------------
// whether to use the logger
//------------------------------------------------------------------------------
var UseLogger = false;

//------------------------------------------------------------------------------
// Timers
//------------------------------------------------------------------------------
var Timers = {};

//------------------------------------------------------------------------------
// used for unimplemented methods
//------------------------------------------------------------------------------
function noop() {}

//------------------------------------------------------------------------------
// used for unimplemented methods
//------------------------------------------------------------------------------
console.useLogger = function (value) {
    if (arguments.length) UseLogger = !!value;

    if (UseLogger) {
        if (logger.useConsole()) {
            throw new Error("console and logger are too intertwingly");
        }
    }

    return UseLogger;
};

//------------------------------------------------------------------------------
console.log = function() {
    if (logger.useConsole()) return;
    logger.log.apply(logger, [].slice.call(arguments));
};

//------------------------------------------------------------------------------
console.error = function() {
    if (logger.useConsole()) return;
    logger.error.apply(logger, [].slice.call(arguments));
};

//------------------------------------------------------------------------------
console.warn = function() {
    if (logger.useConsole()) return;
    logger.warn.apply(logger, [].slice.call(arguments));
};

//------------------------------------------------------------------------------
console.info = function() {
    if (logger.useConsole()) return;
    logger.info.apply(logger, [].slice.call(arguments));
};

//------------------------------------------------------------------------------
console.debug = function() {
    if (logger.useConsole()) return;
    logger.debug.apply(logger, [].slice.call(arguments));
};

//------------------------------------------------------------------------------
console.assert = function(expression) {
    if (expression) return;

    var message = utils.vformat(arguments[1], [].slice.call(arguments, 2));
    console.log("ASSERT: " + message);
};

//------------------------------------------------------------------------------
console.clear = function() {};

//------------------------------------------------------------------------------
console.dir = function(object) {
    console.log("%o", object);
};

//------------------------------------------------------------------------------
console.dirxml = function(node) {
    console.log(node.innerHTML);
};

//------------------------------------------------------------------------------
console.trace = noop;

//------------------------------------------------------------------------------
console.group = console.log;

//------------------------------------------------------------------------------
console.groupCollapsed = console.log;

//------------------------------------------------------------------------------
console.groupEnd = noop;

//------------------------------------------------------------------------------
console.time = function(name) {
    Timers[name] = new Date().valueOf();
};

//------------------------------------------------------------------------------
console.timeEnd = function(name) {
    var timeStart = Timers[name];
    if (!timeStart) {
        console.warn("unknown timer: " + name);
        return;
    }

    var timeElapsed = new Date().valueOf() - timeStart;
    console.log(name + ": " + timeElapsed + "ms");
};

//------------------------------------------------------------------------------
console.timeStamp = noop;

//------------------------------------------------------------------------------
console.profile = noop;

//------------------------------------------------------------------------------
console.profileEnd = noop;

//------------------------------------------------------------------------------
console.count = noop;

//------------------------------------------------------------------------------
console.exception = console.log;

//------------------------------------------------------------------------------
console.table = function(data, columns) {
    console.log("%o", data);
};

//------------------------------------------------------------------------------
// return a new function that calls both functions passed as args
//------------------------------------------------------------------------------
function wrappedOrigCall(orgFunc, newFunc) {
    return function() {
        var args = [].slice.call(arguments);
        try { orgFunc.apply(WinConsole, args); } catch (e) {}
        try { newFunc.apply(console,    args); } catch (e) {}
    };
}

//------------------------------------------------------------------------------
// For every function that exists in the original console object, that
// also exists in the new console object, wrap the new console method
// with one that calls both
//------------------------------------------------------------------------------
for (var key in console) {
    if (typeof WinConsole[key] == "function") {
        console[key] = wrappedOrigCall(WinConsole[key], console[key]);
    }
}

});

// file: lib/common/plugin/contacts.js
define("cordova/plugin/contacts", function(require, exports, module) {

var argscheck = require('cordova/argscheck'),
    exec = require('cordova/exec'),
    ContactError = require('cordova/plugin/ContactError'),
    utils = require('cordova/utils'),
    Contact = require('cordova/plugin/Contact');

/**
* Represents a group of Contacts.
* @constructor
*/
var contacts = {
    /**
     * Returns an array of Contacts matching the search criteria.
     * @param fields that should be searched
     * @param successCB success callback
     * @param errorCB error callback
     * @param {ContactFindOptions} options that can be applied to contact searching
     * @return array of Contacts matching search criteria
     */
    find:function(fields, successCB, errorCB, options) {
        argscheck.checkArgs('afFO', 'contacts.find', arguments);
        if (!fields.length) {
            errorCB && errorCB(new ContactError(ContactError.INVALID_ARGUMENT_ERROR));
        } else {
            var win = function(result) {
                var cs = [];
                for (var i = 0, l = result.length; i < l; i++) {
                    cs.push(contacts.create(result[i]));
                }
                successCB(cs);
            };
            exec(win, errorCB, "Contacts", "search", [fields, options]);
        }
    },

    /**
     * This function creates a new contact, but it does not persist the contact
     * to device storage. To persist the contact to device storage, invoke
     * contact.save().
     * @param properties an object whose properties will be examined to create a new Contact
     * @returns new Contact object
     */
    create:function(properties) {
        argscheck.checkArgs('O', 'contacts.create', arguments);
        var contact = new Contact();
        for (var i in properties) {
            if (typeof contact[i] !== 'undefined' && properties.hasOwnProperty(i)) {
                contact[i] = properties[i];
            }
        }
        return contact;
    }
};

module.exports = contacts;

});

// file: lib/common/plugin/device.js
define("cordova/plugin/device", function(require, exports, module) {

var argscheck = require('cordova/argscheck'),
    channel = require('cordova/channel'),
    utils = require('cordova/utils'),
    exec = require('cordova/exec');

// Tell cordova channel to wait on the CordovaInfoReady event
channel.waitForInitialization('onCordovaInfoReady');

/**
 * This represents the mobile device, and provides properties for inspecting the model, version, UUID of the
 * phone, etc.
 * @constructor
 */
function Device() {
    this.available = false;
    this.platform = null;
    this.version = null;
    this.name = null;
    this.uuid = null;
    this.cordova = null;
    this.model = null;

    var me = this;

    channel.onCordovaReady.subscribe(function() {
        me.getInfo(function(info) {
            me.available = true;
            me.platform = info.platform;
            me.version = info.version;
            me.name = info.name;
            me.uuid = info.uuid;
            me.cordova = info.cordova;
            me.model = info.model;
            channel.onCordovaInfoReady.fire();
        },function(e) {
            me.available = false;
            utils.alert("[ERROR] Error initializing Cordova: " + e);
        });
    });
}

/**
 * Get device info
 *
 * @param {Function} successCallback The function to call when the heading data is available
 * @param {Function} errorCallback The function to call when there is an error getting the heading data. (OPTIONAL)
 */
Device.prototype.getInfo = function(successCallback, errorCallback) {
    argscheck.checkArgs('fF', 'Device.getInfo', arguments);
    exec(successCallback, errorCallback, "Device", "getDeviceInfo", []);
};

module.exports = new Device();

});

// file: lib/common/plugin/echo.js
define("cordova/plugin/echo", function(require, exports, module) {

var exec = require('cordova/exec');

/**
 * Sends the given message through exec() to the Echo plugin, which sends it back to the successCallback.
 * @param successCallback  invoked with a FileSystem object
 * @param errorCallback  invoked if error occurs retrieving file system
 * @param message  The string to be echoed.
 * @param forceAsync  Whether to force an async return value (for testing native->js bridge).
 */
module.exports = function(successCallback, errorCallback, message, forceAsync) {
    var action = forceAsync ? 'echoAsync' : 'echo';
    if (!forceAsync && message.constructor == ArrayBuffer) {
        action = 'echoArrayBuffer';
    }
    exec(successCallback, errorCallback, "Echo", action, [message]);
};


});

// file: lib/ios/plugin/file/symbols.js
define("cordova/plugin/file/symbols", function(require, exports, module) {


var modulemapper = require('cordova/modulemapper'),
    symbolshelper = require('cordova/plugin/file/symbolshelper');

symbolshelper(modulemapper.clobbers);
modulemapper.merges('cordova/plugin/ios/Entry', 'Entry');

});

// file: lib/common/plugin/file/symbolshelper.js
define("cordova/plugin/file/symbolshelper", function(require, exports, module) {

module.exports = function(exportFunc) {
    exportFunc('cordova/plugin/DirectoryEntry', 'DirectoryEntry');
    exportFunc('cordova/plugin/DirectoryReader', 'DirectoryReader');
    exportFunc('cordova/plugin/Entry', 'Entry');
    exportFunc('cordova/plugin/File', 'File');
    exportFunc('cordova/plugin/FileEntry', 'FileEntry');
    exportFunc('cordova/plugin/FileError', 'FileError');
    exportFunc('cordova/plugin/FileReader', 'FileReader');
    exportFunc('cordova/plugin/FileSystem', 'FileSystem');
    exportFunc('cordova/plugin/FileTransfer', 'FileTransfer');
    exportFunc('cordova/plugin/FileTransferError', 'FileTransferError');
    exportFunc('cordova/plugin/FileUploadOptions', 'FileUploadOptions');
    exportFunc('cordova/plugin/FileUploadResult', 'FileUploadResult');
    exportFunc('cordova/plugin/FileWriter', 'FileWriter');
    exportFunc('cordova/plugin/Flags', 'Flags');
    exportFunc('cordova/plugin/LocalFileSystem', 'LocalFileSystem');
    exportFunc('cordova/plugin/Metadata', 'Metadata');
    exportFunc('cordova/plugin/requestFileSystem', 'requestFileSystem');
    exportFunc('cordova/plugin/resolveLocalFileSystemURI', 'resolveLocalFileSystemURI');
};

});

// file: lib/common/plugin/geolocation.js
define("cordova/plugin/geolocation", function(require, exports, module) {

var argscheck = require('cordova/argscheck'),
    utils = require('cordova/utils'),
    exec = require('cordova/exec'),
    PositionError = require('cordova/plugin/PositionError'),
    Position = require('cordova/plugin/Position');

var timers = {};   // list of timers in use

// Returns default params, overrides if provided with values
function parseParameters(options) {
    var opt = {
        maximumAge: 0,
        enableHighAccuracy: false,
        timeout: Infinity
    };

    if (options) {
        if (options.maximumAge !== undefined && !isNaN(options.maximumAge) && options.maximumAge > 0) {
            opt.maximumAge = options.maximumAge;
        }
        if (options.enableHighAccuracy !== undefined) {
            opt.enableHighAccuracy = options.enableHighAccuracy;
        }
        if (options.timeout !== undefined && !isNaN(options.timeout)) {
            if (options.timeout < 0) {
                opt.timeout = 0;
            } else {
                opt.timeout = options.timeout;
            }
        }
    }

    return opt;
}

// Returns a timeout failure, closed over a specified timeout value and error callback.
function createTimeout(errorCallback, timeout) {
    var t = setTimeout(function() {
        clearTimeout(t);
        t = null;
        errorCallback({
            code:PositionError.TIMEOUT,
            message:"Position retrieval timed out."
        });
    }, timeout);
    return t;
}

var geolocation = {
    lastPosition:null, // reference to last known (cached) position returned
    /**
   * Asynchronously acquires the current position.
   *
   * @param {Function} successCallback    The function to call when the position data is available
   * @param {Function} errorCallback      The function to call when there is an error getting the heading position. (OPTIONAL)
   * @param {PositionOptions} options     The options for getting the position data. (OPTIONAL)
   */
    getCurrentPosition:function(successCallback, errorCallback, options) {
        argscheck.checkArgs('fFO', 'geolocation.getCurrentPosition', arguments);
        options = parseParameters(options);

        // Timer var that will fire an error callback if no position is retrieved from native
        // before the "timeout" param provided expires
        var timeoutTimer = {timer:null};

        var win = function(p) {
            clearTimeout(timeoutTimer.timer);
            if (!(timeoutTimer.timer)) {
                // Timeout already happened, or native fired error callback for
                // this geo request.
                // Don't continue with success callback.
                return;
            }
            var pos = new Position(
                {
                    latitude:p.latitude,
                    longitude:p.longitude,
                    altitude:p.altitude,
                    accuracy:p.accuracy,
                    heading:p.heading,
                    velocity:p.velocity,
                    altitudeAccuracy:p.altitudeAccuracy
                },
                (p.timestamp === undefined ? new Date() : ((p.timestamp instanceof Date) ? p.timestamp : new Date(p.timestamp)))
            );
            geolocation.lastPosition = pos;
            successCallback(pos);
        };
        var fail = function(e) {
            clearTimeout(timeoutTimer.timer);
            timeoutTimer.timer = null;
            var err = new PositionError(e.code, e.message);
            if (errorCallback) {
                errorCallback(err);
            }
        };

        // Check our cached position, if its timestamp difference with current time is less than the maximumAge, then just
        // fire the success callback with the cached position.
        if (geolocation.lastPosition && options.maximumAge && (((new Date()).getTime() - geolocation.lastPosition.timestamp.getTime()) <= options.maximumAge)) {
            successCallback(geolocation.lastPosition);
        // If the cached position check failed and the timeout was set to 0, error out with a TIMEOUT error object.
        } else if (options.timeout === 0) {
            fail({
                code:PositionError.TIMEOUT,
                message:"timeout value in PositionOptions set to 0 and no cached Position object available, or cached Position object's age exceeds provided PositionOptions' maximumAge parameter."
            });
        // Otherwise we have to call into native to retrieve a position.
        } else {
            if (options.timeout !== Infinity) {
                // If the timeout value was not set to Infinity (default), then
                // set up a timeout function that will fire the error callback
                // if no successful position was retrieved before timeout expired.
                timeoutTimer.timer = createTimeout(fail, options.timeout);
            } else {
                // This is here so the check in the win function doesn't mess stuff up
                // may seem weird but this guarantees timeoutTimer is
                // always truthy before we call into native
                timeoutTimer.timer = true;
            }
            exec(win, fail, "Geolocation", "getLocation", [options.enableHighAccuracy, options.maximumAge]);
        }
        return timeoutTimer;
    },
    /**
     * Asynchronously watches the geolocation for changes to geolocation.  When a change occurs,
     * the successCallback is called with the new location.
     *
     * @param {Function} successCallback    The function to call each time the location data is available
     * @param {Function} errorCallback      The function to call when there is an error getting the location data. (OPTIONAL)
     * @param {PositionOptions} options     The options for getting the location data such as frequency. (OPTIONAL)
     * @return String                       The watch id that must be passed to #clearWatch to stop watching.
     */
    watchPosition:function(successCallback, errorCallback, options) {
        argscheck.checkArgs('fFO', 'geolocation.getCurrentPosition', arguments);
        options = parseParameters(options);

        var id = utils.createUUID();

        // Tell device to get a position ASAP, and also retrieve a reference to the timeout timer generated in getCurrentPosition
        timers[id] = geolocation.getCurrentPosition(successCallback, errorCallback, options);

        var fail = function(e) {
            clearTimeout(timers[id].timer);
            var err = new PositionError(e.code, e.message);
            if (errorCallback) {
                errorCallback(err);
            }
        };

        var win = function(p) {
            clearTimeout(timers[id].timer);
            if (options.timeout !== Infinity) {
                timers[id].timer = createTimeout(fail, options.timeout);
            }
            var pos = new Position(
                {
                    latitude:p.latitude,
                    longitude:p.longitude,
                    altitude:p.altitude,
                    accuracy:p.accuracy,
                    heading:p.heading,
                    velocity:p.velocity,
                    altitudeAccuracy:p.altitudeAccuracy
                },
                (p.timestamp === undefined ? new Date() : ((p.timestamp instanceof Date) ? p.timestamp : new Date(p.timestamp)))
            );
            geolocation.lastPosition = pos;
            successCallback(pos);
        };

        exec(win, fail, "Geolocation", "addWatch", [id, options.enableHighAccuracy]);

        return id;
    },
    /**
     * Clears the specified heading watch.
     *
     * @param {String} id       The ID of the watch returned from #watchPosition
     */
    clearWatch:function(id) {
        if (id && timers[id] !== undefined) {
            clearTimeout(timers[id].timer);
            timers[id].timer = false;
            exec(null, null, "Geolocation", "clearWatch", [id]);
        }
    }
};

module.exports = geolocation;

});

// file: lib/common/plugin/globalization.js
define("cordova/plugin/globalization", function(require, exports, module) {

var argscheck = require('cordova/argscheck'),
    exec = require('cordova/exec'),
    GlobalizationError = require('cordova/plugin/GlobalizationError');

var globalization = {

/**
* Returns the string identifier for the client's current language.
* It returns the language identifier string to the successCB callback with a
* properties object as a parameter. If there is an error getting the language,
* then the errorCB callback is invoked.
*
* @param {Function} successCB
* @param {Function} errorCB
*
* @return Object.value {String}: The language identifier
*
* @error GlobalizationError.UNKNOWN_ERROR
*
* Example
*    globalization.getPreferredLanguage(function (language) {alert('language:' + language.value + '\n');},
*                                function () {});
*/
getPreferredLanguage:function(successCB, failureCB) {
    argscheck.checkArgs('fF', 'Globalization.getPreferredLanguage', arguments);
    exec(successCB, failureCB, "Globalization","getPreferredLanguage", []);
},

/**
* Returns the string identifier for the client's current locale setting.
* It returns the locale identifier string to the successCB callback with a
* properties object as a parameter. If there is an error getting the locale,
* then the errorCB callback is invoked.
*
* @param {Function} successCB
* @param {Function} errorCB
*
* @return Object.value {String}: The locale identifier
*
* @error GlobalizationError.UNKNOWN_ERROR
*
* Example
*    globalization.getLocaleName(function (locale) {alert('locale:' + locale.value + '\n');},
*                                function () {});
*/
getLocaleName:function(successCB, failureCB) {
    argscheck.checkArgs('fF', 'Globalization.getLocaleName', arguments);
    exec(successCB, failureCB, "Globalization","getLocaleName", []);
},


/**
* Returns a date formatted as a string according to the client's user preferences and
* calendar using the time zone of the client. It returns the formatted date string to the
* successCB callback with a properties object as a parameter. If there is an error
* formatting the date, then the errorCB callback is invoked.
*
* The defaults are: formatLenght="short" and selector="date and time"
*
* @param {Date} date
* @param {Function} successCB
* @param {Function} errorCB
* @param {Object} options {optional}
*            formatLength {String}: 'short', 'medium', 'long', or 'full'
*            selector {String}: 'date', 'time', or 'date and time'
*
* @return Object.value {String}: The localized date string
*
* @error GlobalizationError.FORMATTING_ERROR
*
* Example
*    globalization.dateToString(new Date(),
*                function (date) {alert('date:' + date.value + '\n');},
*                function (errorCode) {alert(errorCode);},
*                {formatLength:'short'});
*/
dateToString:function(date, successCB, failureCB, options) {
    argscheck.checkArgs('dfFO', 'Globalization.dateToString', arguments);
    var dateValue = date.valueOf();
    exec(successCB, failureCB, "Globalization", "dateToString", [{"date": dateValue, "options": options}]);
},


/**
* Parses a date formatted as a string according to the client's user
* preferences and calendar using the time zone of the client and returns
* the corresponding date object. It returns the date to the successCB
* callback with a properties object as a parameter. If there is an error
* parsing the date string, then the errorCB callback is invoked.
*
* The defaults are: formatLength="short" and selector="date and time"
*
* @param {String} dateString
* @param {Function} successCB
* @param {Function} errorCB
* @param {Object} options {optional}
*            formatLength {String}: 'short', 'medium', 'long', or 'full'
*            selector {String}: 'date', 'time', or 'date and time'
*
* @return    Object.year {Number}: The four digit year
*            Object.month {Number}: The month from (0 - 11)
*            Object.day {Number}: The day from (1 - 31)
*            Object.hour {Number}: The hour from (0 - 23)
*            Object.minute {Number}: The minute from (0 - 59)
*            Object.second {Number}: The second from (0 - 59)
*            Object.millisecond {Number}: The milliseconds (from 0 - 999),
*                                        not available on all platforms
*
* @error GlobalizationError.PARSING_ERROR
*
* Example
*    globalization.stringToDate('4/11/2011',
*                function (date) { alert('Month:' + date.month + '\n' +
*                    'Day:' + date.day + '\n' +
*                    'Year:' + date.year + '\n');},
*                function (errorCode) {alert(errorCode);},
*                {selector:'date'});
*/
stringToDate:function(dateString, successCB, failureCB, options) {
    argscheck.checkArgs('sfFO', 'Globalization.stringToDate', arguments);
    exec(successCB, failureCB, "Globalization", "stringToDate", [{"dateString": dateString, "options": options}]);
},


/**
* Returns a pattern string for formatting and parsing dates according to the client's
* user preferences. It returns the pattern to the successCB callback with a
* properties object as a parameter. If there is an error obtaining the pattern,
* then the errorCB callback is invoked.
*
* The defaults are: formatLength="short" and selector="date and time"
*
* @param {Function} successCB
* @param {Function} errorCB
* @param {Object} options {optional}
*            formatLength {String}: 'short', 'medium', 'long', or 'full'
*            selector {String}: 'date', 'time', or 'date and time'
*
* @return    Object.pattern {String}: The date and time pattern for formatting and parsing dates.
*                                    The patterns follow Unicode Technical Standard #35
*                                    http://unicode.org/reports/tr35/tr35-4.html
*            Object.timezone {String}: The abbreviated name of the time zone on the client
*            Object.utc_offset {Number}: The current difference in seconds between the client's
*                                        time zone and coordinated universal time.
*            Object.dst_offset {Number}: The current daylight saving time offset in seconds
*                                        between the client's non-daylight saving's time zone
*                                        and the client's daylight saving's time zone.
*
* @error GlobalizationError.PATTERN_ERROR
*
* Example
*    globalization.getDatePattern(
*                function (date) {alert('pattern:' + date.pattern + '\n');},
*                function () {},
*                {formatLength:'short'});
*/
getDatePattern:function(successCB, failureCB, options) {
    argscheck.checkArgs('fFO', 'Globalization.getDatePattern', arguments);
    exec(successCB, failureCB, "Globalization", "getDatePattern", [{"options": options}]);
},


/**
* Returns an array of either the names of the months or days of the week
* according to the client's user preferences and calendar. It returns the array of names to the
* successCB callback with a properties object as a parameter. If there is an error obtaining the
* names, then the errorCB callback is invoked.
*
* The defaults are: type="wide" and item="months"
*
* @param {Function} successCB
* @param {Function} errorCB
* @param {Object} options {optional}
*            type {String}: 'narrow' or 'wide'
*            item {String}: 'months', or 'days'
*
* @return Object.value {Array{String}}: The array of names starting from either
*                                        the first month in the year or the
*                                        first day of the week.
* @error GlobalizationError.UNKNOWN_ERROR
*
* Example
*    globalization.getDateNames(function (names) {
*        for(var i = 0; i < names.value.length; i++) {
*            alert('Month:' + names.value[i] + '\n');}},
*        function () {});
*/
getDateNames:function(successCB, failureCB, options) {
    argscheck.checkArgs('fFO', 'Globalization.getDateNames', arguments);
    exec(successCB, failureCB, "Globalization", "getDateNames", [{"options": options}]);
},

/**
* Returns whether daylight savings time is in effect for a given date using the client's
* time zone and calendar. It returns whether or not daylight savings time is in effect
* to the successCB callback with a properties object as a parameter. If there is an error
* reading the date, then the errorCB callback is invoked.
*
* @param {Date} date
* @param {Function} successCB
* @param {Function} errorCB
*
* @return Object.dst {Boolean}: The value "true" indicates that daylight savings time is
*                                in effect for the given date and "false" indicate that it is not.
*
* @error GlobalizationError.UNKNOWN_ERROR
*
* Example
*    globalization.isDayLightSavingsTime(new Date(),
*                function (date) {alert('dst:' + date.dst + '\n');}
*                function () {});
*/
isDayLightSavingsTime:function(date, successCB, failureCB) {
    argscheck.checkArgs('dfF', 'Globalization.isDayLightSavingsTime', arguments);
    var dateValue = date.valueOf();
    exec(successCB, failureCB, "Globalization", "isDayLightSavingsTime", [{"date": dateValue}]);
},

/**
* Returns the first day of the week according to the client's user preferences and calendar.
* The days of the week are numbered starting from 1 where 1 is considered to be Sunday.
* It returns the day to the successCB callback with a properties object as a parameter.
* If there is an error obtaining the pattern, then the errorCB callback is invoked.
*
* @param {Function} successCB
* @param {Function} errorCB
*
* @return Object.value {Number}: The number of the first day of the week.
*
* @error GlobalizationError.UNKNOWN_ERROR
*
* Example
*    globalization.getFirstDayOfWeek(function (day)
*                { alert('Day:' + day.value + '\n');},
*                function () {});
*/
getFirstDayOfWeek:function(successCB, failureCB) {
    argscheck.checkArgs('fF', 'Globalization.getFirstDayOfWeek', arguments);
    exec(successCB, failureCB, "Globalization", "getFirstDayOfWeek", []);
},


/**
* Returns a number formatted as a string according to the client's user preferences.
* It returns the formatted number string to the successCB callback with a properties object as a
* parameter. If there is an error formatting the number, then the errorCB callback is invoked.
*
* The defaults are: type="decimal"
*
* @param {Number} number
* @param {Function} successCB
* @param {Function} errorCB
* @param {Object} options {optional}
*            type {String}: 'decimal', "percent", or 'currency'
*
* @return Object.value {String}: The formatted number string.
*
* @error GlobalizationError.FORMATTING_ERROR
*
* Example
*    globalization.numberToString(3.25,
*                function (number) {alert('number:' + number.value + '\n');},
*                function () {},
*                {type:'decimal'});
*/
numberToString:function(number, successCB, failureCB, options) {
    argscheck.checkArgs('nfFO', 'Globalization.numberToString', arguments);
    exec(successCB, failureCB, "Globalization", "numberToString", [{"number": number, "options": options}]);
},

/**
* Parses a number formatted as a string according to the client's user preferences and
* returns the corresponding number. It returns the number to the successCB callback with a
* properties object as a parameter. If there is an error parsing the number string, then
* the errorCB callback is invoked.
*
* The defaults are: type="decimal"
*
* @param {String} numberString
* @param {Function} successCB
* @param {Function} errorCB
* @param {Object} options {optional}
*            type {String}: 'decimal', "percent", or 'currency'
*
* @return Object.value {Number}: The parsed number.
*
* @error GlobalizationError.PARSING_ERROR
*
* Example
*    globalization.stringToNumber('1234.56',
*                function (number) {alert('Number:' + number.value + '\n');},
*                function () { alert('Error parsing number');});
*/
stringToNumber:function(numberString, successCB, failureCB, options) {
    argscheck.checkArgs('sfFO', 'Globalization.stringToNumber', arguments);
    exec(successCB, failureCB, "Globalization", "stringToNumber", [{"numberString": numberString, "options": options}]);
},

/**
* Returns a pattern string for formatting and parsing numbers according to the client's user
* preferences. It returns the pattern to the successCB callback with a properties object as a
* parameter. If there is an error obtaining the pattern, then the errorCB callback is invoked.
*
* The defaults are: type="decimal"
*
* @param {Function} successCB
* @param {Function} errorCB
* @param {Object} options {optional}
*            type {String}: 'decimal', "percent", or 'currency'
*
* @return    Object.pattern {String}: The number pattern for formatting and parsing numbers.
*                                    The patterns follow Unicode Technical Standard #35.
*                                    http://unicode.org/reports/tr35/tr35-4.html
*            Object.symbol {String}: The symbol to be used when formatting and parsing
*                                    e.g., percent or currency symbol.
*            Object.fraction {Number}: The number of fractional digits to use when parsing and
*                                    formatting numbers.
*            Object.rounding {Number}: The rounding increment to use when parsing and formatting.
*            Object.positive {String}: The symbol to use for positive numbers when parsing and formatting.
*            Object.negative: {String}: The symbol to use for negative numbers when parsing and formatting.
*            Object.decimal: {String}: The decimal symbol to use for parsing and formatting.
*            Object.grouping: {String}: The grouping symbol to use for parsing and formatting.
*
* @error GlobalizationError.PATTERN_ERROR
*
* Example
*    globalization.getNumberPattern(
*                function (pattern) {alert('Pattern:' + pattern.pattern + '\n');},
*                function () {});
*/
getNumberPattern:function(successCB, failureCB, options) {
    argscheck.checkArgs('fFO', 'Globalization.getNumberPattern', arguments);
    exec(successCB, failureCB, "Globalization", "getNumberPattern", [{"options": options}]);
},

/**
* Returns a pattern string for formatting and parsing currency values according to the client's
* user preferences and ISO 4217 currency code. It returns the pattern to the successCB callback with a
* properties object as a parameter. If there is an error obtaining the pattern, then the errorCB
* callback is invoked.
*
* @param {String} currencyCode
* @param {Function} successCB
* @param {Function} errorCB
*
* @return    Object.pattern {String}: The currency pattern for formatting and parsing currency values.
*                                    The patterns follow Unicode Technical Standard #35
*                                    http://unicode.org/reports/tr35/tr35-4.html
*            Object.code {String}: The ISO 4217 currency code for the pattern.
*            Object.fraction {Number}: The number of fractional digits to use when parsing and
*                                    formatting currency.
*            Object.rounding {Number}: The rounding increment to use when parsing and formatting.
*            Object.decimal: {String}: The decimal symbol to use for parsing and formatting.
*            Object.grouping: {String}: The grouping symbol to use for parsing and formatting.
*
* @error GlobalizationError.FORMATTING_ERROR
*
* Example
*    globalization.getCurrencyPattern('EUR',
*                function (currency) {alert('Pattern:' + currency.pattern + '\n');}
*                function () {});
*/
getCurrencyPattern:function(currencyCode, successCB, failureCB) {
    argscheck.checkArgs('sfF', 'Globalization.getCurrencyPattern', arguments);
    exec(successCB, failureCB, "Globalization", "getCurrencyPattern", [{"currencyCode": currencyCode}]);
}

};

module.exports = globalization;

});

// file: lib/ios/plugin/ios/Contact.js
define("cordova/plugin/ios/Contact", function(require, exports, module) {

var exec = require('cordova/exec'),
    ContactError = require('cordova/plugin/ContactError');

/**
 * Provides iOS Contact.display API.
 */
module.exports = {
    display : function(errorCB, options) {
        /*
         *    Display a contact using the iOS Contact Picker UI
         *    NOT part of W3C spec so no official documentation
         *
         *    @param errorCB error callback
         *    @param options object
         *    allowsEditing: boolean AS STRING
         *        "true" to allow editing the contact
         *        "false" (default) display contact
         */

        if (this.id === null) {
            if (typeof errorCB === "function") {
                var errorObj = new ContactError(ContactError.UNKNOWN_ERROR);
                errorCB(errorObj);
            }
        }
        else {
            exec(null, errorCB, "Contacts","displayContact", [this.id, options]);
        }
    }
};

});

// file: lib/ios/plugin/ios/Entry.js
define("cordova/plugin/ios/Entry", function(require, exports, module) {

module.exports = {
    toURL:function() {
        // TODO: refactor path in a cross-platform way so we can eliminate
        // these kinds of platform-specific hacks.
        return "file://localhost" + this.fullPath;
    },
    toURI: function() {
        console.log("DEPRECATED: Update your code to use 'toURL'");
        return "file://localhost" + this.fullPath;
    }
};

});

// file: lib/ios/plugin/ios/console.js
define("cordova/plugin/ios/console", function(require, exports, module) {

var exec = require('cordova/exec');

/**
 * create a nice string for an object
 */
function stringify(message) {
    try {
        if (typeof message === "object" && JSON && JSON.stringify) {
            try {
                return JSON.stringify(message);
            }
            catch (e) {
                return "error JSON.stringify()ing argument: " + e;
            }
        } else {
            return message.toString();
        }
    } catch (e) {
        return e.toString();
    }
}

/**
 * Wrapper one of the console logging methods, so that
 * the Cordova logging native is called, then the original.
 */
function wrappedMethod(console, method) {
    var origMethod = console[method];

    return function(message) {
        exec(null, null,
            'Debug Console', 'log',
            [ stringify(message), { logLevel: method.toUpperCase() } ]
        );

        if (!origMethod) return;

        origMethod.apply(console, arguments);
    };
}

var console = window.console || {};

// 2012-10-06 pmuellr - marking setLevel() method and logLevel property
// on console as deprecated;
// it didn't do anything useful, since the level constants weren't accessible
// to anyone

console.setLevel = function() {};
console.logLevel = 0;

// wrapper the logging messages

var methods = ["log", "debug", "info", "warn", "error"];

for (var i=0; i<methods.length; i++) {
    var method = methods[i];

    console[method] = wrappedMethod(console, method);
}

module.exports = console;

});

// file: lib/ios/plugin/ios/contacts.js
define("cordova/plugin/ios/contacts", function(require, exports, module) {

var exec = require('cordova/exec');

/**
 * Provides iOS enhanced contacts API.
 */
module.exports = {
    newContactUI : function(successCallback) {
        /*
         *    Create a contact using the iOS Contact Picker UI
         *    NOT part of W3C spec so no official documentation
         *
         * returns:  the id of the created contact as param to successCallback
         */
        exec(successCallback, null, "Contacts","newContact", []);
    },
    chooseContact : function(successCallback, options) {
        /*
         *    Select a contact using the iOS Contact Picker UI
         *    NOT part of W3C spec so no official documentation
         *
         *    @param errorCB error callback
         *    @param options object
         *    allowsEditing: boolean AS STRING
         *        "true" to allow editing the contact
         *        "false" (default) display contact
         *      fields: array of fields to return in contact object (see ContactOptions.fields)
         *
         *    @returns
         *        id of contact selected
         *        ContactObject
         *            if no fields provided contact contains just id information
         *            if fields provided contact object contains information for the specified fields
         *
         */
         var win = function(result) {
             var fullContact = require('cordova/plugin/contacts').create(result);
            successCallback(fullContact.id, fullContact);
       };
        exec(win, null, "Contacts","chooseContact", [options]);
    }
};

});

// file: lib/ios/plugin/ios/notification.js
define("cordova/plugin/ios/notification", function(require, exports, module) {

var Media = require('cordova/plugin/Media');

module.exports = {
    beep:function(count) {
        (new Media('beep.wav')).play();
    }
};

});

// file: lib/common/plugin/logger.js
define("cordova/plugin/logger", function(require, exports, module) {

//------------------------------------------------------------------------------
// The logger module exports the following properties/functions:
//
// LOG                          - constant for the level LOG
// ERROR                        - constant for the level ERROR
// WARN                         - constant for the level WARN
// INFO                         - constant for the level INFO
// DEBUG                        - constant for the level DEBUG
// logLevel()                   - returns current log level
// logLevel(value)              - sets and returns a new log level
// useConsole()                 - returns whether logger is using console
// useConsole(value)            - sets and returns whether logger is using console
// log(message,...)             - logs a message at level LOG
// error(message,...)           - logs a message at level ERROR
// warn(message,...)            - logs a message at level WARN
// info(message,...)            - logs a message at level INFO
// debug(message,...)           - logs a message at level DEBUG
// logLevel(level,message,...)  - logs a message specified level
//
//------------------------------------------------------------------------------

var logger = exports;

var exec    = require('cordova/exec');
var utils   = require('cordova/utils');

var UseConsole   = true;
var Queued       = [];
var DeviceReady  = false;
var CurrentLevel;

/**
 * Logging levels
 */

var Levels = [
    "LOG",
    "ERROR",
    "WARN",
    "INFO",
    "DEBUG"
];

/*
 * add the logging levels to the logger object and
 * to a separate levelsMap object for testing
 */

var LevelsMap = {};
for (var i=0; i<Levels.length; i++) {
    var level = Levels[i];
    LevelsMap[level] = i;
    logger[level]    = level;
}

CurrentLevel = LevelsMap.WARN;

/**
 * Getter/Setter for the logging level
 *
 * Returns the current logging level.
 *
 * When a value is passed, sets the logging level to that value.
 * The values should be one of the following constants:
 *    logger.LOG
 *    logger.ERROR
 *    logger.WARN
 *    logger.INFO
 *    logger.DEBUG
 *
 * The value used determines which messages get printed.  The logging
 * values above are in order, and only messages logged at the logging
 * level or above will actually be displayed to the user.  E.g., the
 * default level is WARN, so only messages logged with LOG, ERROR, or
 * WARN will be displayed; INFO and DEBUG messages will be ignored.
 */
logger.level = function (value) {
    if (arguments.length) {
        if (LevelsMap[value] === null) {
            throw new Error("invalid logging level: " + value);
        }
        CurrentLevel = LevelsMap[value];
    }

    return Levels[CurrentLevel];
};

/**
 * Getter/Setter for the useConsole functionality
 *
 * When useConsole is true, the logger will log via the
 * browser 'console' object.  Otherwise, it will use the
 * native Logger plugin.
 */
logger.useConsole = function (value) {
    if (arguments.length) UseConsole = !!value;

    if (UseConsole) {
        if (typeof console == "undefined") {
            throw new Error("global console object is not defined");
        }

        if (typeof console.log != "function") {
            throw new Error("global console object does not have a log function");
        }

        if (typeof console.useLogger == "function") {
            if (console.useLogger()) {
                throw new Error("console and logger are too intertwingly");
            }
        }
    }

    return UseConsole;
};

/**
 * Logs a message at the LOG level.
 *
 * Parameters passed after message are used applied to
 * the message with utils.format()
 */
logger.log   = function(message) { logWithArgs("LOG",   arguments); };

/**
 * Logs a message at the ERROR level.
 *
 * Parameters passed after message are used applied to
 * the message with utils.format()
 */
logger.error = function(message) { logWithArgs("ERROR", arguments); };

/**
 * Logs a message at the WARN level.
 *
 * Parameters passed after message are used applied to
 * the message with utils.format()
 */
logger.warn  = function(message) { logWithArgs("WARN",  arguments); };

/**
 * Logs a message at the INFO level.
 *
 * Parameters passed after message are used applied to
 * the message with utils.format()
 */
logger.info  = function(message) { logWithArgs("INFO",  arguments); };

/**
 * Logs a message at the DEBUG level.
 *
 * Parameters passed after message are used applied to
 * the message with utils.format()
 */
logger.debug = function(message) { logWithArgs("DEBUG", arguments); };

// log at the specified level with args
function logWithArgs(level, args) {
    args = [level].concat([].slice.call(args));
    logger.logLevel.apply(logger, args);
}

/**
 * Logs a message at the specified level.
 *
 * Parameters passed after message are used applied to
 * the message with utils.format()
 */
logger.logLevel = function(level, message /* , ... */) {
    // format the message with the parameters
    var formatArgs = [].slice.call(arguments, 2);
    message    = utils.vformat(message, formatArgs);

    if (LevelsMap[level] === null) {
        throw new Error("invalid logging level: " + level);
    }

    if (LevelsMap[level] > CurrentLevel) return;

    // queue the message if not yet at deviceready
    if (!DeviceReady && !UseConsole) {
        Queued.push([level, message]);
        return;
    }

    // if not using the console, use the native logger
    if (!UseConsole) {
        exec(null, null, "Logger", "logLevel", [level, message]);
        return;
    }

    // make sure console is not using logger
    if (console.__usingCordovaLogger) {
        throw new Error("console and logger are too intertwingly");
    }

    // log to the console
    switch (level) {
        case logger.LOG:   console.log(message); break;
        case logger.ERROR: console.log("ERROR: " + message); break;
        case logger.WARN:  console.log("WARN: "  + message); break;
        case logger.INFO:  console.log("INFO: "  + message); break;
        case logger.DEBUG: console.log("DEBUG: " + message); break;
    }
};

// when deviceready fires, log queued messages
logger.__onDeviceReady = function() {
    if (DeviceReady) return;

    DeviceReady = true;

    for (var i=0; i<Queued.length; i++) {
        var messageArgs = Queued[i];
        logger.logLevel(messageArgs[0], messageArgs[1]);
    }

    Queued = null;
};

// add a deviceready event to log queued messages
document.addEventListener("deviceready", logger.__onDeviceReady, false);

});

// file: lib/common/plugin/network.js
define("cordova/plugin/network", function(require, exports, module) {

var exec = require('cordova/exec'),
    cordova = require('cordova'),
    channel = require('cordova/channel'),
    utils = require('cordova/utils');

// Link the onLine property with the Cordova-supplied network info.
// This works because we clobber the naviagtor object with our own
// object in bootstrap.js.
if (typeof navigator != 'undefined') {
    utils.defineGetter(navigator, 'onLine', function() {
        return this.connection.type != 'none';
    });
}

function NetworkConnection() {
    this.type = 'unknown';
}

/**
 * Get connection info
 *
 * @param {Function} successCallback The function to call when the Connection data is available
 * @param {Function} errorCallback The function to call when there is an error getting the Connection data. (OPTIONAL)
 */
NetworkConnection.prototype.getInfo = function(successCallback, errorCallback) {
    exec(successCallback, errorCallback, "NetworkStatus", "getConnectionInfo", []);
};

var me = new NetworkConnection();
var timerId = null;
var timeout = 500;

channel.onCordovaReady.subscribe(function() {
    me.getInfo(function(info) {
        me.type = info;
        if (info === "none") {
            // set a timer if still offline at the end of timer send the offline event
            timerId = setTimeout(function(){
                cordova.fireDocumentEvent("offline");
                timerId = null;
            }, timeout);
        } else {
            // If there is a current offline event pending clear it
            if (timerId !== null) {
                clearTimeout(timerId);
                timerId = null;
            }
            cordova.fireDocumentEvent("online");
        }

        // should only fire this once
        if (channel.onCordovaConnectionReady.state !== 2) {
            channel.onCordovaConnectionReady.fire();
        }
    },
    function (e) {
        // If we can't get the network info we should still tell Cordova
        // to fire the deviceready event.
        if (channel.onCordovaConnectionReady.state !== 2) {
            channel.onCordovaConnectionReady.fire();
        }
        console.log("Error initializing Network Connection: " + e);
    });
});

module.exports = me;

});

// file: lib/common/plugin/notification.js
define("cordova/plugin/notification", function(require, exports, module) {

var exec = require('cordova/exec');

/**
 * Provides access to notifications on the device.
 */

module.exports = {

    /**
     * Open a native alert dialog, with a customizable title and button text.
     *
     * @param {String} message              Message to print in the body of the alert
     * @param {Function} completeCallback   The callback that is called when user clicks on a button.
     * @param {String} title                Title of the alert dialog (default: Alert)
     * @param {String} buttonLabel          Label of the close button (default: OK)
     */
    alert: function(message, completeCallback, title, buttonLabel) {
        var _title = (title || "Alert");
        var _buttonLabel = (buttonLabel || "OK");
        exec(completeCallback, null, "Notification", "alert", [message, _title, _buttonLabel]);
    },

    /**
     * Open a native confirm dialog, with a customizable title and button text.
     * The result that the user selects is returned to the result callback.
     *
     * @param {String} message              Message to print in the body of the alert
     * @param {Function} resultCallback     The callback that is called when user clicks on a button.
     * @param {String} title                Title of the alert dialog (default: Confirm)
     * @param {String} buttonLabels         Comma separated list of the labels of the buttons (default: 'OK,Cancel')
     */
    confirm: function(message, resultCallback, title, buttonLabels) {
        var _title = (title || "Confirm");
        var _buttonLabels = (buttonLabels || "OK,Cancel");
        exec(resultCallback, null, "Notification", "confirm", [message, _title, _buttonLabels]);
    },

    /**
     * Causes the device to vibrate.
     *
     * @param {Integer} mills       The number of milliseconds to vibrate for.
     */
    vibrate: function(mills) {
        exec(null, null, "Notification", "vibrate", [mills]);
    },

    /**
     * Causes the device to beep.
     * On Android, the default notification ringtone is played "count" times.
     *
     * @param {Integer} count       The number of beeps.
     */
    beep: function(count) {
        exec(null, null, "Notification", "beep", [count]);
    }
};

});

// file: lib/common/plugin/requestFileSystem.js
define("cordova/plugin/requestFileSystem", function(require, exports, module) {

var argscheck = require('cordova/argscheck'),
    FileError = require('cordova/plugin/FileError'),
    FileSystem = require('cordova/plugin/FileSystem'),
    exec = require('cordova/exec');

/**
 * Request a file system in which to store application data.
 * @param type  local file system type
 * @param size  indicates how much storage space, in bytes, the application expects to need
 * @param successCallback  invoked with a FileSystem object
 * @param errorCallback  invoked if error occurs retrieving file system
 */
var requestFileSystem = function(type, size, successCallback, errorCallback) {
    argscheck.checkArgs('nnFF', 'requestFileSystem', arguments);
    var fail = function(code) {
        errorCallback && errorCallback(new FileError(code));
    };

    if (type < 0 || type > 3) {
        fail(FileError.SYNTAX_ERR);
    } else {
        // if successful, return a FileSystem object
        var success = function(file_system) {
            if (file_system) {
                if (successCallback) {
                    // grab the name and root from the file system object
                    var result = new FileSystem(file_system.name, file_system.root);
                    successCallback(result);
                }
            }
            else {
                // no FileSystem object returned
                fail(FileError.NOT_FOUND_ERR);
            }
        };
        exec(success, fail, "File", "requestFileSystem", [type, size]);
    }
};

module.exports = requestFileSystem;

});

// file: lib/common/plugin/resolveLocalFileSystemURI.js
define("cordova/plugin/resolveLocalFileSystemURI", function(require, exports, module) {

var argscheck = require('cordova/argscheck'),
    DirectoryEntry = require('cordova/plugin/DirectoryEntry'),
    FileEntry = require('cordova/plugin/FileEntry'),
    FileError = require('cordova/plugin/FileError'),
    exec = require('cordova/exec');

/**
 * Look up file system Entry referred to by local URI.
 * @param {DOMString} uri  URI referring to a local file or directory
 * @param successCallback  invoked with Entry object corresponding to URI
 * @param errorCallback    invoked if error occurs retrieving file system entry
 */
module.exports = function(uri, successCallback, errorCallback) {
    argscheck.checkArgs('sFF', 'resolveLocalFileSystemURI', arguments);
    // error callback
    var fail = function(error) {
        errorCallback && errorCallback(new FileError(error));
    };
    // sanity check for 'not:valid:filename'
    if(!uri || uri.split(":").length > 2) {
        setTimeout( function() {
            fail(FileError.ENCODING_ERR);
        },0);
        return;
    }
    // if successful, return either a file or directory entry
    var success = function(entry) {
        var result;
        if (entry) {
            if (successCallback) {
                // create appropriate Entry object
                result = (entry.isDirectory) ? new DirectoryEntry(entry.name, entry.fullPath) : new FileEntry(entry.name, entry.fullPath);
                successCallback(result);
            }
        }
        else {
            // no Entry object returned
            fail(FileError.NOT_FOUND_ERR);
        }
    };

    exec(success, fail, "File", "resolveLocalFileSystemURI", [uri]);
};

});

// file: lib/common/plugin/splashscreen.js
define("cordova/plugin/splashscreen", function(require, exports, module) {

var exec = require('cordova/exec');

var splashscreen = {
    show:function() {
        exec(null, null, "SplashScreen", "show", []);
    },
    hide:function() {
        exec(null, null, "SplashScreen", "hide", []);
    }
};

module.exports = splashscreen;

});

// file: lib/common/utils.js
define("cordova/utils", function(require, exports, module) {

var utils = exports;

/**
 * Defines a property getter / setter for obj[key].
 */
utils.defineGetterSetter = function(obj, key, getFunc, opt_setFunc) {
    if (Object.defineProperty) {
        var desc = {
            get: getFunc,
            configurable: true
        };
        if (opt_setFunc) {
            desc.set = opt_setFunc;
        }
        Object.defineProperty(obj, key, desc);
    } else {
        obj.__defineGetter__(key, getFunc);
        if (opt_setFunc) {
            obj.__defineSetter__(key, opt_setFunc);
        }
    }
};

/**
 * Defines a property getter for obj[key].
 */
utils.defineGetter = utils.defineGetterSetter;

utils.arrayIndexOf = function(a, item) {
    if (a.indexOf) {
        return a.indexOf(item);
    }
    var len = a.length;
    for (var i = 0; i < len; ++i) {
        if (a[i] == item) {
            return i;
        }
    }
    return -1;
};

/**
 * Returns whether the item was found in the array.
 */
utils.arrayRemove = function(a, item) {
    var index = utils.arrayIndexOf(a, item);
    if (index != -1) {
        a.splice(index, 1);
    }
    return index != -1;
};

utils.typeName = function(val) {
    return Object.prototype.toString.call(val).slice(8, -1);
};

/**
 * Returns an indication of whether the argument is an array or not
 */
utils.isArray = function(a) {
    return utils.typeName(a) == 'Array';
};

/**
 * Returns an indication of whether the argument is a Date or not
 */
utils.isDate = function(d) {
    return utils.typeName(d) == 'Date';
};

/**
 * Does a deep clone of the object.
 */
utils.clone = function(obj) {
    if(!obj || typeof obj == 'function' || utils.isDate(obj) || typeof obj != 'object') {
        return obj;
    }

    var retVal, i;

    if(utils.isArray(obj)){
        retVal = [];
        for(i = 0; i < obj.length; ++i){
            retVal.push(utils.clone(obj[i]));
        }
        return retVal;
    }

    retVal = {};
    for(i in obj){
        if(!(i in retVal) || retVal[i] != obj[i]) {
            retVal[i] = utils.clone(obj[i]);
        }
    }
    return retVal;
};

/**
 * Returns a wrapped version of the function
 */
utils.close = function(context, func, params) {
    if (typeof params == 'undefined') {
        return function() {
            return func.apply(context, arguments);
        };
    } else {
        return function() {
            return func.apply(context, params);
        };
    }
};

/**
 * Create a UUID
 */
utils.createUUID = function() {
    return UUIDcreatePart(4) + '-' +
        UUIDcreatePart(2) + '-' +
        UUIDcreatePart(2) + '-' +
        UUIDcreatePart(2) + '-' +
        UUIDcreatePart(6);
};

/**
 * Extends a child object from a parent object using classical inheritance
 * pattern.
 */
utils.extend = (function() {
    // proxy used to establish prototype chain
    var F = function() {};
    // extend Child from Parent
    return function(Child, Parent) {
        F.prototype = Parent.prototype;
        Child.prototype = new F();
        Child.__super__ = Parent.prototype;
        Child.prototype.constructor = Child;
    };
}());

/**
 * Alerts a message in any available way: alert or console.log.
 */
utils.alert = function(msg) {
    if (window.alert) {
        window.alert(msg);
    } else if (console && console.log) {
        console.log(msg);
    }
};

/**
 * Formats a string and arguments following it ala sprintf()
 *
 * see utils.vformat() for more information
 */
utils.format = function(formatString /* ,... */) {
    var args = [].slice.call(arguments, 1);
    return utils.vformat(formatString, args);
};

/**
 * Formats a string and arguments following it ala vsprintf()
 *
 * format chars:
 *   %j - format arg as JSON
 *   %o - format arg as JSON
 *   %c - format arg as ''
 *   %% - replace with '%'
 * any other char following % will format it's
 * arg via toString().
 *
 * for rationale, see FireBug's Console API:
 *    http://getfirebug.com/wiki/index.php/Console_API
 */
utils.vformat = function(formatString, args) {
    if (formatString === null || formatString === undefined) return "";
    if (arguments.length == 1) return formatString.toString();
    if (typeof formatString != "string") return formatString.toString();

    var pattern = /(.*?)%(.)(.*)/;
    var rest    = formatString;
    var result  = [];

    while (args.length) {
        var arg   = args.shift();
        var match = pattern.exec(rest);

        if (!match) break;

        rest = match[3];

        result.push(match[1]);

        if (match[2] == '%') {
            result.push('%');
            args.unshift(arg);
            continue;
        }

        result.push(formatted(arg, match[2]));
    }

    result.push(rest);

    return result.join('');
};

//------------------------------------------------------------------------------
function UUIDcreatePart(length) {
    var uuidpart = "";
    for (var i=0; i<length; i++) {
        var uuidchar = parseInt((Math.random() * 256), 10).toString(16);
        if (uuidchar.length == 1) {
            uuidchar = "0" + uuidchar;
        }
        uuidpart += uuidchar;
    }
    return uuidpart;
}

//------------------------------------------------------------------------------
function formatted(object, formatChar) {

    try {
        switch(formatChar) {
            case 'j':
            case 'o': return JSON.stringify(object);
            case 'c': return '';
        }
    }
    catch (e) {
        return "error JSON.stringify()ing argument: " + e;
    }

    if ((object === null) || (object === undefined)) {
        return Object.prototype.toString.call(object);
    }

    return object.toString();
}

});


window.cordova = require('cordova');

// file: lib/scripts/bootstrap.js

(function (context) {
    // Replace navigator before any modules are required(), to ensure it happens as soon as possible.
    // We replace it so that properties that can't be clobbered can instead be overridden.
    if (context.navigator) {
        var CordovaNavigator = function() {};
        CordovaNavigator.prototype = context.navigator;
        context.navigator = new CordovaNavigator();
    }

    var channel = require("cordova/channel"),
        _self = {
            boot: function () {
                /**
                 * Create all cordova objects once page has fully loaded and native side is ready.
                 */
                channel.join(function() {
                    var builder = require('cordova/builder'),
                        base = require('cordova/common'),
                        platform = require('cordova/platform');

                    // Drop the common globals into the window object, but be nice and don't overwrite anything.
                    builder.buildIntoButDoNotClobber(base.defaults, context);
                    builder.buildIntoAndClobber(base.clobbers, context);
                    builder.buildIntoAndMerge(base.merges, context);

                    builder.buildIntoButDoNotClobber(platform.defaults, context);
                    builder.buildIntoAndClobber(platform.clobbers, context);
                    builder.buildIntoAndMerge(platform.merges, context);

                    // Call the platform-specific initialization
                    platform.initialize();

                    // Fire event to notify that all objects are created
                    channel.onCordovaReady.fire();

                    // Fire onDeviceReady event once all constructors have run and
                    // cordova info has been received from native side.
                    channel.join(function() {
                        require('cordova').fireDocumentEvent('deviceready');
                    }, channel.deviceReadyChannelsArray);

                }, [ channel.onDOMContentLoaded, channel.onNativeReady ]);
            }
        };

    // boot up once native side is ready
    channel.onNativeReady.subscribe(_self.boot);

    // _nativeReady is global variable that the native side can set
    // to signify that the native code is ready. It is a global since
    // it may be called before any cordova JS is ready.
    if (window._nativeReady) {
        channel.onNativeReady.fire();
    }

}(window));


})();;
/* MIT licensed */
// (c) 2010 Jesse MacFadyen, Nitobi


(function() {

var cordovaRef = window.PhoneGap || window.Cordova || window.cordova; // old to new fallbacks

function ChildBrowser() {
    // Does nothing
}

// Callback when the location of the page changes
// called from native
ChildBrowser._onLocationChange = function(newLoc)
{
    window.plugins.childBrowser.onLocationChange(newLoc);
};

// Callback when the user chooses the 'Done' button
// called from native
ChildBrowser._onClose = function()
{
    window.plugins.childBrowser.onClose();
};

// Callback when the user chooses the 'open in Safari' button
// called from native
ChildBrowser._onOpenExternal = function()
{
    window.plugins.childBrowser.onOpenExternal();
};

// Pages loaded into the ChildBrowser can execute callback scripts, so be careful to
// check location, and make sure it is a location you trust.
// Warning ... don't exec arbitrary code, it's risky and could fuck up your app.
// called from native
ChildBrowser._onJSCallback = function(js,loc)
{
    // Not Implemented
    //window.plugins.childBrowser.onJSCallback(js,loc);
};

/* The interface that you will use to access functionality */

// Show a webpage, will result in a callback to onLocationChange
ChildBrowser.prototype.showWebPage = function(loc)
{
    cordovaRef.exec("ChildBrowserCommand.showWebPage", loc);
};

// close the browser, will NOT result in close callback
ChildBrowser.prototype.close = function()
{
    cordovaRef.exec("ChildBrowserCommand.close");
};

// Not Implemented
ChildBrowser.prototype.jsExec = function(jsString)
{
    // Not Implemented!!
    //PhoneGap.exec("ChildBrowserCommand.jsExec",jsString);
};

// Note: this plugin does NOT install itself, call this method some time after deviceready to install it
// it will be returned, and also available globally from window.plugins.childBrowser
ChildBrowser.install = function()
{
    if(!window.plugins) {
        window.plugins = {};
    }
        if ( ! window.plugins.childBrowser ) {
        window.plugins.childBrowser = new ChildBrowser();
    }

};


if (cordovaRef && cordovaRef.addConstructor) {
    cordovaRef.addConstructor(ChildBrowser.install);
} else {
    console.log("ChildBrowser Cordova Plugin could not be installed.");
    return null;
}


})();;
//
//  Filepicker.js
//
// Created by Albert Swantner and Jon Uy on .
//
// Copyright 2011-2012 Albert Swantner. All rights reserved.
// MIT Licensed

(function() {
	
	var cordovaRef = window.PhoneGap || window.Cordova || window.cordova; // old to new fallbacks

	function Filepicker() {
		//does nothing
	}

	Filepicker.prototype.pick = function(_options, _onSuccess, _onError) {
	
//	filepicker.pick({
//	    mimetypes: ['image/*', 'text/plain'],
//	    container: 'window',
//	    services:['COMPUTER', 'FACEBOOK', 'GMAIL'],
//	  },
//	  function(FPFile){
//	    console.log(JSON.stringify(FPFile));
//	  },
//	  function(FPError){
//	    console.log(FPError.toString());
//    }
//	);
		// Expected options:
		//  dataTypes: array - Specific data types. (Optional) Default is all files.
		//  sourceNames: array - Select and order the sources (Optional) Default is all sources.
		//  allowEditing: boolean - Set some of the in built Camera properties as you would with UIImagePicker.
		//  shouldUpload: boolean - When a user selects a local file, we'll upload it and return a remote url.
		//  shouldDownload: boolean - When a user selects a remote file, we'll download it and return the filedata to you.

		var successCallback = function(result) {
			if (typeof _onSuccess == 'function') {
				_onSuccess.apply(null, [result]);
			}
		};

		var errorCallback = function(result) {
			if (typeof _onError == 'function') {
				_onError.apply(null, [result]);
			}
		};
		
		return cordova.exec(successCallback, errorCallback, 'Filepicker', 'pick', [_options]);
	};

	Filepicker.prototype.save = function(_options, _onSuccess, _onError) {
		var successCallback = function(result) {
			if (typeof _onSuccess == 'function') {
				_onSuccess.apply(null, [result]);
			}
		};

		var errorCallback = function(result) {
			if (typeof _onError == 'function') {
				_onError.apply(null, [result]);
			}
		};

		return cordova.exec(successCallback, errorCallback, 'Filepicker', 'save', [_options]);
	};

	cordova.addConstructor(function() {
		if(!window.plugins) window.plugins = {};
		window.plugins.filepicker = new Filepicker();
	});

})(window.cordova || window.Cordova);;
/*! jQuery v2.0.0 | (c) 2005, 2013 jQuery Foundation, Inc. | jquery.org/license
//@ sourceMappingURL=jquery.min.map
*/
(function(e,undefined){var t,n,r=typeof undefined,i=e.location,o=e.document,s=o.documentElement,a=e.jQuery,u=e.$,l={},c=[],f="2.0.0",p=c.concat,h=c.push,d=c.slice,g=c.indexOf,m=l.toString,y=l.hasOwnProperty,v=f.trim,x=function(e,n){return new x.fn.init(e,n,t)},b=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,w=/\S+/g,T=/^(?:(<[\w\W]+>)[^>]*|#([\w-]*))$/,C=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,k=/^-ms-/,N=/-([\da-z])/gi,E=function(e,t){return t.toUpperCase()},S=function(){o.removeEventListener("DOMContentLoaded",S,!1),e.removeEventListener("load",S,!1),x.ready()};x.fn=x.prototype={jquery:f,constructor:x,init:function(e,t,n){var r,i;if(!e)return this;if("string"==typeof e){if(r="<"===e.charAt(0)&&">"===e.charAt(e.length-1)&&e.length>=3?[null,e,null]:T.exec(e),!r||!r[1]&&t)return!t||t.jquery?(t||n).find(e):this.constructor(t).find(e);if(r[1]){if(t=t instanceof x?t[0]:t,x.merge(this,x.parseHTML(r[1],t&&t.nodeType?t.ownerDocument||t:o,!0)),C.test(r[1])&&x.isPlainObject(t))for(r in t)x.isFunction(this[r])?this[r](t[r]):this.attr(r,t[r]);return this}return i=o.getElementById(r[2]),i&&i.parentNode&&(this.length=1,this[0]=i),this.context=o,this.selector=e,this}return e.nodeType?(this.context=this[0]=e,this.length=1,this):x.isFunction(e)?n.ready(e):(e.selector!==undefined&&(this.selector=e.selector,this.context=e.context),x.makeArray(e,this))},selector:"",length:0,toArray:function(){return d.call(this)},get:function(e){return null==e?this.toArray():0>e?this[this.length+e]:this[e]},pushStack:function(e){var t=x.merge(this.constructor(),e);return t.prevObject=this,t.context=this.context,t},each:function(e,t){return x.each(this,e,t)},ready:function(e){return x.ready.promise().done(e),this},slice:function(){return this.pushStack(d.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(e){var t=this.length,n=+e+(0>e?t:0);return this.pushStack(n>=0&&t>n?[this[n]]:[])},map:function(e){return this.pushStack(x.map(this,function(t,n){return e.call(t,n,t)}))},end:function(){return this.prevObject||this.constructor(null)},push:h,sort:[].sort,splice:[].splice},x.fn.init.prototype=x.fn,x.extend=x.fn.extend=function(){var e,t,n,r,i,o,s=arguments[0]||{},a=1,u=arguments.length,l=!1;for("boolean"==typeof s&&(l=s,s=arguments[1]||{},a=2),"object"==typeof s||x.isFunction(s)||(s={}),u===a&&(s=this,--a);u>a;a++)if(null!=(e=arguments[a]))for(t in e)n=s[t],r=e[t],s!==r&&(l&&r&&(x.isPlainObject(r)||(i=x.isArray(r)))?(i?(i=!1,o=n&&x.isArray(n)?n:[]):o=n&&x.isPlainObject(n)?n:{},s[t]=x.extend(l,o,r)):r!==undefined&&(s[t]=r));return s},x.extend({expando:"jQuery"+(f+Math.random()).replace(/\D/g,""),noConflict:function(t){return e.$===x&&(e.$=u),t&&e.jQuery===x&&(e.jQuery=a),x},isReady:!1,readyWait:1,holdReady:function(e){e?x.readyWait++:x.ready(!0)},ready:function(e){(e===!0?--x.readyWait:x.isReady)||(x.isReady=!0,e!==!0&&--x.readyWait>0||(n.resolveWith(o,[x]),x.fn.trigger&&x(o).trigger("ready").off("ready")))},isFunction:function(e){return"function"===x.type(e)},isArray:Array.isArray,isWindow:function(e){return null!=e&&e===e.window},isNumeric:function(e){return!isNaN(parseFloat(e))&&isFinite(e)},type:function(e){return null==e?e+"":"object"==typeof e||"function"==typeof e?l[m.call(e)]||"object":typeof e},isPlainObject:function(e){if("object"!==x.type(e)||e.nodeType||x.isWindow(e))return!1;try{if(e.constructor&&!y.call(e.constructor.prototype,"isPrototypeOf"))return!1}catch(t){return!1}return!0},isEmptyObject:function(e){var t;for(t in e)return!1;return!0},error:function(e){throw Error(e)},parseHTML:function(e,t,n){if(!e||"string"!=typeof e)return null;"boolean"==typeof t&&(n=t,t=!1),t=t||o;var r=C.exec(e),i=!n&&[];return r?[t.createElement(r[1])]:(r=x.buildFragment([e],t,i),i&&x(i).remove(),x.merge([],r.childNodes))},parseJSON:JSON.parse,parseXML:function(e){var t,n;if(!e||"string"!=typeof e)return null;try{n=new DOMParser,t=n.parseFromString(e,"text/xml")}catch(r){t=undefined}return(!t||t.getElementsByTagName("parsererror").length)&&x.error("Invalid XML: "+e),t},noop:function(){},globalEval:function(e){var t,n=eval;e=x.trim(e),e&&(1===e.indexOf("use strict")?(t=o.createElement("script"),t.text=e,o.head.appendChild(t).parentNode.removeChild(t)):n(e))},camelCase:function(e){return e.replace(k,"ms-").replace(N,E)},nodeName:function(e,t){return e.nodeName&&e.nodeName.toLowerCase()===t.toLowerCase()},each:function(e,t,n){var r,i=0,o=e.length,s=j(e);if(n){if(s){for(;o>i;i++)if(r=t.apply(e[i],n),r===!1)break}else for(i in e)if(r=t.apply(e[i],n),r===!1)break}else if(s){for(;o>i;i++)if(r=t.call(e[i],i,e[i]),r===!1)break}else for(i in e)if(r=t.call(e[i],i,e[i]),r===!1)break;return e},trim:function(e){return null==e?"":v.call(e)},makeArray:function(e,t){var n=t||[];return null!=e&&(j(Object(e))?x.merge(n,"string"==typeof e?[e]:e):h.call(n,e)),n},inArray:function(e,t,n){return null==t?-1:g.call(t,e,n)},merge:function(e,t){var n=t.length,r=e.length,i=0;if("number"==typeof n)for(;n>i;i++)e[r++]=t[i];else while(t[i]!==undefined)e[r++]=t[i++];return e.length=r,e},grep:function(e,t,n){var r,i=[],o=0,s=e.length;for(n=!!n;s>o;o++)r=!!t(e[o],o),n!==r&&i.push(e[o]);return i},map:function(e,t,n){var r,i=0,o=e.length,s=j(e),a=[];if(s)for(;o>i;i++)r=t(e[i],i,n),null!=r&&(a[a.length]=r);else for(i in e)r=t(e[i],i,n),null!=r&&(a[a.length]=r);return p.apply([],a)},guid:1,proxy:function(e,t){var n,r,i;return"string"==typeof t&&(n=e[t],t=e,e=n),x.isFunction(e)?(r=d.call(arguments,2),i=function(){return e.apply(t||this,r.concat(d.call(arguments)))},i.guid=e.guid=e.guid||x.guid++,i):undefined},access:function(e,t,n,r,i,o,s){var a=0,u=e.length,l=null==n;if("object"===x.type(n)){i=!0;for(a in n)x.access(e,t,a,n[a],!0,o,s)}else if(r!==undefined&&(i=!0,x.isFunction(r)||(s=!0),l&&(s?(t.call(e,r),t=null):(l=t,t=function(e,t,n){return l.call(x(e),n)})),t))for(;u>a;a++)t(e[a],n,s?r:r.call(e[a],a,t(e[a],n)));return i?e:l?t.call(e):u?t(e[0],n):o},now:Date.now,swap:function(e,t,n,r){var i,o,s={};for(o in t)s[o]=e.style[o],e.style[o]=t[o];i=n.apply(e,r||[]);for(o in t)e.style[o]=s[o];return i}}),x.ready.promise=function(t){return n||(n=x.Deferred(),"complete"===o.readyState?setTimeout(x.ready):(o.addEventListener("DOMContentLoaded",S,!1),e.addEventListener("load",S,!1))),n.promise(t)},x.each("Boolean Number String Function Array Date RegExp Object Error".split(" "),function(e,t){l["[object "+t+"]"]=t.toLowerCase()});function j(e){var t=e.length,n=x.type(e);return x.isWindow(e)?!1:1===e.nodeType&&t?!0:"array"===n||"function"!==n&&(0===t||"number"==typeof t&&t>0&&t-1 in e)}t=x(o),function(e,undefined){var t,n,r,i,o,s,a,u,l,c,f,p,h,d,g,m,y="sizzle"+-new Date,v=e.document,b={},w=0,T=0,C=ot(),k=ot(),N=ot(),E=!1,S=function(){return 0},j=typeof undefined,D=1<<31,A=[],L=A.pop,q=A.push,H=A.push,O=A.slice,F=A.indexOf||function(e){var t=0,n=this.length;for(;n>t;t++)if(this[t]===e)return t;return-1},P="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",R="[\\x20\\t\\r\\n\\f]",M="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",W=M.replace("w","w#"),$="\\["+R+"*("+M+")"+R+"*(?:([*^$|!~]?=)"+R+"*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|("+W+")|)|)"+R+"*\\]",B=":("+M+")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|"+$.replace(3,8)+")*)|.*)\\)|)",I=RegExp("^"+R+"+|((?:^|[^\\\\])(?:\\\\.)*)"+R+"+$","g"),z=RegExp("^"+R+"*,"+R+"*"),_=RegExp("^"+R+"*([>+~]|"+R+")"+R+"*"),X=RegExp(R+"*[+~]"),U=RegExp("="+R+"*([^\\]'\"]*)"+R+"*\\]","g"),Y=RegExp(B),V=RegExp("^"+W+"$"),G={ID:RegExp("^#("+M+")"),CLASS:RegExp("^\\.("+M+")"),TAG:RegExp("^("+M.replace("w","w*")+")"),ATTR:RegExp("^"+$),PSEUDO:RegExp("^"+B),CHILD:RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+R+"*(even|odd|(([+-]|)(\\d*)n|)"+R+"*(?:([+-]|)"+R+"*(\\d+)|))"+R+"*\\)|)","i"),"boolean":RegExp("^(?:"+P+")$","i"),needsContext:RegExp("^"+R+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+R+"*((?:-\\d)?\\d*)"+R+"*\\)|)(?=[^-]|$)","i")},J=/^[^{]+\{\s*\[native \w/,Q=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,K=/^(?:input|select|textarea|button)$/i,Z=/^h\d$/i,et=/'|\\/g,tt=/\\([\da-fA-F]{1,6}[\x20\t\r\n\f]?|.)/g,nt=function(e,t){var n="0x"+t-65536;return n!==n?t:0>n?String.fromCharCode(n+65536):String.fromCharCode(55296|n>>10,56320|1023&n)};try{H.apply(A=O.call(v.childNodes),v.childNodes),A[v.childNodes.length].nodeType}catch(rt){H={apply:A.length?function(e,t){q.apply(e,O.call(t))}:function(e,t){var n=e.length,r=0;while(e[n++]=t[r++]);e.length=n-1}}}function it(e){return J.test(e+"")}function ot(){var e,t=[];return e=function(n,i){return t.push(n+=" ")>r.cacheLength&&delete e[t.shift()],e[n]=i}}function st(e){return e[y]=!0,e}function at(e){var t=c.createElement("div");try{return!!e(t)}catch(n){return!1}finally{t.parentNode&&t.parentNode.removeChild(t),t=null}}function ut(e,t,n,r){var i,o,s,a,u,f,d,g,x,w;if((t?t.ownerDocument||t:v)!==c&&l(t),t=t||c,n=n||[],!e||"string"!=typeof e)return n;if(1!==(a=t.nodeType)&&9!==a)return[];if(p&&!r){if(i=Q.exec(e))if(s=i[1]){if(9===a){if(o=t.getElementById(s),!o||!o.parentNode)return n;if(o.id===s)return n.push(o),n}else if(t.ownerDocument&&(o=t.ownerDocument.getElementById(s))&&m(t,o)&&o.id===s)return n.push(o),n}else{if(i[2])return H.apply(n,t.getElementsByTagName(e)),n;if((s=i[3])&&b.getElementsByClassName&&t.getElementsByClassName)return H.apply(n,t.getElementsByClassName(s)),n}if(b.qsa&&(!h||!h.test(e))){if(g=d=y,x=t,w=9===a&&e,1===a&&"object"!==t.nodeName.toLowerCase()){f=gt(e),(d=t.getAttribute("id"))?g=d.replace(et,"\\$&"):t.setAttribute("id",g),g="[id='"+g+"'] ",u=f.length;while(u--)f[u]=g+mt(f[u]);x=X.test(e)&&t.parentNode||t,w=f.join(",")}if(w)try{return H.apply(n,x.querySelectorAll(w)),n}catch(T){}finally{d||t.removeAttribute("id")}}}return kt(e.replace(I,"$1"),t,n,r)}o=ut.isXML=function(e){var t=e&&(e.ownerDocument||e).documentElement;return t?"HTML"!==t.nodeName:!1},l=ut.setDocument=function(e){var t=e?e.ownerDocument||e:v;return t!==c&&9===t.nodeType&&t.documentElement?(c=t,f=t.documentElement,p=!o(t),b.getElementsByTagName=at(function(e){return e.appendChild(t.createComment("")),!e.getElementsByTagName("*").length}),b.attributes=at(function(e){return e.className="i",!e.getAttribute("className")}),b.getElementsByClassName=at(function(e){return e.innerHTML="<div class='a'></div><div class='a i'></div>",e.firstChild.className="i",2===e.getElementsByClassName("i").length}),b.sortDetached=at(function(e){return 1&e.compareDocumentPosition(c.createElement("div"))}),b.getById=at(function(e){return f.appendChild(e).id=y,!t.getElementsByName||!t.getElementsByName(y).length}),b.getById?(r.find.ID=function(e,t){if(typeof t.getElementById!==j&&p){var n=t.getElementById(e);return n&&n.parentNode?[n]:[]}},r.filter.ID=function(e){var t=e.replace(tt,nt);return function(e){return e.getAttribute("id")===t}}):(r.find.ID=function(e,t){if(typeof t.getElementById!==j&&p){var n=t.getElementById(e);return n?n.id===e||typeof n.getAttributeNode!==j&&n.getAttributeNode("id").value===e?[n]:undefined:[]}},r.filter.ID=function(e){var t=e.replace(tt,nt);return function(e){var n=typeof e.getAttributeNode!==j&&e.getAttributeNode("id");return n&&n.value===t}}),r.find.TAG=b.getElementsByTagName?function(e,t){return typeof t.getElementsByTagName!==j?t.getElementsByTagName(e):undefined}:function(e,t){var n,r=[],i=0,o=t.getElementsByTagName(e);if("*"===e){while(n=o[i++])1===n.nodeType&&r.push(n);return r}return o},r.find.CLASS=b.getElementsByClassName&&function(e,t){return typeof t.getElementsByClassName!==j&&p?t.getElementsByClassName(e):undefined},d=[],h=[],(b.qsa=it(t.querySelectorAll))&&(at(function(e){e.innerHTML="<select><option selected=''></option></select>",e.querySelectorAll("[selected]").length||h.push("\\["+R+"*(?:value|"+P+")"),e.querySelectorAll(":checked").length||h.push(":checked")}),at(function(e){var t=c.createElement("input");t.setAttribute("type","hidden"),e.appendChild(t).setAttribute("t",""),e.querySelectorAll("[t^='']").length&&h.push("[*^$]="+R+"*(?:''|\"\")"),e.querySelectorAll(":enabled").length||h.push(":enabled",":disabled"),e.querySelectorAll("*,:x"),h.push(",.*:")})),(b.matchesSelector=it(g=f.webkitMatchesSelector||f.mozMatchesSelector||f.oMatchesSelector||f.msMatchesSelector))&&at(function(e){b.disconnectedMatch=g.call(e,"div"),g.call(e,"[s!='']:x"),d.push("!=",B)}),h=h.length&&RegExp(h.join("|")),d=d.length&&RegExp(d.join("|")),m=it(f.contains)||f.compareDocumentPosition?function(e,t){var n=9===e.nodeType?e.documentElement:e,r=t&&t.parentNode;return e===r||!(!r||1!==r.nodeType||!(n.contains?n.contains(r):e.compareDocumentPosition&&16&e.compareDocumentPosition(r)))}:function(e,t){if(t)while(t=t.parentNode)if(t===e)return!0;return!1},S=f.compareDocumentPosition?function(e,n){if(e===n)return E=!0,0;var r=n.compareDocumentPosition&&e.compareDocumentPosition&&e.compareDocumentPosition(n);return r?1&r||!b.sortDetached&&n.compareDocumentPosition(e)===r?e===t||m(v,e)?-1:n===t||m(v,n)?1:u?F.call(u,e)-F.call(u,n):0:4&r?-1:1:e.compareDocumentPosition?-1:1}:function(e,n){var r,i=0,o=e.parentNode,s=n.parentNode,a=[e],l=[n];if(e===n)return E=!0,0;if(!o||!s)return e===t?-1:n===t?1:o?-1:s?1:u?F.call(u,e)-F.call(u,n):0;if(o===s)return lt(e,n);r=e;while(r=r.parentNode)a.unshift(r);r=n;while(r=r.parentNode)l.unshift(r);while(a[i]===l[i])i++;return i?lt(a[i],l[i]):a[i]===v?-1:l[i]===v?1:0},c):c},ut.matches=function(e,t){return ut(e,null,null,t)},ut.matchesSelector=function(e,t){if((e.ownerDocument||e)!==c&&l(e),t=t.replace(U,"='$1']"),!(!b.matchesSelector||!p||d&&d.test(t)||h&&h.test(t)))try{var n=g.call(e,t);if(n||b.disconnectedMatch||e.document&&11!==e.document.nodeType)return n}catch(r){}return ut(t,c,null,[e]).length>0},ut.contains=function(e,t){return(e.ownerDocument||e)!==c&&l(e),m(e,t)},ut.attr=function(e,t){(e.ownerDocument||e)!==c&&l(e);var n=r.attrHandle[t.toLowerCase()],i=n&&n(e,t,!p);return i===undefined?b.attributes||!p?e.getAttribute(t):(i=e.getAttributeNode(t))&&i.specified?i.value:null:i},ut.error=function(e){throw Error("Syntax error, unrecognized expression: "+e)},ut.uniqueSort=function(e){var t,n=[],r=0,i=0;if(E=!b.detectDuplicates,u=!b.sortStable&&e.slice(0),e.sort(S),E){while(t=e[i++])t===e[i]&&(r=n.push(i));while(r--)e.splice(n[r],1)}return e};function lt(e,t){var n=t&&e,r=n&&(~t.sourceIndex||D)-(~e.sourceIndex||D);if(r)return r;if(n)while(n=n.nextSibling)if(n===t)return-1;return e?1:-1}function ct(e,t,n){var r;return n?undefined:(r=e.getAttributeNode(t))&&r.specified?r.value:e[t]===!0?t.toLowerCase():null}function ft(e,t,n){var r;return n?undefined:r=e.getAttribute(t,"type"===t.toLowerCase()?1:2)}function pt(e){return function(t){var n=t.nodeName.toLowerCase();return"input"===n&&t.type===e}}function ht(e){return function(t){var n=t.nodeName.toLowerCase();return("input"===n||"button"===n)&&t.type===e}}function dt(e){return st(function(t){return t=+t,st(function(n,r){var i,o=e([],n.length,t),s=o.length;while(s--)n[i=o[s]]&&(n[i]=!(r[i]=n[i]))})})}i=ut.getText=function(e){var t,n="",r=0,o=e.nodeType;if(o){if(1===o||9===o||11===o){if("string"==typeof e.textContent)return e.textContent;for(e=e.firstChild;e;e=e.nextSibling)n+=i(e)}else if(3===o||4===o)return e.nodeValue}else for(;t=e[r];r++)n+=i(t);return n},r=ut.selectors={cacheLength:50,createPseudo:st,match:G,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(e){return e[1]=e[1].replace(tt,nt),e[3]=(e[4]||e[5]||"").replace(tt,nt),"~="===e[2]&&(e[3]=" "+e[3]+" "),e.slice(0,4)},CHILD:function(e){return e[1]=e[1].toLowerCase(),"nth"===e[1].slice(0,3)?(e[3]||ut.error(e[0]),e[4]=+(e[4]?e[5]+(e[6]||1):2*("even"===e[3]||"odd"===e[3])),e[5]=+(e[7]+e[8]||"odd"===e[3])):e[3]&&ut.error(e[0]),e},PSEUDO:function(e){var t,n=!e[5]&&e[2];return G.CHILD.test(e[0])?null:(e[4]?e[2]=e[4]:n&&Y.test(n)&&(t=gt(n,!0))&&(t=n.indexOf(")",n.length-t)-n.length)&&(e[0]=e[0].slice(0,t),e[2]=n.slice(0,t)),e.slice(0,3))}},filter:{TAG:function(e){var t=e.replace(tt,nt).toLowerCase();return"*"===e?function(){return!0}:function(e){return e.nodeName&&e.nodeName.toLowerCase()===t}},CLASS:function(e){var t=C[e+" "];return t||(t=RegExp("(^|"+R+")"+e+"("+R+"|$)"))&&C(e,function(e){return t.test("string"==typeof e.className&&e.className||typeof e.getAttribute!==j&&e.getAttribute("class")||"")})},ATTR:function(e,t,n){return function(r){var i=ut.attr(r,e);return null==i?"!="===t:t?(i+="","="===t?i===n:"!="===t?i!==n:"^="===t?n&&0===i.indexOf(n):"*="===t?n&&i.indexOf(n)>-1:"$="===t?n&&i.slice(-n.length)===n:"~="===t?(" "+i+" ").indexOf(n)>-1:"|="===t?i===n||i.slice(0,n.length+1)===n+"-":!1):!0}},CHILD:function(e,t,n,r,i){var o="nth"!==e.slice(0,3),s="last"!==e.slice(-4),a="of-type"===t;return 1===r&&0===i?function(e){return!!e.parentNode}:function(t,n,u){var l,c,f,p,h,d,g=o!==s?"nextSibling":"previousSibling",m=t.parentNode,v=a&&t.nodeName.toLowerCase(),x=!u&&!a;if(m){if(o){while(g){f=t;while(f=f[g])if(a?f.nodeName.toLowerCase()===v:1===f.nodeType)return!1;d=g="only"===e&&!d&&"nextSibling"}return!0}if(d=[s?m.firstChild:m.lastChild],s&&x){c=m[y]||(m[y]={}),l=c[e]||[],h=l[0]===w&&l[1],p=l[0]===w&&l[2],f=h&&m.childNodes[h];while(f=++h&&f&&f[g]||(p=h=0)||d.pop())if(1===f.nodeType&&++p&&f===t){c[e]=[w,h,p];break}}else if(x&&(l=(t[y]||(t[y]={}))[e])&&l[0]===w)p=l[1];else while(f=++h&&f&&f[g]||(p=h=0)||d.pop())if((a?f.nodeName.toLowerCase()===v:1===f.nodeType)&&++p&&(x&&((f[y]||(f[y]={}))[e]=[w,p]),f===t))break;return p-=i,p===r||0===p%r&&p/r>=0}}},PSEUDO:function(e,t){var n,i=r.pseudos[e]||r.setFilters[e.toLowerCase()]||ut.error("unsupported pseudo: "+e);return i[y]?i(t):i.length>1?(n=[e,e,"",t],r.setFilters.hasOwnProperty(e.toLowerCase())?st(function(e,n){var r,o=i(e,t),s=o.length;while(s--)r=F.call(e,o[s]),e[r]=!(n[r]=o[s])}):function(e){return i(e,0,n)}):i}},pseudos:{not:st(function(e){var t=[],n=[],r=s(e.replace(I,"$1"));return r[y]?st(function(e,t,n,i){var o,s=r(e,null,i,[]),a=e.length;while(a--)(o=s[a])&&(e[a]=!(t[a]=o))}):function(e,i,o){return t[0]=e,r(t,null,o,n),!n.pop()}}),has:st(function(e){return function(t){return ut(e,t).length>0}}),contains:st(function(e){return function(t){return(t.textContent||t.innerText||i(t)).indexOf(e)>-1}}),lang:st(function(e){return V.test(e||"")||ut.error("unsupported lang: "+e),e=e.replace(tt,nt).toLowerCase(),function(t){var n;do if(n=p?t.lang:t.getAttribute("xml:lang")||t.getAttribute("lang"))return n=n.toLowerCase(),n===e||0===n.indexOf(e+"-");while((t=t.parentNode)&&1===t.nodeType);return!1}}),target:function(t){var n=e.location&&e.location.hash;return n&&n.slice(1)===t.id},root:function(e){return e===f},focus:function(e){return e===c.activeElement&&(!c.hasFocus||c.hasFocus())&&!!(e.type||e.href||~e.tabIndex)},enabled:function(e){return e.disabled===!1},disabled:function(e){return e.disabled===!0},checked:function(e){var t=e.nodeName.toLowerCase();return"input"===t&&!!e.checked||"option"===t&&!!e.selected},selected:function(e){return e.parentNode&&e.parentNode.selectedIndex,e.selected===!0},empty:function(e){for(e=e.firstChild;e;e=e.nextSibling)if(e.nodeName>"@"||3===e.nodeType||4===e.nodeType)return!1;return!0},parent:function(e){return!r.pseudos.empty(e)},header:function(e){return Z.test(e.nodeName)},input:function(e){return K.test(e.nodeName)},button:function(e){var t=e.nodeName.toLowerCase();return"input"===t&&"button"===e.type||"button"===t},text:function(e){var t;return"input"===e.nodeName.toLowerCase()&&"text"===e.type&&(null==(t=e.getAttribute("type"))||t.toLowerCase()===e.type)},first:dt(function(){return[0]}),last:dt(function(e,t){return[t-1]}),eq:dt(function(e,t,n){return[0>n?n+t:n]}),even:dt(function(e,t){var n=0;for(;t>n;n+=2)e.push(n);return e}),odd:dt(function(e,t){var n=1;for(;t>n;n+=2)e.push(n);return e}),lt:dt(function(e,t,n){var r=0>n?n+t:n;for(;--r>=0;)e.push(r);return e}),gt:dt(function(e,t,n){var r=0>n?n+t:n;for(;t>++r;)e.push(r);return e})}};for(t in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})r.pseudos[t]=pt(t);for(t in{submit:!0,reset:!0})r.pseudos[t]=ht(t);function gt(e,t){var n,i,o,s,a,u,l,c=k[e+" "];if(c)return t?0:c.slice(0);a=e,u=[],l=r.preFilter;while(a){(!n||(i=z.exec(a)))&&(i&&(a=a.slice(i[0].length)||a),u.push(o=[])),n=!1,(i=_.exec(a))&&(n=i.shift(),o.push({value:n,type:i[0].replace(I," ")}),a=a.slice(n.length));for(s in r.filter)!(i=G[s].exec(a))||l[s]&&!(i=l[s](i))||(n=i.shift(),o.push({value:n,type:s,matches:i}),a=a.slice(n.length));if(!n)break}return t?a.length:a?ut.error(e):k(e,u).slice(0)}function mt(e){var t=0,n=e.length,r="";for(;n>t;t++)r+=e[t].value;return r}function yt(e,t,r){var i=t.dir,o=r&&"parentNode"===i,s=T++;return t.first?function(t,n,r){while(t=t[i])if(1===t.nodeType||o)return e(t,n,r)}:function(t,r,a){var u,l,c,f=w+" "+s;if(a){while(t=t[i])if((1===t.nodeType||o)&&e(t,r,a))return!0}else while(t=t[i])if(1===t.nodeType||o)if(c=t[y]||(t[y]={}),(l=c[i])&&l[0]===f){if((u=l[1])===!0||u===n)return u===!0}else if(l=c[i]=[f],l[1]=e(t,r,a)||n,l[1]===!0)return!0}}function vt(e){return e.length>1?function(t,n,r){var i=e.length;while(i--)if(!e[i](t,n,r))return!1;return!0}:e[0]}function xt(e,t,n,r,i){var o,s=[],a=0,u=e.length,l=null!=t;for(;u>a;a++)(o=e[a])&&(!n||n(o,r,i))&&(s.push(o),l&&t.push(a));return s}function bt(e,t,n,r,i,o){return r&&!r[y]&&(r=bt(r)),i&&!i[y]&&(i=bt(i,o)),st(function(o,s,a,u){var l,c,f,p=[],h=[],d=s.length,g=o||Ct(t||"*",a.nodeType?[a]:a,[]),m=!e||!o&&t?g:xt(g,p,e,a,u),y=n?i||(o?e:d||r)?[]:s:m;if(n&&n(m,y,a,u),r){l=xt(y,h),r(l,[],a,u),c=l.length;while(c--)(f=l[c])&&(y[h[c]]=!(m[h[c]]=f))}if(o){if(i||e){if(i){l=[],c=y.length;while(c--)(f=y[c])&&l.push(m[c]=f);i(null,y=[],l,u)}c=y.length;while(c--)(f=y[c])&&(l=i?F.call(o,f):p[c])>-1&&(o[l]=!(s[l]=f))}}else y=xt(y===s?y.splice(d,y.length):y),i?i(null,s,y,u):H.apply(s,y)})}function wt(e){var t,n,i,o=e.length,s=r.relative[e[0].type],u=s||r.relative[" "],l=s?1:0,c=yt(function(e){return e===t},u,!0),f=yt(function(e){return F.call(t,e)>-1},u,!0),p=[function(e,n,r){return!s&&(r||n!==a)||((t=n).nodeType?c(e,n,r):f(e,n,r))}];for(;o>l;l++)if(n=r.relative[e[l].type])p=[yt(vt(p),n)];else{if(n=r.filter[e[l].type].apply(null,e[l].matches),n[y]){for(i=++l;o>i;i++)if(r.relative[e[i].type])break;return bt(l>1&&vt(p),l>1&&mt(e.slice(0,l-1)).replace(I,"$1"),n,i>l&&wt(e.slice(l,i)),o>i&&wt(e=e.slice(i)),o>i&&mt(e))}p.push(n)}return vt(p)}function Tt(e,t){var i=0,o=t.length>0,s=e.length>0,u=function(u,l,f,p,h){var d,g,m,y=[],v=0,x="0",b=u&&[],T=null!=h,C=a,k=u||s&&r.find.TAG("*",h&&l.parentNode||l),N=w+=null==C?1:Math.random()||.1;for(T&&(a=l!==c&&l,n=i);null!=(d=k[x]);x++){if(s&&d){g=0;while(m=e[g++])if(m(d,l,f)){p.push(d);break}T&&(w=N,n=++i)}o&&((d=!m&&d)&&v--,u&&b.push(d))}if(v+=x,o&&x!==v){g=0;while(m=t[g++])m(b,y,l,f);if(u){if(v>0)while(x--)b[x]||y[x]||(y[x]=L.call(p));y=xt(y)}H.apply(p,y),T&&!u&&y.length>0&&v+t.length>1&&ut.uniqueSort(p)}return T&&(w=N,a=C),b};return o?st(u):u}s=ut.compile=function(e,t){var n,r=[],i=[],o=N[e+" "];if(!o){t||(t=gt(e)),n=t.length;while(n--)o=wt(t[n]),o[y]?r.push(o):i.push(o);o=N(e,Tt(i,r))}return o};function Ct(e,t,n){var r=0,i=t.length;for(;i>r;r++)ut(e,t[r],n);return n}function kt(e,t,n,i){var o,a,u,l,c,f=gt(e);if(!i&&1===f.length){if(a=f[0]=f[0].slice(0),a.length>2&&"ID"===(u=a[0]).type&&9===t.nodeType&&p&&r.relative[a[1].type]){if(t=(r.find.ID(u.matches[0].replace(tt,nt),t)||[])[0],!t)return n;e=e.slice(a.shift().value.length)}o=G.needsContext.test(e)?0:a.length;while(o--){if(u=a[o],r.relative[l=u.type])break;if((c=r.find[l])&&(i=c(u.matches[0].replace(tt,nt),X.test(a[0].type)&&t.parentNode||t))){if(a.splice(o,1),e=i.length&&mt(a),!e)return H.apply(n,i),n;break}}}return s(e,f)(i,t,!p,n,X.test(e)),n}r.pseudos.nth=r.pseudos.eq;function Nt(){}Nt.prototype=r.filters=r.pseudos,r.setFilters=new Nt,b.sortStable=y.split("").sort(S).join("")===y,l(),[0,0].sort(S),b.detectDuplicates=E,at(function(e){if(e.innerHTML="<a href='#'></a>","#"!==e.firstChild.getAttribute("href")){var t="type|href|height|width".split("|"),n=t.length;while(n--)r.attrHandle[t[n]]=ft}}),at(function(e){if(null!=e.getAttribute("disabled")){var t=P.split("|"),n=t.length;while(n--)r.attrHandle[t[n]]=ct}}),x.find=ut,x.expr=ut.selectors,x.expr[":"]=x.expr.pseudos,x.unique=ut.uniqueSort,x.text=ut.getText,x.isXMLDoc=ut.isXML,x.contains=ut.contains}(e);var D={};function A(e){var t=D[e]={};return x.each(e.match(w)||[],function(e,n){t[n]=!0}),t}x.Callbacks=function(e){e="string"==typeof e?D[e]||A(e):x.extend({},e);var t,n,r,i,o,s,a=[],u=!e.once&&[],l=function(f){for(t=e.memory&&f,n=!0,s=i||0,i=0,o=a.length,r=!0;a&&o>s;s++)if(a[s].apply(f[0],f[1])===!1&&e.stopOnFalse){t=!1;break}r=!1,a&&(u?u.length&&l(u.shift()):t?a=[]:c.disable())},c={add:function(){if(a){var n=a.length;(function s(t){x.each(t,function(t,n){var r=x.type(n);"function"===r?e.unique&&c.has(n)||a.push(n):n&&n.length&&"string"!==r&&s(n)})})(arguments),r?o=a.length:t&&(i=n,l(t))}return this},remove:function(){return a&&x.each(arguments,function(e,t){var n;while((n=x.inArray(t,a,n))>-1)a.splice(n,1),r&&(o>=n&&o--,s>=n&&s--)}),this},has:function(e){return e?x.inArray(e,a)>-1:!(!a||!a.length)},empty:function(){return a=[],o=0,this},disable:function(){return a=u=t=undefined,this},disabled:function(){return!a},lock:function(){return u=undefined,t||c.disable(),this},locked:function(){return!u},fireWith:function(e,t){return t=t||[],t=[e,t.slice?t.slice():t],!a||n&&!u||(r?u.push(t):l(t)),this},fire:function(){return c.fireWith(this,arguments),this},fired:function(){return!!n}};return c},x.extend({Deferred:function(e){var t=[["resolve","done",x.Callbacks("once memory"),"resolved"],["reject","fail",x.Callbacks("once memory"),"rejected"],["notify","progress",x.Callbacks("memory")]],n="pending",r={state:function(){return n},always:function(){return i.done(arguments).fail(arguments),this},then:function(){var e=arguments;return x.Deferred(function(n){x.each(t,function(t,o){var s=o[0],a=x.isFunction(e[t])&&e[t];i[o[1]](function(){var e=a&&a.apply(this,arguments);e&&x.isFunction(e.promise)?e.promise().done(n.resolve).fail(n.reject).progress(n.notify):n[s+"With"](this===r?n.promise():this,a?[e]:arguments)})}),e=null}).promise()},promise:function(e){return null!=e?x.extend(e,r):r}},i={};return r.pipe=r.then,x.each(t,function(e,o){var s=o[2],a=o[3];r[o[1]]=s.add,a&&s.add(function(){n=a},t[1^e][2].disable,t[2][2].lock),i[o[0]]=function(){return i[o[0]+"With"](this===i?r:this,arguments),this},i[o[0]+"With"]=s.fireWith}),r.promise(i),e&&e.call(i,i),i},when:function(e){var t=0,n=d.call(arguments),r=n.length,i=1!==r||e&&x.isFunction(e.promise)?r:0,o=1===i?e:x.Deferred(),s=function(e,t,n){return function(r){t[e]=this,n[e]=arguments.length>1?d.call(arguments):r,n===a?o.notifyWith(t,n):--i||o.resolveWith(t,n)}},a,u,l;if(r>1)for(a=Array(r),u=Array(r),l=Array(r);r>t;t++)n[t]&&x.isFunction(n[t].promise)?n[t].promise().done(s(t,l,n)).fail(o.reject).progress(s(t,u,a)):--i;return i||o.resolveWith(l,n),o.promise()}}),x.support=function(t){var n=o.createElement("input"),r=o.createDocumentFragment(),i=o.createElement("div"),s=o.createElement("select"),a=s.appendChild(o.createElement("option"));return n.type?(n.type="checkbox",t.checkOn=""!==n.value,t.optSelected=a.selected,t.reliableMarginRight=!0,t.boxSizingReliable=!0,t.pixelPosition=!1,n.checked=!0,t.noCloneChecked=n.cloneNode(!0).checked,s.disabled=!0,t.optDisabled=!a.disabled,n=o.createElement("input"),n.value="t",n.type="radio",t.radioValue="t"===n.value,n.setAttribute("checked","t"),n.setAttribute("name","t"),r.appendChild(n),t.checkClone=r.cloneNode(!0).cloneNode(!0).lastChild.checked,t.focusinBubbles="onfocusin"in e,i.style.backgroundClip="content-box",i.cloneNode(!0).style.backgroundClip="",t.clearCloneStyle="content-box"===i.style.backgroundClip,x(function(){var n,r,s="padding:0;margin:0;border:0;display:block;-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box",a=o.getElementsByTagName("body")[0];a&&(n=o.createElement("div"),n.style.cssText="border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px",a.appendChild(n).appendChild(i),i.innerHTML="",i.style.cssText="-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%",x.swap(a,null!=a.style.zoom?{zoom:1}:{},function(){t.boxSizing=4===i.offsetWidth}),e.getComputedStyle&&(t.pixelPosition="1%"!==(e.getComputedStyle(i,null)||{}).top,t.boxSizingReliable="4px"===(e.getComputedStyle(i,null)||{width:"4px"}).width,r=i.appendChild(o.createElement("div")),r.style.cssText=i.style.cssText=s,r.style.marginRight=r.style.width="0",i.style.width="1px",t.reliableMarginRight=!parseFloat((e.getComputedStyle(r,null)||{}).marginRight)),a.removeChild(n))}),t):t}({});var L,q,H=/(?:\{[\s\S]*\}|\[[\s\S]*\])$/,O=/([A-Z])/g;function F(){Object.defineProperty(this.cache={},0,{get:function(){return{}}}),this.expando=x.expando+Math.random()}F.uid=1,F.accepts=function(e){return e.nodeType?1===e.nodeType||9===e.nodeType:!0},F.prototype={key:function(e){if(!F.accepts(e))return 0;var t={},n=e[this.expando];if(!n){n=F.uid++;try{t[this.expando]={value:n},Object.defineProperties(e,t)}catch(r){t[this.expando]=n,x.extend(e,t)}}return this.cache[n]||(this.cache[n]={}),n},set:function(e,t,n){var r,i=this.key(e),o=this.cache[i];if("string"==typeof t)o[t]=n;else if(x.isEmptyObject(o))this.cache[i]=t;else for(r in t)o[r]=t[r]},get:function(e,t){var n=this.cache[this.key(e)];return t===undefined?n:n[t]},access:function(e,t,n){return t===undefined||t&&"string"==typeof t&&n===undefined?this.get(e,t):(this.set(e,t,n),n!==undefined?n:t)},remove:function(e,t){var n,r,i=this.key(e),o=this.cache[i];if(t===undefined)this.cache[i]={};else{x.isArray(t)?r=t.concat(t.map(x.camelCase)):t in o?r=[t]:(r=x.camelCase(t),r=r in o?[r]:r.match(w)||[]),n=r.length;while(n--)delete o[r[n]]}},hasData:function(e){return!x.isEmptyObject(this.cache[e[this.expando]]||{})},discard:function(e){delete this.cache[this.key(e)]}},L=new F,q=new F,x.extend({acceptData:F.accepts,hasData:function(e){return L.hasData(e)||q.hasData(e)},data:function(e,t,n){return L.access(e,t,n)},removeData:function(e,t){L.remove(e,t)},_data:function(e,t,n){return q.access(e,t,n)},_removeData:function(e,t){q.remove(e,t)}}),x.fn.extend({data:function(e,t){var n,r,i=this[0],o=0,s=null;if(e===undefined){if(this.length&&(s=L.get(i),1===i.nodeType&&!q.get(i,"hasDataAttrs"))){for(n=i.attributes;n.length>o;o++)r=n[o].name,0===r.indexOf("data-")&&(r=x.camelCase(r.substring(5)),P(i,r,s[r]));q.set(i,"hasDataAttrs",!0)}return s}return"object"==typeof e?this.each(function(){L.set(this,e)}):x.access(this,function(t){var n,r=x.camelCase(e);if(i&&t===undefined){if(n=L.get(i,e),n!==undefined)return n;if(n=L.get(i,r),n!==undefined)return n;if(n=P(i,r,undefined),n!==undefined)return n}else this.each(function(){var n=L.get(this,r);L.set(this,r,t),-1!==e.indexOf("-")&&n!==undefined&&L.set(this,e,t)})},null,t,arguments.length>1,null,!0)},removeData:function(e){return this.each(function(){L.remove(this,e)})}});function P(e,t,n){var r;if(n===undefined&&1===e.nodeType)if(r="data-"+t.replace(O,"-$1").toLowerCase(),n=e.getAttribute(r),"string"==typeof n){try{n="true"===n?!0:"false"===n?!1:"null"===n?null:+n+""===n?+n:H.test(n)?JSON.parse(n):n}catch(i){}L.set(e,t,n)}else n=undefined;return n}x.extend({queue:function(e,t,n){var r;return e?(t=(t||"fx")+"queue",r=q.get(e,t),n&&(!r||x.isArray(n)?r=q.access(e,t,x.makeArray(n)):r.push(n)),r||[]):undefined},dequeue:function(e,t){t=t||"fx";var n=x.queue(e,t),r=n.length,i=n.shift(),o=x._queueHooks(e,t),s=function(){x.dequeue(e,t)};"inprogress"===i&&(i=n.shift(),r--),o.cur=i,i&&("fx"===t&&n.unshift("inprogress"),delete o.stop,i.call(e,s,o)),!r&&o&&o.empty.fire()},_queueHooks:function(e,t){var n=t+"queueHooks";return q.get(e,n)||q.access(e,n,{empty:x.Callbacks("once memory").add(function(){q.remove(e,[t+"queue",n])})})}}),x.fn.extend({queue:function(e,t){var n=2;return"string"!=typeof e&&(t=e,e="fx",n--),n>arguments.length?x.queue(this[0],e):t===undefined?this:this.each(function(){var n=x.queue(this,e,t);
x._queueHooks(this,e),"fx"===e&&"inprogress"!==n[0]&&x.dequeue(this,e)})},dequeue:function(e){return this.each(function(){x.dequeue(this,e)})},delay:function(e,t){return e=x.fx?x.fx.speeds[e]||e:e,t=t||"fx",this.queue(t,function(t,n){var r=setTimeout(t,e);n.stop=function(){clearTimeout(r)}})},clearQueue:function(e){return this.queue(e||"fx",[])},promise:function(e,t){var n,r=1,i=x.Deferred(),o=this,s=this.length,a=function(){--r||i.resolveWith(o,[o])};"string"!=typeof e&&(t=e,e=undefined),e=e||"fx";while(s--)n=q.get(o[s],e+"queueHooks"),n&&n.empty&&(r++,n.empty.add(a));return a(),i.promise(t)}});var R,M,W=/[\t\r\n]/g,$=/\r/g,B=/^(?:input|select|textarea|button)$/i;x.fn.extend({attr:function(e,t){return x.access(this,x.attr,e,t,arguments.length>1)},removeAttr:function(e){return this.each(function(){x.removeAttr(this,e)})},prop:function(e,t){return x.access(this,x.prop,e,t,arguments.length>1)},removeProp:function(e){return this.each(function(){delete this[x.propFix[e]||e]})},addClass:function(e){var t,n,r,i,o,s=0,a=this.length,u="string"==typeof e&&e;if(x.isFunction(e))return this.each(function(t){x(this).addClass(e.call(this,t,this.className))});if(u)for(t=(e||"").match(w)||[];a>s;s++)if(n=this[s],r=1===n.nodeType&&(n.className?(" "+n.className+" ").replace(W," "):" ")){o=0;while(i=t[o++])0>r.indexOf(" "+i+" ")&&(r+=i+" ");n.className=x.trim(r)}return this},removeClass:function(e){var t,n,r,i,o,s=0,a=this.length,u=0===arguments.length||"string"==typeof e&&e;if(x.isFunction(e))return this.each(function(t){x(this).removeClass(e.call(this,t,this.className))});if(u)for(t=(e||"").match(w)||[];a>s;s++)if(n=this[s],r=1===n.nodeType&&(n.className?(" "+n.className+" ").replace(W," "):"")){o=0;while(i=t[o++])while(r.indexOf(" "+i+" ")>=0)r=r.replace(" "+i+" "," ");n.className=e?x.trim(r):""}return this},toggleClass:function(e,t){var n=typeof e,i="boolean"==typeof t;return x.isFunction(e)?this.each(function(n){x(this).toggleClass(e.call(this,n,this.className,t),t)}):this.each(function(){if("string"===n){var o,s=0,a=x(this),u=t,l=e.match(w)||[];while(o=l[s++])u=i?u:!a.hasClass(o),a[u?"addClass":"removeClass"](o)}else(n===r||"boolean"===n)&&(this.className&&q.set(this,"__className__",this.className),this.className=this.className||e===!1?"":q.get(this,"__className__")||"")})},hasClass:function(e){var t=" "+e+" ",n=0,r=this.length;for(;r>n;n++)if(1===this[n].nodeType&&(" "+this[n].className+" ").replace(W," ").indexOf(t)>=0)return!0;return!1},val:function(e){var t,n,r,i=this[0];{if(arguments.length)return r=x.isFunction(e),this.each(function(n){var i,o=x(this);1===this.nodeType&&(i=r?e.call(this,n,o.val()):e,null==i?i="":"number"==typeof i?i+="":x.isArray(i)&&(i=x.map(i,function(e){return null==e?"":e+""})),t=x.valHooks[this.type]||x.valHooks[this.nodeName.toLowerCase()],t&&"set"in t&&t.set(this,i,"value")!==undefined||(this.value=i))});if(i)return t=x.valHooks[i.type]||x.valHooks[i.nodeName.toLowerCase()],t&&"get"in t&&(n=t.get(i,"value"))!==undefined?n:(n=i.value,"string"==typeof n?n.replace($,""):null==n?"":n)}}}),x.extend({valHooks:{option:{get:function(e){var t=e.attributes.value;return!t||t.specified?e.value:e.text}},select:{get:function(e){var t,n,r=e.options,i=e.selectedIndex,o="select-one"===e.type||0>i,s=o?null:[],a=o?i+1:r.length,u=0>i?a:o?i:0;for(;a>u;u++)if(n=r[u],!(!n.selected&&u!==i||(x.support.optDisabled?n.disabled:null!==n.getAttribute("disabled"))||n.parentNode.disabled&&x.nodeName(n.parentNode,"optgroup"))){if(t=x(n).val(),o)return t;s.push(t)}return s},set:function(e,t){var n,r,i=e.options,o=x.makeArray(t),s=i.length;while(s--)r=i[s],(r.selected=x.inArray(x(r).val(),o)>=0)&&(n=!0);return n||(e.selectedIndex=-1),o}}},attr:function(e,t,n){var i,o,s=e.nodeType;if(e&&3!==s&&8!==s&&2!==s)return typeof e.getAttribute===r?x.prop(e,t,n):(1===s&&x.isXMLDoc(e)||(t=t.toLowerCase(),i=x.attrHooks[t]||(x.expr.match.boolean.test(t)?M:R)),n===undefined?i&&"get"in i&&null!==(o=i.get(e,t))?o:(o=x.find.attr(e,t),null==o?undefined:o):null!==n?i&&"set"in i&&(o=i.set(e,n,t))!==undefined?o:(e.setAttribute(t,n+""),n):(x.removeAttr(e,t),undefined))},removeAttr:function(e,t){var n,r,i=0,o=t&&t.match(w);if(o&&1===e.nodeType)while(n=o[i++])r=x.propFix[n]||n,x.expr.match.boolean.test(n)&&(e[r]=!1),e.removeAttribute(n)},attrHooks:{type:{set:function(e,t){if(!x.support.radioValue&&"radio"===t&&x.nodeName(e,"input")){var n=e.value;return e.setAttribute("type",t),n&&(e.value=n),t}}}},propFix:{"for":"htmlFor","class":"className"},prop:function(e,t,n){var r,i,o,s=e.nodeType;if(e&&3!==s&&8!==s&&2!==s)return o=1!==s||!x.isXMLDoc(e),o&&(t=x.propFix[t]||t,i=x.propHooks[t]),n!==undefined?i&&"set"in i&&(r=i.set(e,n,t))!==undefined?r:e[t]=n:i&&"get"in i&&null!==(r=i.get(e,t))?r:e[t]},propHooks:{tabIndex:{get:function(e){return e.hasAttribute("tabindex")||B.test(e.nodeName)||e.href?e.tabIndex:-1}}}}),M={set:function(e,t,n){return t===!1?x.removeAttr(e,n):e.setAttribute(n,n),n}},x.each(x.expr.match.boolean.source.match(/\w+/g),function(e,t){var n=x.expr.attrHandle[t]||x.find.attr;x.expr.attrHandle[t]=function(e,t,r){var i=x.expr.attrHandle[t],o=r?undefined:(x.expr.attrHandle[t]=undefined)!=n(e,t,r)?t.toLowerCase():null;return x.expr.attrHandle[t]=i,o}}),x.support.optSelected||(x.propHooks.selected={get:function(e){var t=e.parentNode;return t&&t.parentNode&&t.parentNode.selectedIndex,null}}),x.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){x.propFix[this.toLowerCase()]=this}),x.each(["radio","checkbox"],function(){x.valHooks[this]={set:function(e,t){return x.isArray(t)?e.checked=x.inArray(x(e).val(),t)>=0:undefined}},x.support.checkOn||(x.valHooks[this].get=function(e){return null===e.getAttribute("value")?"on":e.value})});var I=/^key/,z=/^(?:mouse|contextmenu)|click/,_=/^(?:focusinfocus|focusoutblur)$/,X=/^([^.]*)(?:\.(.+)|)$/;function U(){return!0}function Y(){return!1}function V(){try{return o.activeElement}catch(e){}}x.event={global:{},add:function(e,t,n,i,o){var s,a,u,l,c,f,p,h,d,g,m,y=q.get(e);if(y){n.handler&&(s=n,n=s.handler,o=s.selector),n.guid||(n.guid=x.guid++),(l=y.events)||(l=y.events={}),(a=y.handle)||(a=y.handle=function(e){return typeof x===r||e&&x.event.triggered===e.type?undefined:x.event.dispatch.apply(a.elem,arguments)},a.elem=e),t=(t||"").match(w)||[""],c=t.length;while(c--)u=X.exec(t[c])||[],d=m=u[1],g=(u[2]||"").split(".").sort(),d&&(p=x.event.special[d]||{},d=(o?p.delegateType:p.bindType)||d,p=x.event.special[d]||{},f=x.extend({type:d,origType:m,data:i,handler:n,guid:n.guid,selector:o,needsContext:o&&x.expr.match.needsContext.test(o),namespace:g.join(".")},s),(h=l[d])||(h=l[d]=[],h.delegateCount=0,p.setup&&p.setup.call(e,i,g,a)!==!1||e.addEventListener&&e.addEventListener(d,a,!1)),p.add&&(p.add.call(e,f),f.handler.guid||(f.handler.guid=n.guid)),o?h.splice(h.delegateCount++,0,f):h.push(f),x.event.global[d]=!0);e=null}},remove:function(e,t,n,r,i){var o,s,a,u,l,c,f,p,h,d,g,m=q.hasData(e)&&q.get(e);if(m&&(u=m.events)){t=(t||"").match(w)||[""],l=t.length;while(l--)if(a=X.exec(t[l])||[],h=g=a[1],d=(a[2]||"").split(".").sort(),h){f=x.event.special[h]||{},h=(r?f.delegateType:f.bindType)||h,p=u[h]||[],a=a[2]&&RegExp("(^|\\.)"+d.join("\\.(?:.*\\.|)")+"(\\.|$)"),s=o=p.length;while(o--)c=p[o],!i&&g!==c.origType||n&&n.guid!==c.guid||a&&!a.test(c.namespace)||r&&r!==c.selector&&("**"!==r||!c.selector)||(p.splice(o,1),c.selector&&p.delegateCount--,f.remove&&f.remove.call(e,c));s&&!p.length&&(f.teardown&&f.teardown.call(e,d,m.handle)!==!1||x.removeEvent(e,h,m.handle),delete u[h])}else for(h in u)x.event.remove(e,h+t[l],n,r,!0);x.isEmptyObject(u)&&(delete m.handle,q.remove(e,"events"))}},trigger:function(t,n,r,i){var s,a,u,l,c,f,p,h=[r||o],d=y.call(t,"type")?t.type:t,g=y.call(t,"namespace")?t.namespace.split("."):[];if(a=u=r=r||o,3!==r.nodeType&&8!==r.nodeType&&!_.test(d+x.event.triggered)&&(d.indexOf(".")>=0&&(g=d.split("."),d=g.shift(),g.sort()),c=0>d.indexOf(":")&&"on"+d,t=t[x.expando]?t:new x.Event(d,"object"==typeof t&&t),t.isTrigger=i?2:3,t.namespace=g.join("."),t.namespace_re=t.namespace?RegExp("(^|\\.)"+g.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,t.result=undefined,t.target||(t.target=r),n=null==n?[t]:x.makeArray(n,[t]),p=x.event.special[d]||{},i||!p.trigger||p.trigger.apply(r,n)!==!1)){if(!i&&!p.noBubble&&!x.isWindow(r)){for(l=p.delegateType||d,_.test(l+d)||(a=a.parentNode);a;a=a.parentNode)h.push(a),u=a;u===(r.ownerDocument||o)&&h.push(u.defaultView||u.parentWindow||e)}s=0;while((a=h[s++])&&!t.isPropagationStopped())t.type=s>1?l:p.bindType||d,f=(q.get(a,"events")||{})[t.type]&&q.get(a,"handle"),f&&f.apply(a,n),f=c&&a[c],f&&x.acceptData(a)&&f.apply&&f.apply(a,n)===!1&&t.preventDefault();return t.type=d,i||t.isDefaultPrevented()||p._default&&p._default.apply(h.pop(),n)!==!1||!x.acceptData(r)||c&&x.isFunction(r[d])&&!x.isWindow(r)&&(u=r[c],u&&(r[c]=null),x.event.triggered=d,r[d](),x.event.triggered=undefined,u&&(r[c]=u)),t.result}},dispatch:function(e){e=x.event.fix(e);var t,n,r,i,o,s=[],a=d.call(arguments),u=(q.get(this,"events")||{})[e.type]||[],l=x.event.special[e.type]||{};if(a[0]=e,e.delegateTarget=this,!l.preDispatch||l.preDispatch.call(this,e)!==!1){s=x.event.handlers.call(this,e,u),t=0;while((i=s[t++])&&!e.isPropagationStopped()){e.currentTarget=i.elem,n=0;while((o=i.handlers[n++])&&!e.isImmediatePropagationStopped())(!e.namespace_re||e.namespace_re.test(o.namespace))&&(e.handleObj=o,e.data=o.data,r=((x.event.special[o.origType]||{}).handle||o.handler).apply(i.elem,a),r!==undefined&&(e.result=r)===!1&&(e.preventDefault(),e.stopPropagation()))}return l.postDispatch&&l.postDispatch.call(this,e),e.result}},handlers:function(e,t){var n,r,i,o,s=[],a=t.delegateCount,u=e.target;if(a&&u.nodeType&&(!e.button||"click"!==e.type))for(;u!==this;u=u.parentNode||this)if(u.disabled!==!0||"click"!==e.type){for(r=[],n=0;a>n;n++)o=t[n],i=o.selector+" ",r[i]===undefined&&(r[i]=o.needsContext?x(i,this).index(u)>=0:x.find(i,this,null,[u]).length),r[i]&&r.push(o);r.length&&s.push({elem:u,handlers:r})}return t.length>a&&s.push({elem:this,handlers:t.slice(a)}),s},props:"altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(e,t){return null==e.which&&(e.which=null!=t.charCode?t.charCode:t.keyCode),e}},mouseHooks:{props:"button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(e,t){var n,r,i,s=t.button;return null==e.pageX&&null!=t.clientX&&(n=e.target.ownerDocument||o,r=n.documentElement,i=n.body,e.pageX=t.clientX+(r&&r.scrollLeft||i&&i.scrollLeft||0)-(r&&r.clientLeft||i&&i.clientLeft||0),e.pageY=t.clientY+(r&&r.scrollTop||i&&i.scrollTop||0)-(r&&r.clientTop||i&&i.clientTop||0)),e.which||s===undefined||(e.which=1&s?1:2&s?3:4&s?2:0),e}},fix:function(e){if(e[x.expando])return e;var t,n,r,i=e.type,o=e,s=this.fixHooks[i];s||(this.fixHooks[i]=s=z.test(i)?this.mouseHooks:I.test(i)?this.keyHooks:{}),r=s.props?this.props.concat(s.props):this.props,e=new x.Event(o),t=r.length;while(t--)n=r[t],e[n]=o[n];return 3===e.target.nodeType&&(e.target=e.target.parentNode),s.filter?s.filter(e,o):e},special:{load:{noBubble:!0},focus:{trigger:function(){return this!==V()&&this.focus?(this.focus(),!1):undefined},delegateType:"focusin"},blur:{trigger:function(){return this===V()&&this.blur?(this.blur(),!1):undefined},delegateType:"focusout"},click:{trigger:function(){return"checkbox"===this.type&&this.click&&x.nodeName(this,"input")?(this.click(),!1):undefined},_default:function(e){return x.nodeName(e.target,"a")}},beforeunload:{postDispatch:function(e){e.result!==undefined&&(e.originalEvent.returnValue=e.result)}}},simulate:function(e,t,n,r){var i=x.extend(new x.Event,n,{type:e,isSimulated:!0,originalEvent:{}});r?x.event.trigger(i,null,t):x.event.dispatch.call(t,i),i.isDefaultPrevented()&&n.preventDefault()}},x.removeEvent=function(e,t,n){e.removeEventListener&&e.removeEventListener(t,n,!1)},x.Event=function(e,t){return this instanceof x.Event?(e&&e.type?(this.originalEvent=e,this.type=e.type,this.isDefaultPrevented=e.defaultPrevented||e.getPreventDefault&&e.getPreventDefault()?U:Y):this.type=e,t&&x.extend(this,t),this.timeStamp=e&&e.timeStamp||x.now(),this[x.expando]=!0,undefined):new x.Event(e,t)},x.Event.prototype={isDefaultPrevented:Y,isPropagationStopped:Y,isImmediatePropagationStopped:Y,preventDefault:function(){var e=this.originalEvent;this.isDefaultPrevented=U,e&&e.preventDefault&&e.preventDefault()},stopPropagation:function(){var e=this.originalEvent;this.isPropagationStopped=U,e&&e.stopPropagation&&e.stopPropagation()},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=U,this.stopPropagation()}},x.each({mouseenter:"mouseover",mouseleave:"mouseout"},function(e,t){x.event.special[e]={delegateType:t,bindType:t,handle:function(e){var n,r=this,i=e.relatedTarget,o=e.handleObj;return(!i||i!==r&&!x.contains(r,i))&&(e.type=o.origType,n=o.handler.apply(this,arguments),e.type=t),n}}}),x.support.focusinBubbles||x.each({focus:"focusin",blur:"focusout"},function(e,t){var n=0,r=function(e){x.event.simulate(t,e.target,x.event.fix(e),!0)};x.event.special[t]={setup:function(){0===n++&&o.addEventListener(e,r,!0)},teardown:function(){0===--n&&o.removeEventListener(e,r,!0)}}}),x.fn.extend({on:function(e,t,n,r,i){var o,s;if("object"==typeof e){"string"!=typeof t&&(n=n||t,t=undefined);for(s in e)this.on(s,t,n,e[s],i);return this}if(null==n&&null==r?(r=t,n=t=undefined):null==r&&("string"==typeof t?(r=n,n=undefined):(r=n,n=t,t=undefined)),r===!1)r=Y;else if(!r)return this;return 1===i&&(o=r,r=function(e){return x().off(e),o.apply(this,arguments)},r.guid=o.guid||(o.guid=x.guid++)),this.each(function(){x.event.add(this,e,r,n,t)})},one:function(e,t,n,r){return this.on(e,t,n,r,1)},off:function(e,t,n){var r,i;if(e&&e.preventDefault&&e.handleObj)return r=e.handleObj,x(e.delegateTarget).off(r.namespace?r.origType+"."+r.namespace:r.origType,r.selector,r.handler),this;if("object"==typeof e){for(i in e)this.off(i,t,e[i]);return this}return(t===!1||"function"==typeof t)&&(n=t,t=undefined),n===!1&&(n=Y),this.each(function(){x.event.remove(this,e,n,t)})},trigger:function(e,t){return this.each(function(){x.event.trigger(e,t,this)})},triggerHandler:function(e,t){var n=this[0];return n?x.event.trigger(e,t,n,!0):undefined}});var G=/^.[^:#\[\.,]*$/,J=x.expr.match.needsContext,Q={children:!0,contents:!0,next:!0,prev:!0};x.fn.extend({find:function(e){var t,n,r,i=this.length;if("string"!=typeof e)return t=this,this.pushStack(x(e).filter(function(){for(r=0;i>r;r++)if(x.contains(t[r],this))return!0}));for(n=[],r=0;i>r;r++)x.find(e,this[r],n);return n=this.pushStack(i>1?x.unique(n):n),n.selector=(this.selector?this.selector+" ":"")+e,n},has:function(e){var t=x(e,this),n=t.length;return this.filter(function(){var e=0;for(;n>e;e++)if(x.contains(this,t[e]))return!0})},not:function(e){return this.pushStack(Z(this,e||[],!0))},filter:function(e){return this.pushStack(Z(this,e||[],!1))},is:function(e){return!!e&&("string"==typeof e?J.test(e)?x(e,this.context).index(this[0])>=0:x.filter(e,this).length>0:this.filter(e).length>0)},closest:function(e,t){var n,r=0,i=this.length,o=[],s=J.test(e)||"string"!=typeof e?x(e,t||this.context):0;for(;i>r;r++)for(n=this[r];n&&n!==t;n=n.parentNode)if(11>n.nodeType&&(s?s.index(n)>-1:1===n.nodeType&&x.find.matchesSelector(n,e))){n=o.push(n);break}return this.pushStack(o.length>1?x.unique(o):o)},index:function(e){return e?"string"==typeof e?g.call(x(e),this[0]):g.call(this,e.jquery?e[0]:e):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(e,t){var n="string"==typeof e?x(e,t):x.makeArray(e&&e.nodeType?[e]:e),r=x.merge(this.get(),n);return this.pushStack(x.unique(r))},addBack:function(e){return this.add(null==e?this.prevObject:this.prevObject.filter(e))}});function K(e,t){while((e=e[t])&&1!==e.nodeType);return e}x.each({parent:function(e){var t=e.parentNode;return t&&11!==t.nodeType?t:null},parents:function(e){return x.dir(e,"parentNode")},parentsUntil:function(e,t,n){return x.dir(e,"parentNode",n)},next:function(e){return K(e,"nextSibling")},prev:function(e){return K(e,"previousSibling")},nextAll:function(e){return x.dir(e,"nextSibling")},prevAll:function(e){return x.dir(e,"previousSibling")},nextUntil:function(e,t,n){return x.dir(e,"nextSibling",n)},prevUntil:function(e,t,n){return x.dir(e,"previousSibling",n)},siblings:function(e){return x.sibling((e.parentNode||{}).firstChild,e)},children:function(e){return x.sibling(e.firstChild)},contents:function(e){return x.nodeName(e,"iframe")?e.contentDocument||e.contentWindow.document:x.merge([],e.childNodes)}},function(e,t){x.fn[e]=function(n,r){var i=x.map(this,t,n);return"Until"!==e.slice(-5)&&(r=n),r&&"string"==typeof r&&(i=x.filter(r,i)),this.length>1&&(Q[e]||x.unique(i),"p"===e[0]&&i.reverse()),this.pushStack(i)}}),x.extend({filter:function(e,t,n){var r=t[0];return n&&(e=":not("+e+")"),1===t.length&&1===r.nodeType?x.find.matchesSelector(r,e)?[r]:[]:x.find.matches(e,x.grep(t,function(e){return 1===e.nodeType}))},dir:function(e,t,n){var r=[],i=n!==undefined;while((e=e[t])&&9!==e.nodeType)if(1===e.nodeType){if(i&&x(e).is(n))break;r.push(e)}return r},sibling:function(e,t){var n=[];for(;e;e=e.nextSibling)1===e.nodeType&&e!==t&&n.push(e);return n}});function Z(e,t,n){if(x.isFunction(t))return x.grep(e,function(e,r){return!!t.call(e,r,e)!==n});if(t.nodeType)return x.grep(e,function(e){return e===t!==n});if("string"==typeof t){if(G.test(t))return x.filter(t,e,n);t=x.filter(t,e)}return x.grep(e,function(e){return g.call(t,e)>=0!==n})}var et=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,tt=/<([\w:]+)/,nt=/<|&#?\w+;/,rt=/<(?:script|style|link)/i,it=/^(?:checkbox|radio)$/i,ot=/checked\s*(?:[^=]|=\s*.checked.)/i,st=/^$|\/(?:java|ecma)script/i,at=/^true\/(.*)/,ut=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,lt={option:[1,"<select multiple='multiple'>","</select>"],thead:[1,"<table>","</table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};lt.optgroup=lt.option,lt.tbody=lt.tfoot=lt.colgroup=lt.caption=lt.col=lt.thead,lt.th=lt.td,x.fn.extend({text:function(e){return x.access(this,function(e){return e===undefined?x.text(this):this.empty().append((this[0]&&this[0].ownerDocument||o).createTextNode(e))},null,e,arguments.length)},append:function(){return this.domManip(arguments,function(e){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var t=ct(this,e);t.appendChild(e)}})},prepend:function(){return this.domManip(arguments,function(e){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var t=ct(this,e);t.insertBefore(e,t.firstChild)}})},before:function(){return this.domManip(arguments,function(e){this.parentNode&&this.parentNode.insertBefore(e,this)})},after:function(){return this.domManip(arguments,function(e){this.parentNode&&this.parentNode.insertBefore(e,this.nextSibling)})},remove:function(e,t){var n,r=e?x.filter(e,this):this,i=0;for(;null!=(n=r[i]);i++)t||1!==n.nodeType||x.cleanData(gt(n)),n.parentNode&&(t&&x.contains(n.ownerDocument,n)&&ht(gt(n,"script")),n.parentNode.removeChild(n));return this},empty:function(){var e,t=0;for(;null!=(e=this[t]);t++)1===e.nodeType&&(x.cleanData(gt(e,!1)),e.textContent="");return this},clone:function(e,t){return e=null==e?!1:e,t=null==t?e:t,this.map(function(){return x.clone(this,e,t)})},html:function(e){return x.access(this,function(e){var t=this[0]||{},n=0,r=this.length;if(e===undefined&&1===t.nodeType)return t.innerHTML;if("string"==typeof e&&!rt.test(e)&&!lt[(tt.exec(e)||["",""])[1].toLowerCase()]){e=e.replace(et,"<$1></$2>");try{for(;r>n;n++)t=this[n]||{},1===t.nodeType&&(x.cleanData(gt(t,!1)),t.innerHTML=e);t=0}catch(i){}}t&&this.empty().append(e)},null,e,arguments.length)},replaceWith:function(){var e=x.map(this,function(e){return[e.nextSibling,e.parentNode]}),t=0;return this.domManip(arguments,function(n){var r=e[t++],i=e[t++];i&&(x(this).remove(),i.insertBefore(n,r))},!0),t?this:this.remove()},detach:function(e){return this.remove(e,!0)},domManip:function(e,t,n){e=p.apply([],e);var r,i,o,s,a,u,l=0,c=this.length,f=this,h=c-1,d=e[0],g=x.isFunction(d);if(g||!(1>=c||"string"!=typeof d||x.support.checkClone)&&ot.test(d))return this.each(function(r){var i=f.eq(r);g&&(e[0]=d.call(this,r,i.html())),i.domManip(e,t,n)});if(c&&(r=x.buildFragment(e,this[0].ownerDocument,!1,!n&&this),i=r.firstChild,1===r.childNodes.length&&(r=i),i)){for(o=x.map(gt(r,"script"),ft),s=o.length;c>l;l++)a=r,l!==h&&(a=x.clone(a,!0,!0),s&&x.merge(o,gt(a,"script"))),t.call(this[l],a,l);if(s)for(u=o[o.length-1].ownerDocument,x.map(o,pt),l=0;s>l;l++)a=o[l],st.test(a.type||"")&&!q.access(a,"globalEval")&&x.contains(u,a)&&(a.src?x._evalUrl(a.src):x.globalEval(a.textContent.replace(ut,"")))}return this}}),x.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(e,t){x.fn[e]=function(e){var n,r=[],i=x(e),o=i.length-1,s=0;for(;o>=s;s++)n=s===o?this:this.clone(!0),x(i[s])[t](n),h.apply(r,n.get());return this.pushStack(r)}}),x.extend({clone:function(e,t,n){var r,i,o,s,a=e.cloneNode(!0),u=x.contains(e.ownerDocument,e);if(!(x.support.noCloneChecked||1!==e.nodeType&&11!==e.nodeType||x.isXMLDoc(e)))for(s=gt(a),o=gt(e),r=0,i=o.length;i>r;r++)mt(o[r],s[r]);if(t)if(n)for(o=o||gt(e),s=s||gt(a),r=0,i=o.length;i>r;r++)dt(o[r],s[r]);else dt(e,a);return s=gt(a,"script"),s.length>0&&ht(s,!u&&gt(e,"script")),a},buildFragment:function(e,t,n,r){var i,o,s,a,u,l,c=0,f=e.length,p=t.createDocumentFragment(),h=[];for(;f>c;c++)if(i=e[c],i||0===i)if("object"===x.type(i))x.merge(h,i.nodeType?[i]:i);else if(nt.test(i)){o=o||p.appendChild(t.createElement("div")),s=(tt.exec(i)||["",""])[1].toLowerCase(),a=lt[s]||lt._default,o.innerHTML=a[1]+i.replace(et,"<$1></$2>")+a[2],l=a[0];while(l--)o=o.firstChild;x.merge(h,o.childNodes),o=p.firstChild,o.textContent=""}else h.push(t.createTextNode(i));p.textContent="",c=0;while(i=h[c++])if((!r||-1===x.inArray(i,r))&&(u=x.contains(i.ownerDocument,i),o=gt(p.appendChild(i),"script"),u&&ht(o),n)){l=0;while(i=o[l++])st.test(i.type||"")&&n.push(i)}return p},cleanData:function(e){var t,n,r,i=e.length,o=0,s=x.event.special;for(;i>o;o++){if(n=e[o],x.acceptData(n)&&(t=q.access(n)))for(r in t.events)s[r]?x.event.remove(n,r):x.removeEvent(n,r,t.handle);L.discard(n),q.discard(n)}},_evalUrl:function(e){return x.ajax({url:e,type:"GET",dataType:"text",async:!1,global:!1,success:x.globalEval})}});function ct(e,t){return x.nodeName(e,"table")&&x.nodeName(1===t.nodeType?t:t.firstChild,"tr")?e.getElementsByTagName("tbody")[0]||e.appendChild(e.ownerDocument.createElement("tbody")):e}function ft(e){return e.type=(null!==e.getAttribute("type"))+"/"+e.type,e}function pt(e){var t=at.exec(e.type);return t?e.type=t[1]:e.removeAttribute("type"),e}function ht(e,t){var n=e.length,r=0;for(;n>r;r++)q.set(e[r],"globalEval",!t||q.get(t[r],"globalEval"))}function dt(e,t){var n,r,i,o,s,a,u,l;if(1===t.nodeType){if(q.hasData(e)&&(o=q.access(e),s=x.extend({},o),l=o.events,q.set(t,s),l)){delete s.handle,s.events={};for(i in l)for(n=0,r=l[i].length;r>n;n++)x.event.add(t,i,l[i][n])}L.hasData(e)&&(a=L.access(e),u=x.extend({},a),L.set(t,u))}}function gt(e,t){var n=e.getElementsByTagName?e.getElementsByTagName(t||"*"):e.querySelectorAll?e.querySelectorAll(t||"*"):[];return t===undefined||t&&x.nodeName(e,t)?x.merge([e],n):n}function mt(e,t){var n=t.nodeName.toLowerCase();"input"===n&&it.test(e.type)?t.checked=e.checked:("input"===n||"textarea"===n)&&(t.defaultValue=e.defaultValue)}x.fn.extend({wrapAll:function(e){var t;return x.isFunction(e)?this.each(function(t){x(this).wrapAll(e.call(this,t))}):(this[0]&&(t=x(e,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&t.insertBefore(this[0]),t.map(function(){var e=this;while(e.firstElementChild)e=e.firstElementChild;return e}).append(this)),this)},wrapInner:function(e){return x.isFunction(e)?this.each(function(t){x(this).wrapInner(e.call(this,t))}):this.each(function(){var t=x(this),n=t.contents();n.length?n.wrapAll(e):t.append(e)})},wrap:function(e){var t=x.isFunction(e);return this.each(function(n){x(this).wrapAll(t?e.call(this,n):e)})},unwrap:function(){return this.parent().each(function(){x.nodeName(this,"body")||x(this).replaceWith(this.childNodes)}).end()}});var yt,vt,xt=/^(none|table(?!-c[ea]).+)/,bt=/^margin/,wt=RegExp("^("+b+")(.*)$","i"),Tt=RegExp("^("+b+")(?!px)[a-z%]+$","i"),Ct=RegExp("^([+-])=("+b+")","i"),kt={BODY:"block"},Nt={position:"absolute",visibility:"hidden",display:"block"},Et={letterSpacing:0,fontWeight:400},St=["Top","Right","Bottom","Left"],jt=["Webkit","O","Moz","ms"];function Dt(e,t){if(t in e)return t;var n=t.charAt(0).toUpperCase()+t.slice(1),r=t,i=jt.length;while(i--)if(t=jt[i]+n,t in e)return t;return r}function At(e,t){return e=t||e,"none"===x.css(e,"display")||!x.contains(e.ownerDocument,e)}function Lt(t){return e.getComputedStyle(t,null)}function qt(e,t){var n,r,i,o=[],s=0,a=e.length;for(;a>s;s++)r=e[s],r.style&&(o[s]=q.get(r,"olddisplay"),n=r.style.display,t?(o[s]||"none"!==n||(r.style.display=""),""===r.style.display&&At(r)&&(o[s]=q.access(r,"olddisplay",Pt(r.nodeName)))):o[s]||(i=At(r),(n&&"none"!==n||!i)&&q.set(r,"olddisplay",i?n:x.css(r,"display"))));for(s=0;a>s;s++)r=e[s],r.style&&(t&&"none"!==r.style.display&&""!==r.style.display||(r.style.display=t?o[s]||"":"none"));return e}x.fn.extend({css:function(e,t){return x.access(this,function(e,t,n){var r,i,o={},s=0;if(x.isArray(t)){for(r=Lt(e),i=t.length;i>s;s++)o[t[s]]=x.css(e,t[s],!1,r);return o}return n!==undefined?x.style(e,t,n):x.css(e,t)},e,t,arguments.length>1)},show:function(){return qt(this,!0)},hide:function(){return qt(this)},toggle:function(e){var t="boolean"==typeof e;return this.each(function(){(t?e:At(this))?x(this).show():x(this).hide()})}}),x.extend({cssHooks:{opacity:{get:function(e,t){if(t){var n=yt(e,"opacity");return""===n?"1":n}}}},cssNumber:{columnCount:!0,fillOpacity:!0,fontWeight:!0,lineHeight:!0,opacity:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":"cssFloat"},style:function(e,t,n,r){if(e&&3!==e.nodeType&&8!==e.nodeType&&e.style){var i,o,s,a=x.camelCase(t),u=e.style;return t=x.cssProps[a]||(x.cssProps[a]=Dt(u,a)),s=x.cssHooks[t]||x.cssHooks[a],n===undefined?s&&"get"in s&&(i=s.get(e,!1,r))!==undefined?i:u[t]:(o=typeof n,"string"===o&&(i=Ct.exec(n))&&(n=(i[1]+1)*i[2]+parseFloat(x.css(e,t)),o="number"),null==n||"number"===o&&isNaN(n)||("number"!==o||x.cssNumber[a]||(n+="px"),x.support.clearCloneStyle||""!==n||0!==t.indexOf("background")||(u[t]="inherit"),s&&"set"in s&&(n=s.set(e,n,r))===undefined||(u[t]=n)),undefined)}},css:function(e,t,n,r){var i,o,s,a=x.camelCase(t);return t=x.cssProps[a]||(x.cssProps[a]=Dt(e.style,a)),s=x.cssHooks[t]||x.cssHooks[a],s&&"get"in s&&(i=s.get(e,!0,n)),i===undefined&&(i=yt(e,t,r)),"normal"===i&&t in Et&&(i=Et[t]),""===n||n?(o=parseFloat(i),n===!0||x.isNumeric(o)?o||0:i):i}}),yt=function(e,t,n){var r,i,o,s=n||Lt(e),a=s?s.getPropertyValue(t)||s[t]:undefined,u=e.style;return s&&(""!==a||x.contains(e.ownerDocument,e)||(a=x.style(e,t)),Tt.test(a)&&bt.test(t)&&(r=u.width,i=u.minWidth,o=u.maxWidth,u.minWidth=u.maxWidth=u.width=a,a=s.width,u.width=r,u.minWidth=i,u.maxWidth=o)),a};function Ht(e,t,n){var r=wt.exec(t);return r?Math.max(0,r[1]-(n||0))+(r[2]||"px"):t}function Ot(e,t,n,r,i){var o=n===(r?"border":"content")?4:"width"===t?1:0,s=0;for(;4>o;o+=2)"margin"===n&&(s+=x.css(e,n+St[o],!0,i)),r?("content"===n&&(s-=x.css(e,"padding"+St[o],!0,i)),"margin"!==n&&(s-=x.css(e,"border"+St[o]+"Width",!0,i))):(s+=x.css(e,"padding"+St[o],!0,i),"padding"!==n&&(s+=x.css(e,"border"+St[o]+"Width",!0,i)));return s}function Ft(e,t,n){var r=!0,i="width"===t?e.offsetWidth:e.offsetHeight,o=Lt(e),s=x.support.boxSizing&&"border-box"===x.css(e,"boxSizing",!1,o);if(0>=i||null==i){if(i=yt(e,t,o),(0>i||null==i)&&(i=e.style[t]),Tt.test(i))return i;r=s&&(x.support.boxSizingReliable||i===e.style[t]),i=parseFloat(i)||0}return i+Ot(e,t,n||(s?"border":"content"),r,o)+"px"}function Pt(e){var t=o,n=kt[e];return n||(n=Rt(e,t),"none"!==n&&n||(vt=(vt||x("<iframe frameborder='0' width='0' height='0'/>").css("cssText","display:block !important")).appendTo(t.documentElement),t=(vt[0].contentWindow||vt[0].contentDocument).document,t.write("<!doctype html><html><body>"),t.close(),n=Rt(e,t),vt.detach()),kt[e]=n),n}function Rt(e,t){var n=x(t.createElement(e)).appendTo(t.body),r=x.css(n[0],"display");return n.remove(),r}x.each(["height","width"],function(e,t){x.cssHooks[t]={get:function(e,n,r){return n?0===e.offsetWidth&&xt.test(x.css(e,"display"))?x.swap(e,Nt,function(){return Ft(e,t,r)}):Ft(e,t,r):undefined},set:function(e,n,r){var i=r&&Lt(e);return Ht(e,n,r?Ot(e,t,r,x.support.boxSizing&&"border-box"===x.css(e,"boxSizing",!1,i),i):0)}}}),x(function(){x.support.reliableMarginRight||(x.cssHooks.marginRight={get:function(e,t){return t?x.swap(e,{display:"inline-block"},yt,[e,"marginRight"]):undefined}}),!x.support.pixelPosition&&x.fn.position&&x.each(["top","left"],function(e,t){x.cssHooks[t]={get:function(e,n){return n?(n=yt(e,t),Tt.test(n)?x(e).position()[t]+"px":n):undefined}}})}),x.expr&&x.expr.filters&&(x.expr.filters.hidden=function(e){return 0>=e.offsetWidth&&0>=e.offsetHeight},x.expr.filters.visible=function(e){return!x.expr.filters.hidden(e)}),x.each({margin:"",padding:"",border:"Width"},function(e,t){x.cssHooks[e+t]={expand:function(n){var r=0,i={},o="string"==typeof n?n.split(" "):[n];for(;4>r;r++)i[e+St[r]+t]=o[r]||o[r-2]||o[0];return i}},bt.test(e)||(x.cssHooks[e+t].set=Ht)});var Mt=/%20/g,Wt=/\[\]$/,$t=/\r?\n/g,Bt=/^(?:submit|button|image|reset|file)$/i,It=/^(?:input|select|textarea|keygen)/i;x.fn.extend({serialize:function(){return x.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var e=x.prop(this,"elements");return e?x.makeArray(e):this}).filter(function(){var e=this.type;return this.name&&!x(this).is(":disabled")&&It.test(this.nodeName)&&!Bt.test(e)&&(this.checked||!it.test(e))}).map(function(e,t){var n=x(this).val();return null==n?null:x.isArray(n)?x.map(n,function(e){return{name:t.name,value:e.replace($t,"\r\n")}}):{name:t.name,value:n.replace($t,"\r\n")}}).get()}}),x.param=function(e,t){var n,r=[],i=function(e,t){t=x.isFunction(t)?t():null==t?"":t,r[r.length]=encodeURIComponent(e)+"="+encodeURIComponent(t)};if(t===undefined&&(t=x.ajaxSettings&&x.ajaxSettings.traditional),x.isArray(e)||e.jquery&&!x.isPlainObject(e))x.each(e,function(){i(this.name,this.value)});else for(n in e)zt(n,e[n],t,i);return r.join("&").replace(Mt,"+")};function zt(e,t,n,r){var i;if(x.isArray(t))x.each(t,function(t,i){n||Wt.test(e)?r(e,i):zt(e+"["+("object"==typeof i?t:"")+"]",i,n,r)});else if(n||"object"!==x.type(t))r(e,t);else for(i in t)zt(e+"["+i+"]",t[i],n,r)}x.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(e,t){x.fn[t]=function(e,n){return arguments.length>0?this.on(t,null,e,n):this.trigger(t)}}),x.fn.extend({hover:function(e,t){return this.mouseenter(e).mouseleave(t||e)},bind:function(e,t,n){return this.on(e,null,t,n)},unbind:function(e,t){return this.off(e,null,t)},delegate:function(e,t,n,r){return this.on(t,e,n,r)},undelegate:function(e,t,n){return 1===arguments.length?this.off(e,"**"):this.off(t,e||"**",n)}});var _t,Xt,Ut=x.now(),Yt=/\?/,Vt=/#.*$/,Gt=/([?&])_=[^&]*/,Jt=/^(.*?):[ \t]*([^\r\n]*)$/gm,Qt=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,Kt=/^(?:GET|HEAD)$/,Zt=/^\/\//,en=/^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,tn=x.fn.load,nn={},rn={},on="*/".concat("*");try{Xt=i.href}catch(sn){Xt=o.createElement("a"),Xt.href="",Xt=Xt.href}_t=en.exec(Xt.toLowerCase())||[];function an(e){return function(t,n){"string"!=typeof t&&(n=t,t="*");var r,i=0,o=t.toLowerCase().match(w)||[];
if(x.isFunction(n))while(r=o[i++])"+"===r[0]?(r=r.slice(1)||"*",(e[r]=e[r]||[]).unshift(n)):(e[r]=e[r]||[]).push(n)}}function un(e,t,n,r){var i={},o=e===rn;function s(a){var u;return i[a]=!0,x.each(e[a]||[],function(e,a){var l=a(t,n,r);return"string"!=typeof l||o||i[l]?o?!(u=l):undefined:(t.dataTypes.unshift(l),s(l),!1)}),u}return s(t.dataTypes[0])||!i["*"]&&s("*")}function ln(e,t){var n,r,i=x.ajaxSettings.flatOptions||{};for(n in t)t[n]!==undefined&&((i[n]?e:r||(r={}))[n]=t[n]);return r&&x.extend(!0,e,r),e}x.fn.load=function(e,t,n){if("string"!=typeof e&&tn)return tn.apply(this,arguments);var r,i,o,s=this,a=e.indexOf(" ");return a>=0&&(r=e.slice(a),e=e.slice(0,a)),x.isFunction(t)?(n=t,t=undefined):t&&"object"==typeof t&&(i="POST"),s.length>0&&x.ajax({url:e,type:i,dataType:"html",data:t}).done(function(e){o=arguments,s.html(r?x("<div>").append(x.parseHTML(e)).find(r):e)}).complete(n&&function(e,t){s.each(n,o||[e.responseText,t,e])}),this},x.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(e,t){x.fn[t]=function(e){return this.on(t,e)}}),x.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:Xt,type:"GET",isLocal:Qt.test(_t[1]),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":on,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":x.parseJSON,"text xml":x.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(e,t){return t?ln(ln(e,x.ajaxSettings),t):ln(x.ajaxSettings,e)},ajaxPrefilter:an(nn),ajaxTransport:an(rn),ajax:function(e,t){"object"==typeof e&&(t=e,e=undefined),t=t||{};var n,r,i,o,s,a,u,l,c=x.ajaxSetup({},t),f=c.context||c,p=c.context&&(f.nodeType||f.jquery)?x(f):x.event,h=x.Deferred(),d=x.Callbacks("once memory"),g=c.statusCode||{},m={},y={},v=0,b="canceled",T={readyState:0,getResponseHeader:function(e){var t;if(2===v){if(!o){o={};while(t=Jt.exec(i))o[t[1].toLowerCase()]=t[2]}t=o[e.toLowerCase()]}return null==t?null:t},getAllResponseHeaders:function(){return 2===v?i:null},setRequestHeader:function(e,t){var n=e.toLowerCase();return v||(e=y[n]=y[n]||e,m[e]=t),this},overrideMimeType:function(e){return v||(c.mimeType=e),this},statusCode:function(e){var t;if(e)if(2>v)for(t in e)g[t]=[g[t],e[t]];else T.always(e[T.status]);return this},abort:function(e){var t=e||b;return n&&n.abort(t),k(0,t),this}};if(h.promise(T).complete=d.add,T.success=T.done,T.error=T.fail,c.url=((e||c.url||Xt)+"").replace(Vt,"").replace(Zt,_t[1]+"//"),c.type=t.method||t.type||c.method||c.type,c.dataTypes=x.trim(c.dataType||"*").toLowerCase().match(w)||[""],null==c.crossDomain&&(a=en.exec(c.url.toLowerCase()),c.crossDomain=!(!a||a[1]===_t[1]&&a[2]===_t[2]&&(a[3]||("http:"===a[1]?"80":"443"))===(_t[3]||("http:"===_t[1]?"80":"443")))),c.data&&c.processData&&"string"!=typeof c.data&&(c.data=x.param(c.data,c.traditional)),un(nn,c,t,T),2===v)return T;u=c.global,u&&0===x.active++&&x.event.trigger("ajaxStart"),c.type=c.type.toUpperCase(),c.hasContent=!Kt.test(c.type),r=c.url,c.hasContent||(c.data&&(r=c.url+=(Yt.test(r)?"&":"?")+c.data,delete c.data),c.cache===!1&&(c.url=Gt.test(r)?r.replace(Gt,"$1_="+Ut++):r+(Yt.test(r)?"&":"?")+"_="+Ut++)),c.ifModified&&(x.lastModified[r]&&T.setRequestHeader("If-Modified-Since",x.lastModified[r]),x.etag[r]&&T.setRequestHeader("If-None-Match",x.etag[r])),(c.data&&c.hasContent&&c.contentType!==!1||t.contentType)&&T.setRequestHeader("Content-Type",c.contentType),T.setRequestHeader("Accept",c.dataTypes[0]&&c.accepts[c.dataTypes[0]]?c.accepts[c.dataTypes[0]]+("*"!==c.dataTypes[0]?", "+on+"; q=0.01":""):c.accepts["*"]);for(l in c.headers)T.setRequestHeader(l,c.headers[l]);if(c.beforeSend&&(c.beforeSend.call(f,T,c)===!1||2===v))return T.abort();b="abort";for(l in{success:1,error:1,complete:1})T[l](c[l]);if(n=un(rn,c,t,T)){T.readyState=1,u&&p.trigger("ajaxSend",[T,c]),c.async&&c.timeout>0&&(s=setTimeout(function(){T.abort("timeout")},c.timeout));try{v=1,n.send(m,k)}catch(C){if(!(2>v))throw C;k(-1,C)}}else k(-1,"No Transport");function k(e,t,o,a){var l,m,y,b,w,C=t;2!==v&&(v=2,s&&clearTimeout(s),n=undefined,i=a||"",T.readyState=e>0?4:0,l=e>=200&&300>e||304===e,o&&(b=cn(c,T,o)),b=fn(c,b,T,l),l?(c.ifModified&&(w=T.getResponseHeader("Last-Modified"),w&&(x.lastModified[r]=w),w=T.getResponseHeader("etag"),w&&(x.etag[r]=w)),204===e?C="nocontent":304===e?C="notmodified":(C=b.state,m=b.data,y=b.error,l=!y)):(y=C,(e||!C)&&(C="error",0>e&&(e=0))),T.status=e,T.statusText=(t||C)+"",l?h.resolveWith(f,[m,C,T]):h.rejectWith(f,[T,C,y]),T.statusCode(g),g=undefined,u&&p.trigger(l?"ajaxSuccess":"ajaxError",[T,c,l?m:y]),d.fireWith(f,[T,C]),u&&(p.trigger("ajaxComplete",[T,c]),--x.active||x.event.trigger("ajaxStop")))}return T},getJSON:function(e,t,n){return x.get(e,t,n,"json")},getScript:function(e,t){return x.get(e,undefined,t,"script")}}),x.each(["get","post"],function(e,t){x[t]=function(e,n,r,i){return x.isFunction(n)&&(i=i||r,r=n,n=undefined),x.ajax({url:e,type:t,dataType:i,data:n,success:r})}});function cn(e,t,n){var r,i,o,s,a=e.contents,u=e.dataTypes;while("*"===u[0])u.shift(),r===undefined&&(r=e.mimeType||t.getResponseHeader("Content-Type"));if(r)for(i in a)if(a[i]&&a[i].test(r)){u.unshift(i);break}if(u[0]in n)o=u[0];else{for(i in n){if(!u[0]||e.converters[i+" "+u[0]]){o=i;break}s||(s=i)}o=o||s}return o?(o!==u[0]&&u.unshift(o),n[o]):undefined}function fn(e,t,n,r){var i,o,s,a,u,l={},c=e.dataTypes.slice();if(c[1])for(s in e.converters)l[s.toLowerCase()]=e.converters[s];o=c.shift();while(o)if(e.responseFields[o]&&(n[e.responseFields[o]]=t),!u&&r&&e.dataFilter&&(t=e.dataFilter(t,e.dataType)),u=o,o=c.shift())if("*"===o)o=u;else if("*"!==u&&u!==o){if(s=l[u+" "+o]||l["* "+o],!s)for(i in l)if(a=i.split(" "),a[1]===o&&(s=l[u+" "+a[0]]||l["* "+a[0]])){s===!0?s=l[i]:l[i]!==!0&&(o=a[0],c.unshift(a[1]));break}if(s!==!0)if(s&&e["throws"])t=s(t);else try{t=s(t)}catch(f){return{state:"parsererror",error:s?f:"No conversion from "+u+" to "+o}}}return{state:"success",data:t}}x.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/(?:java|ecma)script/},converters:{"text script":function(e){return x.globalEval(e),e}}}),x.ajaxPrefilter("script",function(e){e.cache===undefined&&(e.cache=!1),e.crossDomain&&(e.type="GET")}),x.ajaxTransport("script",function(e){if(e.crossDomain){var t,n;return{send:function(r,i){t=x("<script>").prop({async:!0,charset:e.scriptCharset,src:e.url}).on("load error",n=function(e){t.remove(),n=null,e&&i("error"===e.type?404:200,e.type)}),o.head.appendChild(t[0])},abort:function(){n&&n()}}}});var pn=[],hn=/(=)\?(?=&|$)|\?\?/;x.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var e=pn.pop()||x.expando+"_"+Ut++;return this[e]=!0,e}}),x.ajaxPrefilter("json jsonp",function(t,n,r){var i,o,s,a=t.jsonp!==!1&&(hn.test(t.url)?"url":"string"==typeof t.data&&!(t.contentType||"").indexOf("application/x-www-form-urlencoded")&&hn.test(t.data)&&"data");return a||"jsonp"===t.dataTypes[0]?(i=t.jsonpCallback=x.isFunction(t.jsonpCallback)?t.jsonpCallback():t.jsonpCallback,a?t[a]=t[a].replace(hn,"$1"+i):t.jsonp!==!1&&(t.url+=(Yt.test(t.url)?"&":"?")+t.jsonp+"="+i),t.converters["script json"]=function(){return s||x.error(i+" was not called"),s[0]},t.dataTypes[0]="json",o=e[i],e[i]=function(){s=arguments},r.always(function(){e[i]=o,t[i]&&(t.jsonpCallback=n.jsonpCallback,pn.push(i)),s&&x.isFunction(o)&&o(s[0]),s=o=undefined}),"script"):undefined}),x.ajaxSettings.xhr=function(){try{return new XMLHttpRequest}catch(e){}};var dn=x.ajaxSettings.xhr(),gn={0:200,1223:204},mn=0,yn={};e.ActiveXObject&&x(e).on("unload",function(){for(var e in yn)yn[e]();yn=undefined}),x.support.cors=!!dn&&"withCredentials"in dn,x.support.ajax=dn=!!dn,x.ajaxTransport(function(e){var t;return x.support.cors||dn&&!e.crossDomain?{send:function(n,r){var i,o,s=e.xhr();if(s.open(e.type,e.url,e.async,e.username,e.password),e.xhrFields)for(i in e.xhrFields)s[i]=e.xhrFields[i];e.mimeType&&s.overrideMimeType&&s.overrideMimeType(e.mimeType),e.crossDomain||n["X-Requested-With"]||(n["X-Requested-With"]="XMLHttpRequest");for(i in n)s.setRequestHeader(i,n[i]);t=function(e){return function(){t&&(delete yn[o],t=s.onload=s.onerror=null,"abort"===e?s.abort():"error"===e?r(s.status||404,s.statusText):r(gn[s.status]||s.status,s.statusText,"string"==typeof s.responseText?{text:s.responseText}:undefined,s.getAllResponseHeaders()))}},s.onload=t(),s.onerror=t("error"),t=yn[o=mn++]=t("abort"),s.send(e.hasContent&&e.data||null)},abort:function(){t&&t()}}:undefined});var vn,xn,bn=/^(?:toggle|show|hide)$/,wn=RegExp("^(?:([+-])=|)("+b+")([a-z%]*)$","i"),Tn=/queueHooks$/,Cn=[Dn],kn={"*":[function(e,t){var n,r,i=this.createTween(e,t),o=wn.exec(t),s=i.cur(),a=+s||0,u=1,l=20;if(o){if(n=+o[2],r=o[3]||(x.cssNumber[e]?"":"px"),"px"!==r&&a){a=x.css(i.elem,e,!0)||n||1;do u=u||".5",a/=u,x.style(i.elem,e,a+r);while(u!==(u=i.cur()/s)&&1!==u&&--l)}i.unit=r,i.start=a,i.end=o[1]?a+(o[1]+1)*n:n}return i}]};function Nn(){return setTimeout(function(){vn=undefined}),vn=x.now()}function En(e,t){x.each(t,function(t,n){var r=(kn[t]||[]).concat(kn["*"]),i=0,o=r.length;for(;o>i;i++)if(r[i].call(e,t,n))return})}function Sn(e,t,n){var r,i,o=0,s=Cn.length,a=x.Deferred().always(function(){delete u.elem}),u=function(){if(i)return!1;var t=vn||Nn(),n=Math.max(0,l.startTime+l.duration-t),r=n/l.duration||0,o=1-r,s=0,u=l.tweens.length;for(;u>s;s++)l.tweens[s].run(o);return a.notifyWith(e,[l,o,n]),1>o&&u?n:(a.resolveWith(e,[l]),!1)},l=a.promise({elem:e,props:x.extend({},t),opts:x.extend(!0,{specialEasing:{}},n),originalProperties:t,originalOptions:n,startTime:vn||Nn(),duration:n.duration,tweens:[],createTween:function(t,n){var r=x.Tween(e,l.opts,t,n,l.opts.specialEasing[t]||l.opts.easing);return l.tweens.push(r),r},stop:function(t){var n=0,r=t?l.tweens.length:0;if(i)return this;for(i=!0;r>n;n++)l.tweens[n].run(1);return t?a.resolveWith(e,[l,t]):a.rejectWith(e,[l,t]),this}}),c=l.props;for(jn(c,l.opts.specialEasing);s>o;o++)if(r=Cn[o].call(l,e,c,l.opts))return r;return En(l,c),x.isFunction(l.opts.start)&&l.opts.start.call(e,l),x.fx.timer(x.extend(u,{elem:e,anim:l,queue:l.opts.queue})),l.progress(l.opts.progress).done(l.opts.done,l.opts.complete).fail(l.opts.fail).always(l.opts.always)}function jn(e,t){var n,r,i,o,s;for(n in e)if(r=x.camelCase(n),i=t[r],o=e[n],x.isArray(o)&&(i=o[1],o=e[n]=o[0]),n!==r&&(e[r]=o,delete e[n]),s=x.cssHooks[r],s&&"expand"in s){o=s.expand(o),delete e[r];for(n in o)n in e||(e[n]=o[n],t[n]=i)}else t[r]=i}x.Animation=x.extend(Sn,{tweener:function(e,t){x.isFunction(e)?(t=e,e=["*"]):e=e.split(" ");var n,r=0,i=e.length;for(;i>r;r++)n=e[r],kn[n]=kn[n]||[],kn[n].unshift(t)},prefilter:function(e,t){t?Cn.unshift(e):Cn.push(e)}});function Dn(e,t,n){var r,i,o,s,a,u,l,c,f,p=this,h=e.style,d={},g=[],m=e.nodeType&&At(e);n.queue||(c=x._queueHooks(e,"fx"),null==c.unqueued&&(c.unqueued=0,f=c.empty.fire,c.empty.fire=function(){c.unqueued||f()}),c.unqueued++,p.always(function(){p.always(function(){c.unqueued--,x.queue(e,"fx").length||c.empty.fire()})})),1===e.nodeType&&("height"in t||"width"in t)&&(n.overflow=[h.overflow,h.overflowX,h.overflowY],"inline"===x.css(e,"display")&&"none"===x.css(e,"float")&&(h.display="inline-block")),n.overflow&&(h.overflow="hidden",p.always(function(){h.overflow=n.overflow[0],h.overflowX=n.overflow[1],h.overflowY=n.overflow[2]})),a=q.get(e,"fxshow");for(r in t)if(o=t[r],bn.exec(o)){if(delete t[r],u=u||"toggle"===o,o===(m?"hide":"show")){if("show"!==o||a===undefined||a[r]===undefined)continue;m=!0}g.push(r)}if(s=g.length){a=q.get(e,"fxshow")||q.access(e,"fxshow",{}),"hidden"in a&&(m=a.hidden),u&&(a.hidden=!m),m?x(e).show():p.done(function(){x(e).hide()}),p.done(function(){var t;q.remove(e,"fxshow");for(t in d)x.style(e,t,d[t])});for(r=0;s>r;r++)i=g[r],l=p.createTween(i,m?a[i]:0),d[i]=a[i]||x.style(e,i),i in a||(a[i]=l.start,m&&(l.end=l.start,l.start="width"===i||"height"===i?1:0))}}function An(e,t,n,r,i){return new An.prototype.init(e,t,n,r,i)}x.Tween=An,An.prototype={constructor:An,init:function(e,t,n,r,i,o){this.elem=e,this.prop=n,this.easing=i||"swing",this.options=t,this.start=this.now=this.cur(),this.end=r,this.unit=o||(x.cssNumber[n]?"":"px")},cur:function(){var e=An.propHooks[this.prop];return e&&e.get?e.get(this):An.propHooks._default.get(this)},run:function(e){var t,n=An.propHooks[this.prop];return this.pos=t=this.options.duration?x.easing[this.easing](e,this.options.duration*e,0,1,this.options.duration):e,this.now=(this.end-this.start)*t+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),n&&n.set?n.set(this):An.propHooks._default.set(this),this}},An.prototype.init.prototype=An.prototype,An.propHooks={_default:{get:function(e){var t;return null==e.elem[e.prop]||e.elem.style&&null!=e.elem.style[e.prop]?(t=x.css(e.elem,e.prop,""),t&&"auto"!==t?t:0):e.elem[e.prop]},set:function(e){x.fx.step[e.prop]?x.fx.step[e.prop](e):e.elem.style&&(null!=e.elem.style[x.cssProps[e.prop]]||x.cssHooks[e.prop])?x.style(e.elem,e.prop,e.now+e.unit):e.elem[e.prop]=e.now}}},An.propHooks.scrollTop=An.propHooks.scrollLeft={set:function(e){e.elem.nodeType&&e.elem.parentNode&&(e.elem[e.prop]=e.now)}},x.each(["toggle","show","hide"],function(e,t){var n=x.fn[t];x.fn[t]=function(e,r,i){return null==e||"boolean"==typeof e?n.apply(this,arguments):this.animate(Ln(t,!0),e,r,i)}}),x.fn.extend({fadeTo:function(e,t,n,r){return this.filter(At).css("opacity",0).show().end().animate({opacity:t},e,n,r)},animate:function(e,t,n,r){var i=x.isEmptyObject(e),o=x.speed(t,n,r),s=function(){var t=Sn(this,x.extend({},e),o);s.finish=function(){t.stop(!0)},(i||q.get(this,"finish"))&&t.stop(!0)};return s.finish=s,i||o.queue===!1?this.each(s):this.queue(o.queue,s)},stop:function(e,t,n){var r=function(e){var t=e.stop;delete e.stop,t(n)};return"string"!=typeof e&&(n=t,t=e,e=undefined),t&&e!==!1&&this.queue(e||"fx",[]),this.each(function(){var t=!0,i=null!=e&&e+"queueHooks",o=x.timers,s=q.get(this);if(i)s[i]&&s[i].stop&&r(s[i]);else for(i in s)s[i]&&s[i].stop&&Tn.test(i)&&r(s[i]);for(i=o.length;i--;)o[i].elem!==this||null!=e&&o[i].queue!==e||(o[i].anim.stop(n),t=!1,o.splice(i,1));(t||!n)&&x.dequeue(this,e)})},finish:function(e){return e!==!1&&(e=e||"fx"),this.each(function(){var t,n=q.get(this),r=n[e+"queue"],i=n[e+"queueHooks"],o=x.timers,s=r?r.length:0;for(n.finish=!0,x.queue(this,e,[]),i&&i.cur&&i.cur.finish&&i.cur.finish.call(this),t=o.length;t--;)o[t].elem===this&&o[t].queue===e&&(o[t].anim.stop(!0),o.splice(t,1));for(t=0;s>t;t++)r[t]&&r[t].finish&&r[t].finish.call(this);delete n.finish})}});function Ln(e,t){var n,r={height:e},i=0;for(t=t?1:0;4>i;i+=2-t)n=St[i],r["margin"+n]=r["padding"+n]=e;return t&&(r.opacity=r.width=e),r}x.each({slideDown:Ln("show"),slideUp:Ln("hide"),slideToggle:Ln("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(e,t){x.fn[e]=function(e,n,r){return this.animate(t,e,n,r)}}),x.speed=function(e,t,n){var r=e&&"object"==typeof e?x.extend({},e):{complete:n||!n&&t||x.isFunction(e)&&e,duration:e,easing:n&&t||t&&!x.isFunction(t)&&t};return r.duration=x.fx.off?0:"number"==typeof r.duration?r.duration:r.duration in x.fx.speeds?x.fx.speeds[r.duration]:x.fx.speeds._default,(null==r.queue||r.queue===!0)&&(r.queue="fx"),r.old=r.complete,r.complete=function(){x.isFunction(r.old)&&r.old.call(this),r.queue&&x.dequeue(this,r.queue)},r},x.easing={linear:function(e){return e},swing:function(e){return.5-Math.cos(e*Math.PI)/2}},x.timers=[],x.fx=An.prototype.init,x.fx.tick=function(){var e,t=x.timers,n=0;for(vn=x.now();t.length>n;n++)e=t[n],e()||t[n]!==e||t.splice(n--,1);t.length||x.fx.stop(),vn=undefined},x.fx.timer=function(e){e()&&x.timers.push(e)&&x.fx.start()},x.fx.interval=13,x.fx.start=function(){xn||(xn=setInterval(x.fx.tick,x.fx.interval))},x.fx.stop=function(){clearInterval(xn),xn=null},x.fx.speeds={slow:600,fast:200,_default:400},x.fx.step={},x.expr&&x.expr.filters&&(x.expr.filters.animated=function(e){return x.grep(x.timers,function(t){return e===t.elem}).length}),x.fn.offset=function(e){if(arguments.length)return e===undefined?this:this.each(function(t){x.offset.setOffset(this,e,t)});var t,n,i=this[0],o={top:0,left:0},s=i&&i.ownerDocument;if(s)return t=s.documentElement,x.contains(t,i)?(typeof i.getBoundingClientRect!==r&&(o=i.getBoundingClientRect()),n=qn(s),{top:o.top+n.pageYOffset-t.clientTop,left:o.left+n.pageXOffset-t.clientLeft}):o},x.offset={setOffset:function(e,t,n){var r,i,o,s,a,u,l,c=x.css(e,"position"),f=x(e),p={};"static"===c&&(e.style.position="relative"),a=f.offset(),o=x.css(e,"top"),u=x.css(e,"left"),l=("absolute"===c||"fixed"===c)&&(o+u).indexOf("auto")>-1,l?(r=f.position(),s=r.top,i=r.left):(s=parseFloat(o)||0,i=parseFloat(u)||0),x.isFunction(t)&&(t=t.call(e,n,a)),null!=t.top&&(p.top=t.top-a.top+s),null!=t.left&&(p.left=t.left-a.left+i),"using"in t?t.using.call(e,p):f.css(p)}},x.fn.extend({position:function(){if(this[0]){var e,t,n=this[0],r={top:0,left:0};return"fixed"===x.css(n,"position")?t=n.getBoundingClientRect():(e=this.offsetParent(),t=this.offset(),x.nodeName(e[0],"html")||(r=e.offset()),r.top+=x.css(e[0],"borderTopWidth",!0),r.left+=x.css(e[0],"borderLeftWidth",!0)),{top:t.top-r.top-x.css(n,"marginTop",!0),left:t.left-r.left-x.css(n,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var e=this.offsetParent||s;while(e&&!x.nodeName(e,"html")&&"static"===x.css(e,"position"))e=e.offsetParent;return e||s})}}),x.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(t,n){var r="pageYOffset"===n;x.fn[t]=function(i){return x.access(this,function(t,i,o){var s=qn(t);return o===undefined?s?s[n]:t[i]:(s?s.scrollTo(r?e.pageXOffset:o,r?o:e.pageYOffset):t[i]=o,undefined)},t,i,arguments.length,null)}});function qn(e){return x.isWindow(e)?e:9===e.nodeType&&e.defaultView}x.each({Height:"height",Width:"width"},function(e,t){x.each({padding:"inner"+e,content:t,"":"outer"+e},function(n,r){x.fn[r]=function(r,i){var o=arguments.length&&(n||"boolean"!=typeof r),s=n||(r===!0||i===!0?"margin":"border");return x.access(this,function(t,n,r){var i;return x.isWindow(t)?t.document.documentElement["client"+e]:9===t.nodeType?(i=t.documentElement,Math.max(t.body["scroll"+e],i["scroll"+e],t.body["offset"+e],i["offset"+e],i["client"+e])):r===undefined?x.css(t,n,s):x.style(t,n,r,s)},t,o?r:undefined,o,null)}})}),x.fn.size=function(){return this.length},x.fn.andSelf=x.fn.addBack,"object"==typeof module&&"object"==typeof module.exports?module.exports=x:"function"==typeof define&&define.amd&&define("jquery",[],function(){return x}),"object"==typeof e&&"object"==typeof e.document&&(e.jQuery=e.$=x)})(window);;
/*! jQuery Mobile 1.3.1 | Git HEAD hash: 74b4bec <> 2013-04-08T19:41:28Z | (c) 2010, 2013 jQuery Foundation, Inc. | jquery.org/license */
(function(e,t,i){"function"==typeof define&&define.amd?define(["jquery"],function(n){return i(n,e,t),n.mobile}):i(e.jQuery,e,t)})(this,document,function(e,t,i,n){(function(e){e.mobile={}})(e),function(e,t,n){var a={};e.mobile=e.extend(e.mobile,{version:"1.3.1",ns:"",subPageUrlKey:"ui-page",activePageClass:"ui-page-active",activeBtnClass:"ui-btn-active",focusClass:"ui-focus",ajaxEnabled:!0,hashListeningEnabled:!0,linkBindingEnabled:!0,defaultPageTransition:"fade",maxTransitionWidth:!1,minScrollBack:250,touchOverflowEnabled:!1,defaultDialogTransition:"pop",pageLoadErrorMessage:"Error Loading Page",pageLoadErrorMessageTheme:"e",phonegapNavigationEnabled:!1,autoInitializePage:!0,pushStateEnabled:!0,ignoreContentEnabled:!1,orientationChangeEnabled:!0,buttonMarkup:{hoverDelay:200},window:e(t),document:e(i),keyCode:{ALT:18,BACKSPACE:8,CAPS_LOCK:20,COMMA:188,COMMAND:91,COMMAND_LEFT:91,COMMAND_RIGHT:93,CONTROL:17,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,INSERT:45,LEFT:37,MENU:93,NUMPAD_ADD:107,NUMPAD_DECIMAL:110,NUMPAD_DIVIDE:111,NUMPAD_ENTER:108,NUMPAD_MULTIPLY:106,NUMPAD_SUBTRACT:109,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SHIFT:16,SPACE:32,TAB:9,UP:38,WINDOWS:91},behaviors:{},silentScroll:function(i){"number"!==e.type(i)&&(i=e.mobile.defaultHomeScroll),e.event.special.scrollstart.enabled=!1,setTimeout(function(){t.scrollTo(0,i),e.mobile.document.trigger("silentscroll",{x:0,y:i})},20),setTimeout(function(){e.event.special.scrollstart.enabled=!0},150)},nsNormalizeDict:a,nsNormalize:function(t){return t?a[t]||(a[t]=e.camelCase(e.mobile.ns+t)):n},getInheritedTheme:function(e,t){for(var i,n,a=e[0],o="",s=/ui-(bar|body|overlay)-([a-z])\b/;a&&(i=a.className||"",!(i&&(n=s.exec(i))&&(o=n[2])));)a=a.parentNode;return o||t||"a"},closestPageData:function(e){return e.closest(':jqmData(role="page"), :jqmData(role="dialog")').data("mobile-page")},enhanceable:function(e){return this.haveParents(e,"enhance")},hijackable:function(e){return this.haveParents(e,"ajax")},haveParents:function(t,i){if(!e.mobile.ignoreContentEnabled)return t;for(var n,a,o,s=t.length,r=e(),l=0;s>l;l++){for(a=t.eq(l),o=!1,n=t[l];n;){var d=n.getAttribute?n.getAttribute("data-"+e.mobile.ns+i):"";if("false"===d){o=!0;break}n=n.parentNode}o||(r=r.add(a))}return r},getScreenHeight:function(){return t.innerHeight||e.mobile.window.height()}},e.mobile),e.fn.jqmData=function(t,i){var a;return t!==n&&(t&&(t=e.mobile.nsNormalize(t)),a=2>arguments.length||i===n?this.data(t):this.data(t,i)),a},e.jqmData=function(t,i,a){var o;return i!==n&&(o=e.data(t,i?e.mobile.nsNormalize(i):i,a)),o},e.fn.jqmRemoveData=function(t){return this.removeData(e.mobile.nsNormalize(t))},e.jqmRemoveData=function(t,i){return e.removeData(t,e.mobile.nsNormalize(i))},e.fn.removeWithDependents=function(){e.removeWithDependents(this)},e.removeWithDependents=function(t){var i=e(t);(i.jqmData("dependents")||e()).remove(),i.remove()},e.fn.addDependents=function(t){e.addDependents(e(this),t)},e.addDependents=function(t,i){var n=e(t).jqmData("dependents")||e();e(t).jqmData("dependents",e.merge(n,i))},e.fn.getEncodedText=function(){return e("<div/>").text(e(this).text()).html()},e.fn.jqmEnhanceable=function(){return e.mobile.enhanceable(this)},e.fn.jqmHijackable=function(){return e.mobile.hijackable(this)};var o=e.find,s=/:jqmData\(([^)]*)\)/g;e.find=function(t,i,n,a){return t=t.replace(s,"[data-"+(e.mobile.ns||"")+"$1]"),o.call(this,t,i,n,a)},e.extend(e.find,o),e.find.matches=function(t,i){return e.find(t,null,null,i)},e.find.matchesSelector=function(t,i){return e.find(i,null,null,[t]).length>0}}(e,this),function(e,t){var i=0,n=Array.prototype.slice,a=e.cleanData;e.cleanData=function(t){for(var i,n=0;null!=(i=t[n]);n++)try{e(i).triggerHandler("remove")}catch(o){}a(t)},e.widget=function(i,n,a){var o,s,r,l,d=i.split(".")[0];i=i.split(".")[1],o=d+"-"+i,a||(a=n,n=e.Widget),e.expr[":"][o.toLowerCase()]=function(t){return!!e.data(t,o)},e[d]=e[d]||{},s=e[d][i],r=e[d][i]=function(e,i){return this._createWidget?(arguments.length&&this._createWidget(e,i),t):new r(e,i)},e.extend(r,s,{version:a.version,_proto:e.extend({},a),_childConstructors:[]}),l=new n,l.options=e.widget.extend({},l.options),e.each(a,function(t,i){e.isFunction(i)&&(a[t]=function(){var e=function(){return n.prototype[t].apply(this,arguments)},a=function(e){return n.prototype[t].apply(this,e)};return function(){var t,n=this._super,o=this._superApply;return this._super=e,this._superApply=a,t=i.apply(this,arguments),this._super=n,this._superApply=o,t}}())}),r.prototype=e.widget.extend(l,{widgetEventPrefix:s?l.widgetEventPrefix:i},a,{constructor:r,namespace:d,widgetName:i,widgetFullName:o}),s?(e.each(s._childConstructors,function(t,i){var n=i.prototype;e.widget(n.namespace+"."+n.widgetName,r,i._proto)}),delete s._childConstructors):n._childConstructors.push(r),e.widget.bridge(i,r)},e.widget.extend=function(i){for(var a,o,s=n.call(arguments,1),r=0,l=s.length;l>r;r++)for(a in s[r])o=s[r][a],s[r].hasOwnProperty(a)&&o!==t&&(i[a]=e.isPlainObject(o)?e.isPlainObject(i[a])?e.widget.extend({},i[a],o):e.widget.extend({},o):o);return i},e.widget.bridge=function(i,a){var o=a.prototype.widgetFullName||i;e.fn[i]=function(s){var r="string"==typeof s,l=n.call(arguments,1),d=this;return s=!r&&l.length?e.widget.extend.apply(null,[s].concat(l)):s,r?this.each(function(){var n,a=e.data(this,o);return a?e.isFunction(a[s])&&"_"!==s.charAt(0)?(n=a[s].apply(a,l),n!==a&&n!==t?(d=n&&n.jquery?d.pushStack(n.get()):n,!1):t):e.error("no such method '"+s+"' for "+i+" widget instance"):e.error("cannot call methods on "+i+" prior to initialization; "+"attempted to call method '"+s+"'")}):this.each(function(){var t=e.data(this,o);t?t.option(s||{})._init():e.data(this,o,new a(s,this))}),d}},e.Widget=function(){},e.Widget._childConstructors=[],e.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",defaultElement:"<div>",options:{disabled:!1,create:null},_createWidget:function(t,n){n=e(n||this.defaultElement||this)[0],this.element=e(n),this.uuid=i++,this.eventNamespace="."+this.widgetName+this.uuid,this.options=e.widget.extend({},this.options,this._getCreateOptions(),t),this.bindings=e(),this.hoverable=e(),this.focusable=e(),n!==this&&(e.data(n,this.widgetFullName,this),this._on(!0,this.element,{remove:function(e){e.target===n&&this.destroy()}}),this.document=e(n.style?n.ownerDocument:n.document||n),this.window=e(this.document[0].defaultView||this.document[0].parentWindow)),this._create(),this._trigger("create",null,this._getCreateEventData()),this._init()},_getCreateOptions:e.noop,_getCreateEventData:e.noop,_create:e.noop,_init:e.noop,destroy:function(){this._destroy(),this.element.unbind(this.eventNamespace).removeData(this.widgetName).removeData(this.widgetFullName).removeData(e.camelCase(this.widgetFullName)),this.widget().unbind(this.eventNamespace).removeAttr("aria-disabled").removeClass(this.widgetFullName+"-disabled "+"ui-state-disabled"),this.bindings.unbind(this.eventNamespace),this.hoverable.removeClass("ui-state-hover"),this.focusable.removeClass("ui-state-focus")},_destroy:e.noop,widget:function(){return this.element},option:function(i,n){var a,o,s,r=i;if(0===arguments.length)return e.widget.extend({},this.options);if("string"==typeof i)if(r={},a=i.split("."),i=a.shift(),a.length){for(o=r[i]=e.widget.extend({},this.options[i]),s=0;a.length-1>s;s++)o[a[s]]=o[a[s]]||{},o=o[a[s]];if(i=a.pop(),n===t)return o[i]===t?null:o[i];o[i]=n}else{if(n===t)return this.options[i]===t?null:this.options[i];r[i]=n}return this._setOptions(r),this},_setOptions:function(e){var t;for(t in e)this._setOption(t,e[t]);return this},_setOption:function(e,t){return this.options[e]=t,"disabled"===e&&(this.widget().toggleClass(this.widgetFullName+"-disabled ui-state-disabled",!!t).attr("aria-disabled",t),this.hoverable.removeClass("ui-state-hover"),this.focusable.removeClass("ui-state-focus")),this},enable:function(){return this._setOption("disabled",!1)},disable:function(){return this._setOption("disabled",!0)},_on:function(i,n,a){var o,s=this;"boolean"!=typeof i&&(a=n,n=i,i=!1),a?(n=o=e(n),this.bindings=this.bindings.add(n)):(a=n,n=this.element,o=this.widget()),e.each(a,function(a,r){function l(){return i||s.options.disabled!==!0&&!e(this).hasClass("ui-state-disabled")?("string"==typeof r?s[r]:r).apply(s,arguments):t}"string"!=typeof r&&(l.guid=r.guid=r.guid||l.guid||e.guid++);var d=a.match(/^(\w+)\s*(.*)$/),c=d[1]+s.eventNamespace,h=d[2];h?o.delegate(h,c,l):n.bind(c,l)})},_off:function(e,t){t=(t||"").split(" ").join(this.eventNamespace+" ")+this.eventNamespace,e.unbind(t).undelegate(t)},_delay:function(e,t){function i(){return("string"==typeof e?n[e]:e).apply(n,arguments)}var n=this;return setTimeout(i,t||0)},_hoverable:function(t){this.hoverable=this.hoverable.add(t),this._on(t,{mouseenter:function(t){e(t.currentTarget).addClass("ui-state-hover")},mouseleave:function(t){e(t.currentTarget).removeClass("ui-state-hover")}})},_focusable:function(t){this.focusable=this.focusable.add(t),this._on(t,{focusin:function(t){e(t.currentTarget).addClass("ui-state-focus")},focusout:function(t){e(t.currentTarget).removeClass("ui-state-focus")}})},_trigger:function(t,i,n){var a,o,s=this.options[t];if(n=n||{},i=e.Event(i),i.type=(t===this.widgetEventPrefix?t:this.widgetEventPrefix+t).toLowerCase(),i.target=this.element[0],o=i.originalEvent)for(a in o)a in i||(i[a]=o[a]);return this.element.trigger(i,n),!(e.isFunction(s)&&s.apply(this.element[0],[i].concat(n))===!1||i.isDefaultPrevented())}},e.each({show:"fadeIn",hide:"fadeOut"},function(t,i){e.Widget.prototype["_"+t]=function(n,a,o){"string"==typeof a&&(a={effect:a});var s,r=a?a===!0||"number"==typeof a?i:a.effect||i:t;a=a||{},"number"==typeof a&&(a={duration:a}),s=!e.isEmptyObject(a),a.complete=o,a.delay&&n.delay(a.delay),s&&e.effects&&e.effects.effect[r]?n[t](a):r!==t&&n[r]?n[r](a.duration,a.easing,o):n.queue(function(i){e(this)[t](),o&&o.call(n[0]),i()})}})}(e),function(e,t){e.widget("mobile.widget",{_createWidget:function(){e.Widget.prototype._createWidget.apply(this,arguments),this._trigger("init")},_getCreateOptions:function(){var i=this.element,n={};return e.each(this.options,function(e){var a=i.jqmData(e.replace(/[A-Z]/g,function(e){return"-"+e.toLowerCase()}));a!==t&&(n[e]=a)}),n},enhanceWithin:function(t,i){this.enhance(e(this.options.initSelector,e(t)),i)},enhance:function(t,i){var n,a,o=e(t);o=e.mobile.enhanceable(o),i&&o.length&&(n=e.mobile.closestPageData(o),a=n&&n.keepNativeSelector()||"",o=o.not(a)),o[this.widgetName]()},raise:function(e){throw"Widget ["+this.widgetName+"]: "+e}})}(e),function(e){e.extend(e.mobile,{loadingMessageTextVisible:n,loadingMessageTheme:n,loadingMessage:n,showPageLoadingMsg:function(t,i,n){e.mobile.loading("show",t,i,n)},hidePageLoadingMsg:function(){e.mobile.loading("hide")},loading:function(){this.loaderWidget.loader.apply(this.loaderWidget,arguments)}});var t="ui-loader",i=e("html"),a=e.mobile.window;e.widget("mobile.loader",{options:{theme:"a",textVisible:!1,html:"",text:"loading"},defaultHtml:"<div class='"+t+"'>"+"<span class='ui-icon ui-icon-loading'></span>"+"<h1></h1>"+"</div>",fakeFixLoader:function(){var t=e("."+e.mobile.activeBtnClass).first();this.element.css({top:e.support.scrollTop&&a.scrollTop()+a.height()/2||t.length&&t.offset().top||100})},checkLoaderPosition:function(){var t=this.element.offset(),i=a.scrollTop(),n=e.mobile.getScreenHeight();(i>t.top||t.top-i>n)&&(this.element.addClass("ui-loader-fakefix"),this.fakeFixLoader(),a.unbind("scroll",this.checkLoaderPosition).bind("scroll",e.proxy(this.fakeFixLoader,this)))},resetHtml:function(){this.element.html(e(this.defaultHtml).html())},show:function(o,s,r){var l,d,c;this.resetHtml(),"object"===e.type(o)?(c=e.extend({},this.options,o),o=c.theme||e.mobile.loadingMessageTheme):(c=this.options,o=o||e.mobile.loadingMessageTheme||c.theme),d=s||e.mobile.loadingMessage||c.text,i.addClass("ui-loading"),(e.mobile.loadingMessage!==!1||c.html)&&(l=e.mobile.loadingMessageTextVisible!==n?e.mobile.loadingMessageTextVisible:c.textVisible,this.element.attr("class",t+" ui-corner-all ui-body-"+o+" ui-loader-"+(l||s||o.text?"verbose":"default")+(c.textonly||r?" ui-loader-textonly":"")),c.html?this.element.html(c.html):this.element.find("h1").text(d),this.element.appendTo(e.mobile.pageContainer),this.checkLoaderPosition(),a.bind("scroll",e.proxy(this.checkLoaderPosition,this)))},hide:function(){i.removeClass("ui-loading"),e.mobile.loadingMessage&&this.element.removeClass("ui-loader-fakefix"),e.mobile.window.unbind("scroll",this.fakeFixLoader),e.mobile.window.unbind("scroll",this.checkLoaderPosition)}}),a.bind("pagecontainercreate",function(){e.mobile.loaderWidget=e.mobile.loaderWidget||e(e.mobile.loader.prototype.defaultHtml).loader()})}(e,this),function(e,t,n){function a(e){return e=e||location.href,"#"+e.replace(/^[^#]*#?(.*)$/,"$1")}var o,s="hashchange",r=i,l=e.event.special,d=r.documentMode,c="on"+s in t&&(d===n||d>7);e.fn[s]=function(e){return e?this.bind(s,e):this.trigger(s)},e.fn[s].delay=50,l[s]=e.extend(l[s],{setup:function(){return c?!1:(e(o.start),n)},teardown:function(){return c?!1:(e(o.stop),n)}}),o=function(){function i(){var n=a(),r=p(d);n!==d?(u(d=n,r),e(t).trigger(s)):r!==d&&(location.href=location.href.replace(/#.*/,"")+r),o=setTimeout(i,e.fn[s].delay)}var o,l={},d=a(),h=function(e){return e},u=h,p=h;return l.start=function(){o||i()},l.stop=function(){o&&clearTimeout(o),o=n},t.attachEvent&&!t.addEventListener&&!c&&function(){var t,n;l.start=function(){t||(n=e.fn[s].src,n=n&&n+a(),t=e('<iframe tabindex="-1" title="empty"/>').hide().one("load",function(){n||u(a()),i()}).attr("src",n||"javascript:0").insertAfter("body")[0].contentWindow,r.onpropertychange=function(){try{"title"===event.propertyName&&(t.document.title=r.title)}catch(e){}})},l.stop=h,p=function(){return a(t.location.href)},u=function(i,n){var a=t.document,o=e.fn[s].domain;i!==n&&(a.title=r.title,a.open(),o&&a.write('<script>document.domain="'+o+'"</script>'),a.close(),t.location.hash=i)}}(),l}()}(e,this),function(e){t.matchMedia=t.matchMedia||function(e){var t,i=e.documentElement,n=i.firstElementChild||i.firstChild,a=e.createElement("body"),o=e.createElement("div");return o.id="mq-test-1",o.style.cssText="position:absolute;top:-100em",a.style.background="none",a.appendChild(o),function(e){return o.innerHTML='&shy;<style media="'+e+'"> #mq-test-1 { width: 42px; }</style>',i.insertBefore(a,n),t=42===o.offsetWidth,i.removeChild(a),{matches:t,media:e}}}(i),e.mobile.media=function(e){return t.matchMedia(e).matches}}(e),function(e){var t={touch:"ontouchend"in i};e.mobile.support=e.mobile.support||{},e.extend(e.support,t),e.extend(e.mobile.support,t)}(e),function(e){e.extend(e.support,{orientation:"orientation"in t&&"onorientationchange"in t})}(e),function(e,n){function a(e){var t=e.charAt(0).toUpperCase()+e.substr(1),i=(e+" "+p.join(t+" ")+t).split(" ");for(var a in i)if(u[i[a]]!==n)return!0}function o(e,t,n){for(var a,o=i.createElement("div"),s=function(e){return e.charAt(0).toUpperCase()+e.substr(1)},r=function(e){return""===e?"":"-"+e.charAt(0).toLowerCase()+e.substr(1)+"-"},l=function(i){var n=r(i)+e+": "+t+";",l=s(i),d=l+(""===l?e:s(e));o.setAttribute("style",n),o.style[d]&&(a=!0)},d=n?n:p,c=0;d.length>c;c++)l(d[c]);return!!a}function s(){var a="transform-3d",o=e.mobile.media("(-"+p.join("-"+a+"),(-")+"-"+a+"),("+a+")");if(o)return!!o;var s=i.createElement("div"),r={MozTransform:"-moz-transform",transform:"transform"};h.append(s);for(var l in r)s.style[l]!==n&&(s.style[l]="translate3d( 100px, 1px, 1px )",o=t.getComputedStyle(s).getPropertyValue(r[l]));return!!o&&"none"!==o}function r(){var t,i,n=location.protocol+"//"+location.host+location.pathname+"ui-dir/",a=e("head base"),o=null,s="";return a.length?s=a.attr("href"):a=o=e("<base>",{href:n}).appendTo("head"),t=e("<a href='testurl' />").prependTo(h),i=t[0].href,a[0].href=s||location.pathname,o&&o.remove(),0===i.indexOf(n)}function l(){var e,n=i.createElement("x"),a=i.documentElement,o=t.getComputedStyle;return"pointerEvents"in n.style?(n.style.pointerEvents="auto",n.style.pointerEvents="x",a.appendChild(n),e=o&&"auto"===o(n,"").pointerEvents,a.removeChild(n),!!e):!1}function d(){var e=i.createElement("div");return e.getBoundingClientRect!==n}function c(){var e=t,i=navigator.userAgent,n=navigator.platform,a=i.match(/AppleWebKit\/([0-9]+)/),o=!!a&&a[1],s=i.match(/Fennec\/([0-9]+)/),r=!!s&&s[1],l=i.match(/Opera Mobi\/([0-9]+)/),d=!!l&&l[1];return(n.indexOf("iPhone")>-1||n.indexOf("iPad")>-1||n.indexOf("iPod")>-1)&&o&&534>o||e.operamini&&"[object OperaMini]"==={}.toString.call(e.operamini)||l&&7458>d||i.indexOf("Android")>-1&&o&&533>o||r&&6>r||"palmGetResource"in t&&o&&534>o||i.indexOf("MeeGo")>-1&&i.indexOf("NokiaBrowser/8.5.0")>-1?!1:!0}var h=e("<body>").prependTo("html"),u=h[0].style,p=["Webkit","Moz","O"],m="palmGetResource"in t,f=t.opera,g=t.operamini&&"[object OperaMini]"==={}.toString.call(t.operamini),b=t.blackberry&&!a("-webkit-transform");e.extend(e.mobile,{browser:{}}),e.mobile.browser.oldIE=function(){var e=3,t=i.createElement("div"),n=t.all||[];do t.innerHTML="<!--[if gt IE "+ ++e+"]><br><![endif]-->";while(n[0]);return e>4?e:!e}(),e.extend(e.support,{cssTransitions:"WebKitTransitionEvent"in t||o("transition","height 100ms linear",["Webkit","Moz",""])&&!e.mobile.browser.oldIE&&!f,pushState:"pushState"in history&&"replaceState"in history&&!(t.navigator.userAgent.indexOf("Firefox")>=0&&t.top!==t)&&-1===t.navigator.userAgent.search(/CriOS/),mediaquery:e.mobile.media("only all"),cssPseudoElement:!!a("content"),touchOverflow:!!a("overflowScrolling"),cssTransform3d:s(),boxShadow:!!a("boxShadow")&&!b,fixedPosition:c(),scrollTop:("pageXOffset"in t||"scrollTop"in i.documentElement||"scrollTop"in h[0])&&!m&&!g,dynamicBaseTag:r(),cssPointerEvents:l(),boundingRect:d()}),h.remove();var v=function(){var e=t.navigator.userAgent;return e.indexOf("Nokia")>-1&&(e.indexOf("Symbian/3")>-1||e.indexOf("Series60/5")>-1)&&e.indexOf("AppleWebKit")>-1&&e.match(/(BrowserNG|NokiaBrowser)\/7\.[0-3]/)}();e.mobile.gradeA=function(){return(e.support.mediaquery||e.mobile.browser.oldIE&&e.mobile.browser.oldIE>=7)&&(e.support.boundingRect||null!==e.fn.jquery.match(/1\.[0-7+]\.[0-9+]?/))},e.mobile.ajaxBlacklist=t.blackberry&&!t.WebKitPoint||g||v,v&&e(function(){e("head link[rel='stylesheet']").attr("rel","alternate stylesheet").attr("rel","stylesheet")}),e.support.boxShadow||e("html").addClass("ui-mobile-nosupport-boxshadow")}(e),function(e,t){var i,n=e.mobile.window;e.event.special.navigate=i={bound:!1,pushStateEnabled:!0,originalEventName:t,isPushStateEnabled:function(){return e.support.pushState&&e.mobile.pushStateEnabled===!0&&this.isHashChangeEnabled()},isHashChangeEnabled:function(){return e.mobile.hashListeningEnabled===!0},popstate:function(t){var i=new e.Event("navigate"),a=new e.Event("beforenavigate"),o=t.originalEvent.state||{};location.href,n.trigger(a),a.isDefaultPrevented()||(t.historyState&&e.extend(o,t.historyState),i.originalEvent=t,setTimeout(function(){n.trigger(i,{state:o})},0))},hashchange:function(t){var i=new e.Event("navigate"),a=new e.Event("beforenavigate");n.trigger(a),a.isDefaultPrevented()||(i.originalEvent=t,n.trigger(i,{state:t.hashchangeState||{}}))},setup:function(){i.bound||(i.bound=!0,i.isPushStateEnabled()?(i.originalEventName="popstate",n.bind("popstate.navigate",i.popstate)):i.isHashChangeEnabled()&&(i.originalEventName="hashchange",n.bind("hashchange.navigate",i.hashchange)))}}}(e),function(e,i){var n,a,o="&ui-state=dialog";e.mobile.path=n={uiStateKey:"&ui-state",urlParseRE:/^\s*(((([^:\/#\?]+:)?(?:(\/\/)((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/,getLocation:function(e){var t=e?this.parseUrl(e):location,i=this.parseUrl(e||location.href).hash;return i="#"===i?"":i,t.protocol+"//"+t.host+t.pathname+t.search+i},parseLocation:function(){return this.parseUrl(this.getLocation())},parseUrl:function(t){if("object"===e.type(t))return t;var i=n.urlParseRE.exec(t||"")||[];return{href:i[0]||"",hrefNoHash:i[1]||"",hrefNoSearch:i[2]||"",domain:i[3]||"",protocol:i[4]||"",doubleSlash:i[5]||"",authority:i[6]||"",username:i[8]||"",password:i[9]||"",host:i[10]||"",hostname:i[11]||"",port:i[12]||"",pathname:i[13]||"",directory:i[14]||"",filename:i[15]||"",search:i[16]||"",hash:i[17]||""}},makePathAbsolute:function(e,t){if(e&&"/"===e.charAt(0))return e;e=e||"",t=t?t.replace(/^\/|(\/[^\/]*|[^\/]+)$/g,""):"";for(var i=t?t.split("/"):[],n=e.split("/"),a=0;n.length>a;a++){var o=n[a];switch(o){case".":break;case"..":i.length&&i.pop();break;default:i.push(o)}}return"/"+i.join("/")},isSameDomain:function(e,t){return n.parseUrl(e).domain===n.parseUrl(t).domain},isRelativeUrl:function(e){return""===n.parseUrl(e).protocol},isAbsoluteUrl:function(e){return""!==n.parseUrl(e).protocol},makeUrlAbsolute:function(e,t){if(!n.isRelativeUrl(e))return e;t===i&&(t=this.documentBase);var a=n.parseUrl(e),o=n.parseUrl(t),s=a.protocol||o.protocol,r=a.protocol?a.doubleSlash:a.doubleSlash||o.doubleSlash,l=a.authority||o.authority,d=""!==a.pathname,c=n.makePathAbsolute(a.pathname||o.filename,o.pathname),h=a.search||!d&&o.search||"",u=a.hash;return s+r+l+c+h+u},addSearchParams:function(t,i){var a=n.parseUrl(t),o="object"==typeof i?e.param(i):i,s=a.search||"?";return a.hrefNoSearch+s+("?"!==s.charAt(s.length-1)?"&":"")+o+(a.hash||"")},convertUrlToDataUrl:function(e){var i=n.parseUrl(e);return n.isEmbeddedPage(i)?i.hash.split(o)[0].replace(/^#/,"").replace(/\?.*$/,""):n.isSameDomain(i,this.documentBase)?i.hrefNoHash.replace(this.documentBase.domain,"").split(o)[0]:t.decodeURIComponent(e)},get:function(e){return e===i&&(e=n.parseLocation().hash),n.stripHash(e).replace(/[^\/]*\.[^\/*]+$/,"")},set:function(e){location.hash=e},isPath:function(e){return/\//.test(e)},clean:function(e){return e.replace(this.documentBase.domain,"")},stripHash:function(e){return e.replace(/^#/,"")},stripQueryParams:function(e){return e.replace(/\?.*$/,"")},cleanHash:function(e){return n.stripHash(e.replace(/\?.*$/,"").replace(o,""))},isHashValid:function(e){return/^#[^#]+$/.test(e)},isExternal:function(e){var t=n.parseUrl(e);return t.protocol&&t.domain!==this.documentUrl.domain?!0:!1},hasProtocol:function(e){return/^(:?\w+:)/.test(e)},isEmbeddedPage:function(e){var t=n.parseUrl(e);return""!==t.protocol?!this.isPath(t.hash)&&t.hash&&(t.hrefNoHash===this.documentUrl.hrefNoHash||this.documentBaseDiffers&&t.hrefNoHash===this.documentBase.hrefNoHash):/^#/.test(t.href)},squash:function(e,t){var i,a,o,s,r=this.isPath(e),l=this.parseUrl(e),d=l.hash,c="";return t=t||(n.isPath(e)?n.getLocation():n.getDocumentUrl()),a=r?n.stripHash(e):e,a=n.isPath(l.hash)?n.stripHash(l.hash):a,s=a.indexOf(this.uiStateKey),s>-1&&(c=a.slice(s),a=a.slice(0,s)),i=n.makeUrlAbsolute(a,t),o=this.parseUrl(i).search,r?((n.isPath(d)||0===d.replace("#","").indexOf(this.uiStateKey))&&(d=""),c&&-1===d.indexOf(this.uiStateKey)&&(d+=c),-1===d.indexOf("#")&&""!==d&&(d="#"+d),i=n.parseUrl(i),i=i.protocol+"//"+i.host+i.pathname+o+d):i+=i.indexOf("#")>-1?c:"#"+c,i},isPreservableHash:function(e){return 0===e.replace("#","").indexOf(this.uiStateKey)}},n.documentUrl=n.parseLocation(),a=e("head").find("base"),n.documentBase=a.length?n.parseUrl(n.makeUrlAbsolute(a.attr("href"),n.documentUrl.href)):n.documentUrl,n.documentBaseDiffers=n.documentUrl.hrefNoHash!==n.documentBase.hrefNoHash,n.getDocumentUrl=function(t){return t?e.extend({},n.documentUrl):n.documentUrl.href},n.getDocumentBase=function(t){return t?e.extend({},n.documentBase):n.documentBase.href}}(e),function(e,t){e.mobile.path,e.mobile.History=function(e,t){this.stack=e||[],this.activeIndex=t||0},e.extend(e.mobile.History.prototype,{getActive:function(){return this.stack[this.activeIndex]},getLast:function(){return this.stack[this.previousIndex]},getNext:function(){return this.stack[this.activeIndex+1]},getPrev:function(){return this.stack[this.activeIndex-1]},add:function(e,t){t=t||{},this.getNext()&&this.clearForward(),t.hash&&-1===t.hash.indexOf("#")&&(t.hash="#"+t.hash),t.url=e,this.stack.push(t),this.activeIndex=this.stack.length-1},clearForward:function(){this.stack=this.stack.slice(0,this.activeIndex+1)},find:function(e,t,i){t=t||this.stack;var n,a,o,s=t.length;for(a=0;s>a;a++)if(n=t[a],(decodeURIComponent(e)===decodeURIComponent(n.url)||decodeURIComponent(e)===decodeURIComponent(n.hash))&&(o=a,i))return o;return o},closest:function(e){var i,n=this.activeIndex;return i=this.find(e,this.stack.slice(0,n)),i===t&&(i=this.find(e,this.stack.slice(n),!0),i=i===t?i:i+n),i},direct:function(i){var n=this.closest(i.url),a=this.activeIndex;n!==t&&(this.activeIndex=n,this.previousIndex=a),a>n?(i.present||i.back||e.noop)(this.getActive(),"back"):n>a?(i.present||i.forward||e.noop)(this.getActive(),"forward"):n===t&&i.missing&&i.missing(this.getActive())}})}(e),function(e){var a=e.mobile.path,o=location.href;e.mobile.Navigator=function(t){this.history=t,this.ignoreInitialHashChange=!0,e.mobile.window.bind({"popstate.history":e.proxy(this.popstate,this),"hashchange.history":e.proxy(this.hashchange,this)})},e.extend(e.mobile.Navigator.prototype,{squash:function(n,o){var s,r,l=a.isPath(n)?a.stripHash(n):n;return r=a.squash(n),s=e.extend({hash:l,url:r},o),t.history.replaceState(s,s.title||i.title,r),s},hash:function(e,t){var i,n,o;if(i=a.parseUrl(e),n=a.parseLocation(),n.pathname+n.search===i.pathname+i.search)o=i.hash?i.hash:i.pathname+i.search;else if(a.isPath(e)){var s=a.parseUrl(t);o=s.pathname+s.search+(a.isPreservableHash(s.hash)?s.hash.replace("#",""):"")}else o=e;return o},go:function(n,o,s){var r,l,d,c,h=e.event.special.navigate.isPushStateEnabled();l=a.squash(n),d=this.hash(n,l),s&&d!==a.stripHash(a.parseLocation().hash)&&(this.preventNextHashChange=s),this.preventHashAssignPopState=!0,t.location.hash=d,this.preventHashAssignPopState=!1,r=e.extend({url:l,hash:d,title:i.title},o),h&&(c=new e.Event("popstate"),c.originalEvent={type:"popstate",state:null},this.squash(n,r),s||(this.ignorePopState=!0,e.mobile.window.trigger(c))),this.history.add(r.url,r)},popstate:function(t){var i,s;if(e.event.special.navigate.isPushStateEnabled())return this.preventHashAssignPopState?(this.preventHashAssignPopState=!1,t.stopImmediatePropagation(),n):this.ignorePopState?(this.ignorePopState=!1,n):!t.originalEvent.state&&1===this.history.stack.length&&this.ignoreInitialHashChange&&(this.ignoreInitialHashChange=!1,location.href===o)?(t.preventDefault(),n):(i=a.parseLocation().hash,!t.originalEvent.state&&i?(s=this.squash(i),this.history.add(s.url,s),t.historyState=s,n):(this.history.direct({url:(t.originalEvent.state||{}).url||i,present:function(i,n){t.historyState=e.extend({},i),t.historyState.direction=n}}),n))},hashchange:function(t){var o,s;if(e.event.special.navigate.isHashChangeEnabled()&&!e.event.special.navigate.isPushStateEnabled()){if(this.preventNextHashChange)return this.preventNextHashChange=!1,t.stopImmediatePropagation(),n;o=this.history,s=a.parseLocation().hash,this.history.direct({url:s,present:function(i,n){t.hashchangeState=e.extend({},i),t.hashchangeState.direction=n},missing:function(){o.add(s,{hash:s,title:i.title})}})}}})}(e),function(e){e.mobile.navigate=function(t,i,n){e.mobile.navigate.navigator.go(t,i,n)},e.mobile.navigate.history=new e.mobile.History,e.mobile.navigate.navigator=new e.mobile.Navigator(e.mobile.navigate.history);var t=e.mobile.path.parseLocation();e.mobile.navigate.history.add(t.href,{hash:t.hash})}(e),function(e,t,i,n){function a(e){for(;e&&e.originalEvent!==n;)e=e.originalEvent;return e}function o(t,i){var o,s,r,l,d,c,h,u,p,m=t.type;if(t=e.Event(t),t.type=i,o=t.originalEvent,s=e.event.props,m.search(/^(mouse|click)/)>-1&&(s=q),o)for(h=s.length,l;h;)l=s[--h],t[l]=o[l];if(m.search(/mouse(down|up)|click/)>-1&&!t.which&&(t.which=1),-1!==m.search(/^touch/)&&(r=a(o),m=r.touches,d=r.changedTouches,c=m&&m.length?m[0]:d&&d.length?d[0]:n))for(u=0,p=k.length;p>u;u++)l=k[u],t[l]=c[l];return t}function s(t){for(var i,n,a={};t;){i=e.data(t,T);for(n in i)i[n]&&(a[n]=a.hasVirtualBinding=!0);t=t.parentNode}return a}function r(t,i){for(var n;t;){if(n=e.data(t,T),n&&(!i||n[i]))return t;t=t.parentNode}return null}function l(){M=!1}function d(){M=!0}function c(){U=0,O.length=0,H=!1,d()}function h(){l()}function u(){p(),S=setTimeout(function(){S=0,c()},e.vmouse.resetTimerDuration)}function p(){S&&(clearTimeout(S),S=0)}function m(t,i,n){var a;return(n&&n[t]||!n&&r(i.target,t))&&(a=o(i,t),e(i.target).trigger(a)),a}function f(t){var i=e.data(t.target,D);if(!(H||U&&U===i)){var n=m("v"+t.type,t);n&&(n.isDefaultPrevented()&&t.preventDefault(),n.isPropagationStopped()&&t.stopPropagation(),n.isImmediatePropagationStopped()&&t.stopImmediatePropagation())}}function g(t){var i,n,o=a(t).touches;if(o&&1===o.length&&(i=t.target,n=s(i),n.hasVirtualBinding)){U=L++,e.data(i,D,U),p(),h(),I=!1;var r=a(t).touches[0];A=r.pageX,N=r.pageY,m("vmouseover",t,n),m("vmousedown",t,n)}}function b(e){M||(I||m("vmousecancel",e,s(e.target)),I=!0,u())}function v(t){if(!M){var i=a(t).touches[0],n=I,o=e.vmouse.moveDistanceThreshold,r=s(t.target);I=I||Math.abs(i.pageX-A)>o||Math.abs(i.pageY-N)>o,I&&!n&&m("vmousecancel",t,r),m("vmousemove",t,r),u()}}function _(e){if(!M){d();var t,i=s(e.target);if(m("vmouseup",e,i),!I){var n=m("vclick",e,i);n&&n.isDefaultPrevented()&&(t=a(e).changedTouches[0],O.push({touchID:U,x:t.clientX,y:t.clientY}),H=!0)}m("vmouseout",e,i),I=!1,u()}}function C(t){var i,n=e.data(t,T);if(n)for(i in n)if(n[i])return!0;return!1}function x(){}function y(t){var i=t.substr(1);return{setup:function(){C(this)||e.data(this,T,{});var n=e.data(this,T);n[t]=!0,j[t]=(j[t]||0)+1,1===j[t]&&B.bind(i,f),e(this).bind(i,x),F&&(j.touchstart=(j.touchstart||0)+1,1===j.touchstart&&B.bind("touchstart",g).bind("touchend",_).bind("touchmove",v).bind("scroll",b))},teardown:function(){--j[t],j[t]||B.unbind(i,f),F&&(--j.touchstart,j.touchstart||B.unbind("touchstart",g).unbind("touchmove",v).unbind("touchend",_).unbind("scroll",b));var n=e(this),a=e.data(this,T);a&&(a[t]=!1),n.unbind(i,x),C(this)||n.removeData(T)}}}var w,T="virtualMouseBindings",D="virtualTouchID",P="vmouseover vmousedown vmousemove vmouseup vclick vmouseout vmousecancel".split(" "),k="clientX clientY pageX pageY screenX screenY".split(" "),E=e.event.mouseHooks?e.event.mouseHooks.props:[],q=e.event.props.concat(E),j={},S=0,A=0,N=0,I=!1,O=[],H=!1,M=!1,F="addEventListener"in i,B=e(i),L=1,U=0;e.vmouse={moveDistanceThreshold:10,clickDistanceThreshold:10,resetTimerDuration:1500};for(var z=0;P.length>z;z++)e.event.special[P[z]]=y(P[z]);F&&i.addEventListener("click",function(t){var i,a,o,s,r,l,d=O.length,c=t.target;if(d)for(i=t.clientX,a=t.clientY,w=e.vmouse.clickDistanceThreshold,o=c;o;){for(s=0;d>s;s++)if(r=O[s],l=0,o===c&&w>Math.abs(r.x-i)&&w>Math.abs(r.y-a)||e.data(o,D)===r.touchID)return t.preventDefault(),t.stopPropagation(),n;o=o.parentNode}},!0)}(e,t,i),function(e,t,n){function a(t,i,n){var a=n.type;n.type=i,e.event.dispatch.call(t,n),n.type=a}var o=e(i);e.each("touchstart touchmove touchend tap taphold swipe swipeleft swiperight scrollstart scrollstop".split(" "),function(t,i){e.fn[i]=function(e){return e?this.bind(i,e):this.trigger(i)},e.attrFn&&(e.attrFn[i]=!0)});var s=e.mobile.support.touch,r="touchmove scroll",l=s?"touchstart":"mousedown",d=s?"touchend":"mouseup",c=s?"touchmove":"mousemove";e.event.special.scrollstart={enabled:!0,setup:function(){function t(e,t){i=t,a(o,i?"scrollstart":"scrollstop",e)}var i,n,o=this,s=e(o);s.bind(r,function(a){e.event.special.scrollstart.enabled&&(i||t(a,!0),clearTimeout(n),n=setTimeout(function(){t(a,!1)},50))})}},e.event.special.tap={tapholdThreshold:750,setup:function(){var t=this,i=e(t);i.bind("vmousedown",function(n){function s(){clearTimeout(d)}function r(){s(),i.unbind("vclick",l).unbind("vmouseup",s),o.unbind("vmousecancel",r)}function l(e){r(),c===e.target&&a(t,"tap",e)}if(n.which&&1!==n.which)return!1;var d,c=n.target;n.originalEvent,i.bind("vmouseup",s).bind("vclick",l),o.bind("vmousecancel",r),d=setTimeout(function(){a(t,"taphold",e.Event("taphold",{target:c}))
},e.event.special.tap.tapholdThreshold)})}},e.event.special.swipe={scrollSupressionThreshold:30,durationThreshold:1e3,horizontalDistanceThreshold:30,verticalDistanceThreshold:75,start:function(t){var i=t.originalEvent.touches?t.originalEvent.touches[0]:t;return{time:(new Date).getTime(),coords:[i.pageX,i.pageY],origin:e(t.target)}},stop:function(e){var t=e.originalEvent.touches?e.originalEvent.touches[0]:e;return{time:(new Date).getTime(),coords:[t.pageX,t.pageY]}},handleSwipe:function(t,i){i.time-t.time<e.event.special.swipe.durationThreshold&&Math.abs(t.coords[0]-i.coords[0])>e.event.special.swipe.horizontalDistanceThreshold&&Math.abs(t.coords[1]-i.coords[1])<e.event.special.swipe.verticalDistanceThreshold&&t.origin.trigger("swipe").trigger(t.coords[0]>i.coords[0]?"swipeleft":"swiperight")},setup:function(){var t=this,i=e(t);i.bind(l,function(t){function a(t){s&&(o=e.event.special.swipe.stop(t),Math.abs(s.coords[0]-o.coords[0])>e.event.special.swipe.scrollSupressionThreshold&&t.preventDefault())}var o,s=e.event.special.swipe.start(t);i.bind(c,a).one(d,function(){i.unbind(c,a),s&&o&&e.event.special.swipe.handleSwipe(s,o),s=o=n})})}},e.each({scrollstop:"scrollstart",taphold:"tap",swipeleft:"swipe",swiperight:"swipe"},function(t,i){e.event.special[t]={setup:function(){e(this).bind(i,e.noop)}}})}(e,this),function(e){e.event.special.throttledresize={setup:function(){e(this).bind("resize",o)},teardown:function(){e(this).unbind("resize",o)}};var t,i,n,a=250,o=function(){i=(new Date).getTime(),n=i-s,n>=a?(s=i,e(this).trigger("throttledresize")):(t&&clearTimeout(t),t=setTimeout(o,a-n))},s=0}(e),function(e,t){function a(){var e=o();e!==s&&(s=e,d.trigger(c))}var o,s,r,l,d=e(t),c="orientationchange",h={0:!0,180:!0};if(e.support.orientation){var u=t.innerWidth||d.width(),p=t.innerHeight||d.height(),m=50;r=u>p&&u-p>m,l=h[t.orientation],(r&&l||!r&&!l)&&(h={"-90":!0,90:!0})}e.event.special.orientationchange=e.extend({},e.event.special.orientationchange,{setup:function(){return e.support.orientation&&!e.event.special.orientationchange.disabled?!1:(s=o(),d.bind("throttledresize",a),n)},teardown:function(){return e.support.orientation&&!e.event.special.orientationchange.disabled?!1:(d.unbind("throttledresize",a),n)},add:function(e){var t=e.handler;e.handler=function(e){return e.orientation=o(),t.apply(this,arguments)}}}),e.event.special.orientationchange.orientation=o=function(){var n=!0,a=i.documentElement;return n=e.support.orientation?h[t.orientation]:a&&1.1>a.clientWidth/a.clientHeight,n?"portrait":"landscape"},e.fn[c]=function(e){return e?this.bind(c,e):this.trigger(c)},e.attrFn&&(e.attrFn[c]=!0)}(e,this),function(e){e.widget("mobile.page",e.mobile.widget,{options:{theme:"c",domCache:!1,keepNativeDefault:":jqmData(role='none'), :jqmData(role='nojs')"},_create:function(){return this._trigger("beforecreate")===!1?!1:(this.element.attr("tabindex","0").addClass("ui-page ui-body-"+this.options.theme),this._on(this.element,{pagebeforehide:"removeContainerBackground",pagebeforeshow:"_handlePageBeforeShow"}),n)},_handlePageBeforeShow:function(){this.setContainerBackground()},removeContainerBackground:function(){e.mobile.pageContainer.removeClass("ui-overlay-"+e.mobile.getInheritedTheme(this.element.parent()))},setContainerBackground:function(t){this.options.theme&&e.mobile.pageContainer.addClass("ui-overlay-"+(t||this.options.theme))},keepNativeSelector:function(){var t=this.options,i=t.keepNative&&e.trim(t.keepNative);return i&&t.keepNative!==t.keepNativeDefault?[t.keepNative,t.keepNativeDefault].join(", "):t.keepNativeDefault}})}(e),function(e,t,i){var n=function(n){return n===i&&(n=!0),function(i,a,o,s){var r=new e.Deferred,l=a?" reverse":"",d=e.mobile.urlHistory.getActive(),c=d.lastScroll||e.mobile.defaultHomeScroll,h=e.mobile.getScreenHeight(),u=e.mobile.maxTransitionWidth!==!1&&e.mobile.window.width()>e.mobile.maxTransitionWidth,p=!e.support.cssTransitions||u||!i||"none"===i||Math.max(e.mobile.window.scrollTop(),c)>e.mobile.getMaxScrollForTransition(),m=" ui-page-pre-in",f=function(){e.mobile.pageContainer.toggleClass("ui-mobile-viewport-transitioning viewport-"+i)},g=function(){e.event.special.scrollstart.enabled=!1,t.scrollTo(0,c),setTimeout(function(){e.event.special.scrollstart.enabled=!0},150)},b=function(){s.removeClass(e.mobile.activePageClass+" out in reverse "+i).height("")},v=function(){n?s.animationComplete(_):_(),s.height(h+e.mobile.window.scrollTop()).addClass(i+" out"+l)},_=function(){s&&n&&b(),C()},C=function(){o.css("z-index",-10),o.addClass(e.mobile.activePageClass+m),e.mobile.focusPage(o),o.height(h+c),g(),o.css("z-index",""),p||o.animationComplete(x),o.removeClass(m).addClass(i+" in"+l),p&&x()},x=function(){n||s&&b(),o.removeClass("out in reverse "+i).height(""),f(),e.mobile.window.scrollTop()!==c&&g(),r.resolve(i,a,o,s,!0)};return f(),s&&!p?v():_(),r.promise()}},a=n(),o=n(!1),s=function(){return 3*e.mobile.getScreenHeight()};e.mobile.defaultTransitionHandler=a,e.mobile.transitionHandlers={"default":e.mobile.defaultTransitionHandler,sequential:a,simultaneous:o},e.mobile.transitionFallbacks={},e.mobile._maybeDegradeTransition=function(t){return t&&!e.support.cssTransform3d&&e.mobile.transitionFallbacks[t]&&(t=e.mobile.transitionFallbacks[t]),t},e.mobile.getMaxScrollForTransition=e.mobile.getMaxScrollForTransition||s}(e,this),function(e,n){function a(t){!f||f.closest("."+e.mobile.activePageClass).length&&!t||f.removeClass(e.mobile.activeBtnClass),f=null}function o(){_=!1,v.length>0&&e.mobile.changePage.apply(null,v.pop())}function s(t,i,n,a){i&&i.data("mobile-page")._trigger("beforehide",null,{nextPage:t}),t.data("mobile-page")._trigger("beforeshow",null,{prevPage:i||e("")}),e.mobile.hidePageLoadingMsg(),n=e.mobile._maybeDegradeTransition(n);var o=e.mobile.transitionHandlers[n||"default"]||e.mobile.defaultTransitionHandler,s=o(n,a,t,i);return s.done(function(){i&&i.data("mobile-page")._trigger("hide",null,{nextPage:t}),t.data("mobile-page")._trigger("show",null,{prevPage:i||e("")})}),s}function r(t,i){i&&t.attr("data-"+e.mobile.ns+"role",i),t.page()}function l(){var t=e.mobile.activePage&&c(e.mobile.activePage);return t||w.hrefNoHash}function d(e){for(;e&&("string"!=typeof e.nodeName||"a"!==e.nodeName.toLowerCase());)e=e.parentNode;return e}function c(t){var i=e(t).closest(".ui-page").jqmData("url"),n=w.hrefNoHash;return i&&p.isPath(i)||(i=n),p.makeUrlAbsolute(i,n)}var h=e.mobile.window,u=(e("html"),e("head")),p=e.extend(e.mobile.path,{getFilePath:function(t){var i="&"+e.mobile.subPageUrlKey;return t&&t.split(i)[0].split(C)[0]},isFirstPageUrl:function(t){var i=p.parseUrl(p.makeUrlAbsolute(t,this.documentBase)),a=i.hrefNoHash===this.documentUrl.hrefNoHash||this.documentBaseDiffers&&i.hrefNoHash===this.documentBase.hrefNoHash,o=e.mobile.firstPage,s=o&&o[0]?o[0].id:n;return a&&(!i.hash||"#"===i.hash||s&&i.hash.replace(/^#/,"")===s)},isPermittedCrossDomainRequest:function(t,i){return e.mobile.allowCrossDomainPages&&"file:"===t.protocol&&-1!==i.search(/^https?:/)}}),m=null,f=null,g=e.Deferred(),b=e.mobile.navigate.history,v=[],_=!1,C="&ui-state=dialog",x=u.children("base"),y=p.documentUrl,w=p.documentBase,T=(p.documentBaseDiffers,e.mobile.getScreenHeight),D=e.support.dynamicBaseTag?{element:x.length?x:e("<base>",{href:w.hrefNoHash}).prependTo(u),set:function(e){e=p.parseUrl(e).hrefNoHash,D.element.attr("href",p.makeUrlAbsolute(e,w))},reset:function(){D.element.attr("href",w.hrefNoSearch)}}:n;e.mobile.getDocumentUrl=p.getDocumentUrl,e.mobile.getDocumentBase=p.getDocumentBase,e.mobile.back=function(){var e=t.navigator;this.phonegapNavigationEnabled&&e&&e.app&&e.app.backHistory?e.app.backHistory():t.history.back()},e.mobile.focusPage=function(e){var t=e.find("[autofocus]"),i=e.find(".ui-title:eq(0)");return t.length?(t.focus(),n):(i.length?i.focus():e.focus(),n)};var P,k,E=!0;P=function(){if(E){var t=e.mobile.urlHistory.getActive();if(t){var i=h.scrollTop();t.lastScroll=e.mobile.minScrollBack>i?e.mobile.defaultHomeScroll:i}}},k=function(){setTimeout(P,100)},h.bind(e.support.pushState?"popstate":"hashchange",function(){E=!1}),h.one(e.support.pushState?"popstate":"hashchange",function(){E=!0}),h.one("pagecontainercreate",function(){e.mobile.pageContainer.bind("pagechange",function(){E=!0,h.unbind("scrollstop",k),h.bind("scrollstop",k)})}),h.bind("scrollstop",k),e.mobile._maybeDegradeTransition=e.mobile._maybeDegradeTransition||function(e){return e},e.mobile.resetActivePageHeight=function(t){var i=e("."+e.mobile.activePageClass),n=parseFloat(i.css("padding-top")),a=parseFloat(i.css("padding-bottom")),o=parseFloat(i.css("border-top-width")),s=parseFloat(i.css("border-bottom-width"));t="number"==typeof t?t:T(),i.css("min-height",t-n-a-o-s)},e.fn.animationComplete=function(t){return e.support.cssTransitions?e(this).one("webkitAnimationEnd animationend",t):(setTimeout(t,0),e(this))},e.mobile.path=p,e.mobile.base=D,e.mobile.urlHistory=b,e.mobile.dialogHashKey=C,e.mobile.allowCrossDomainPages=!1,e.mobile._bindPageRemove=function(){var t=e(this);!t.data("mobile-page").options.domCache&&t.is(":jqmData(external-page='true')")&&t.bind("pagehide.remove",function(){var t=e(this),i=new e.Event("pageremove");t.trigger(i),i.isDefaultPrevented()||t.removeWithDependents()})},e.mobile.loadPage=function(t,i){var a=e.Deferred(),o=e.extend({},e.mobile.loadPage.defaults,i),s=null,d=null,c=p.makeUrlAbsolute(t,l());o.data&&"get"===o.type&&(c=p.addSearchParams(c,o.data),o.data=n),o.data&&"post"===o.type&&(o.reloadPage=!0);var h=p.getFilePath(c),u=p.convertUrlToDataUrl(c);if(o.pageContainer=o.pageContainer||e.mobile.pageContainer,s=o.pageContainer.children("[data-"+e.mobile.ns+"url='"+u+"']"),0===s.length&&u&&!p.isPath(u)&&(s=o.pageContainer.children("#"+u).attr("data-"+e.mobile.ns+"url",u).jqmData("url",u)),0===s.length)if(e.mobile.firstPage&&p.isFirstPageUrl(h))e.mobile.firstPage.parent().length&&(s=e(e.mobile.firstPage));else if(p.isEmbeddedPage(h))return a.reject(c,i),a.promise();if(s.length){if(!o.reloadPage)return r(s,o.role),a.resolve(c,i,s),D&&!i.prefetch&&D.set(t),a.promise();d=s}var m=o.pageContainer,f=new e.Event("pagebeforeload"),g={url:t,absUrl:c,dataUrl:u,deferred:a,options:o};if(m.trigger(f,g),f.isDefaultPrevented())return a.promise();if(o.showLoadMsg)var b=setTimeout(function(){e.mobile.showPageLoadingMsg()},o.loadMsgDelay),v=function(){clearTimeout(b),e.mobile.hidePageLoadingMsg()};return D&&i.prefetch===n&&D.reset(),e.mobile.allowCrossDomainPages||p.isSameDomain(y,c)?e.ajax({url:h,type:o.type,data:o.data,contentType:o.contentType,dataType:"html",success:function(l,m,f){var b=e("<div></div>"),_=l.match(/<title[^>]*>([^<]*)/)&&RegExp.$1,C=RegExp("(<[^>]+\\bdata-"+e.mobile.ns+"role=[\"']?page[\"']?[^>]*>)"),x=RegExp("\\bdata-"+e.mobile.ns+"url=[\"']?([^\"'>]*)[\"']?");if(C.test(l)&&RegExp.$1&&x.test(RegExp.$1)&&RegExp.$1&&(t=h=p.getFilePath(e("<div>"+RegExp.$1+"</div>").text())),D&&i.prefetch===n&&D.set(h),b.get(0).innerHTML=l,s=b.find(":jqmData(role='page'), :jqmData(role='dialog')").first(),s.length||(s=e("<div data-"+e.mobile.ns+"role='page'>"+(l.split(/<\/?body[^>]*>/gim)[1]||"")+"</div>")),_&&!s.jqmData("title")&&(~_.indexOf("&")&&(_=e("<div>"+_+"</div>").text()),s.jqmData("title",_)),!e.support.dynamicBaseTag){var y=p.get(h);s.find("[src], link[href], a[rel='external'], :jqmData(ajax='false'), a[target]").each(function(){var t=e(this).is("[href]")?"href":e(this).is("[src]")?"src":"action",i=e(this).attr(t);i=i.replace(location.protocol+"//"+location.host+location.pathname,""),/^(\w+:|#|\/)/.test(i)||e(this).attr(t,y+i)})}s.attr("data-"+e.mobile.ns+"url",p.convertUrlToDataUrl(h)).attr("data-"+e.mobile.ns+"external-page",!0).appendTo(o.pageContainer),s.one("pagecreate",e.mobile._bindPageRemove),r(s,o.role),c.indexOf("&"+e.mobile.subPageUrlKey)>-1&&(s=o.pageContainer.children("[data-"+e.mobile.ns+"url='"+u+"']")),o.showLoadMsg&&v(),g.xhr=f,g.textStatus=m,g.page=s,o.pageContainer.trigger("pageload",g),a.resolve(c,i,s,d)},error:function(t,n,s){D&&D.set(p.get()),g.xhr=t,g.textStatus=n,g.errorThrown=s;var r=new e.Event("pageloadfailed");o.pageContainer.trigger(r,g),r.isDefaultPrevented()||(o.showLoadMsg&&(v(),e.mobile.showPageLoadingMsg(e.mobile.pageLoadErrorMessageTheme,e.mobile.pageLoadErrorMessage,!0),setTimeout(e.mobile.hidePageLoadingMsg,1500)),a.reject(c,i))}}):a.reject(c,i),a.promise()},e.mobile.loadPage.defaults={type:"get",data:n,reloadPage:!1,role:n,showLoadMsg:!1,pageContainer:n,loadMsgDelay:50},e.mobile.changePage=function(t,d){if(_)return v.unshift(arguments),n;var c,h=e.extend({},e.mobile.changePage.defaults,d);h.pageContainer=h.pageContainer||e.mobile.pageContainer,h.fromPage=h.fromPage||e.mobile.activePage,c="string"==typeof t;var u=h.pageContainer,m=new e.Event("pagebeforechange"),f={toPage:t,options:h};if(f.absUrl=c?p.makeUrlAbsolute(t,l()):t.data("absUrl"),u.trigger(m,f),!m.isDefaultPrevented()){if(t=f.toPage,c="string"==typeof t,_=!0,c)return h.target=t,e.mobile.loadPage(t,h).done(function(t,i,n,a){_=!1,i.duplicateCachedPage=a,n.data("absUrl",f.absUrl),e.mobile.changePage(n,i)}).fail(function(){a(!0),o(),h.pageContainer.trigger("pagechangefailed",f)}),n;t[0]!==e.mobile.firstPage[0]||h.dataUrl||(h.dataUrl=y.hrefNoHash);var g=h.fromPage,x=h.dataUrl&&p.convertUrlToDataUrl(h.dataUrl)||t.jqmData("url"),w=x,T=(p.getFilePath(x),b.getActive()),D=0===b.activeIndex,P=0,k=i.title,E="dialog"===h.role||"dialog"===t.jqmData("role");if(g&&g[0]===t[0]&&!h.allowSamePageTransition)return _=!1,u.trigger("pagechange",f),h.fromHashChange&&b.direct({url:x}),n;r(t,h.role),h.fromHashChange&&(P="back"===d.direction?-1:1);try{i.activeElement&&"body"!==i.activeElement.nodeName.toLowerCase()?e(i.activeElement).blur():e("input:focus, textarea:focus, select:focus").blur()}catch(q){}var j=!1;E&&T&&(T.url&&T.url.indexOf(C)>-1&&e.mobile.activePage&&!e.mobile.activePage.is(".ui-dialog")&&b.activeIndex>0&&(h.changeHash=!1,j=!0),x=T.url||"",x+=!j&&x.indexOf("#")>-1?C:"#"+C,0===b.activeIndex&&x===b.initialDst&&(x+=C));var S=T?t.jqmData("title")||t.children(":jqmData(role='header')").find(".ui-title").text():k;if(S&&k===i.title&&(k=S),t.jqmData("title")||t.jqmData("title",k),h.transition=h.transition||(P&&!D?T.transition:n)||(E?e.mobile.defaultDialogTransition:e.mobile.defaultPageTransition),!P&&j&&(b.getActive().pageUrl=w),x&&!h.fromHashChange){var A;!p.isPath(x)&&0>x.indexOf("#")&&(x="#"+x),A={transition:h.transition,title:k,pageUrl:w,role:h.role},h.changeHash!==!1&&e.mobile.hashListeningEnabled?e.mobile.navigate(x,A,!0):t[0]!==e.mobile.firstPage[0]&&e.mobile.navigate.history.add(x,A)}i.title=k,e.mobile.activePage=t,h.reverse=h.reverse||0>P,s(t,g,h.transition,h.reverse).done(function(i,n,s,r,l){a(),h.duplicateCachedPage&&h.duplicateCachedPage.remove(),l||e.mobile.focusPage(t),o(),u.trigger("pagechange",f)})}},e.mobile.changePage.defaults={transition:n,reverse:!1,changeHash:!0,fromHashChange:!1,role:n,duplicateCachedPage:n,pageContainer:n,showLoadMsg:!0,dataUrl:n,fromPage:n,allowSamePageTransition:!1},e.mobile.navreadyDeferred=e.Deferred(),e.mobile._registerInternalEvents=function(){var i=function(t,i){var a,o,s,r,l=!0;return!e.mobile.ajaxEnabled||t.is(":jqmData(ajax='false')")||!t.jqmHijackable().length||t.attr("target")?!1:(a=t.attr("action"),r=(t.attr("method")||"get").toLowerCase(),a||(a=c(t),"get"===r&&(a=p.parseUrl(a).hrefNoSearch),a===w.hrefNoHash&&(a=y.hrefNoSearch)),a=p.makeUrlAbsolute(a,c(t)),p.isExternal(a)&&!p.isPermittedCrossDomainRequest(y,a)?!1:(i||(o=t.serializeArray(),m&&m[0].form===t[0]&&(s=m.attr("name"),s&&(e.each(o,function(e,t){return t.name===s?(s="",!1):n}),s&&o.push({name:s,value:m.attr("value")}))),l={url:a,options:{type:r,data:e.param(o),transition:t.jqmData("transition"),reverse:"reverse"===t.jqmData("direction"),reloadPage:!0}}),l))};e.mobile.document.delegate("form","submit",function(t){var n=i(e(this));n&&(e.mobile.changePage(n.url,n.options),t.preventDefault())}),e.mobile.document.bind("vclick",function(t){var n,o,s=t.target,r=!1;if(!(t.which>1)&&e.mobile.linkBindingEnabled){if(m=e(s),e.data(s,"mobile-button")){if(!i(e(s).closest("form"),!0))return;s.parentNode&&(s=s.parentNode)}else{if(s=d(s),!s||"#"===p.parseUrl(s.getAttribute("href")||"#").hash)return;if(!e(s).jqmHijackable().length)return}~s.className.indexOf("ui-link-inherit")?s.parentNode&&(o=e.data(s.parentNode,"buttonElements")):o=e.data(s,"buttonElements"),o?s=o.outer:r=!0,n=e(s),r&&(n=n.closest(".ui-btn")),n.length>0&&!n.hasClass("ui-disabled")&&(a(!0),f=n,f.addClass(e.mobile.activeBtnClass))}}),e.mobile.document.bind("click",function(i){if(e.mobile.linkBindingEnabled&&!i.isDefaultPrevented()){var o,s=d(i.target),r=e(s);if(s&&!(i.which>1)&&r.jqmHijackable().length){if(o=function(){t.setTimeout(function(){a(!0)},200)},r.is(":jqmData(rel='back')"))return e.mobile.back(),!1;var l=c(r),h=p.makeUrlAbsolute(r.attr("href")||"#",l);if(!e.mobile.ajaxEnabled&&!p.isEmbeddedPage(h))return o(),n;if(-1!==h.search("#")){if(h=h.replace(/[^#]*#/,""),!h)return i.preventDefault(),n;h=p.isPath(h)?p.makeUrlAbsolute(h,l):p.makeUrlAbsolute("#"+h,y.hrefNoHash)}var u=r.is("[rel='external']")||r.is(":jqmData(ajax='false')")||r.is("[target]"),m=u||p.isExternal(h)&&!p.isPermittedCrossDomainRequest(y,h);if(m)return o(),n;var f=r.jqmData("transition"),g="reverse"===r.jqmData("direction")||r.jqmData("back"),b=r.attr("data-"+e.mobile.ns+"rel")||n;e.mobile.changePage(h,{transition:f,reverse:g,role:b,link:r}),i.preventDefault()}}}),e.mobile.document.delegate(".ui-page","pageshow.prefetch",function(){var t=[];e(this).find("a:jqmData(prefetch)").each(function(){var i=e(this),n=i.attr("href");n&&-1===e.inArray(n,t)&&(t.push(n),e.mobile.loadPage(n,{role:i.attr("data-"+e.mobile.ns+"rel"),prefetch:!0}))})}),e.mobile._handleHashChange=function(i,a){var o=p.stripHash(i),s=0===e.mobile.urlHistory.stack.length?"none":n,r={changeHash:!1,fromHashChange:!0,reverse:"back"===a.direction};if(e.extend(r,a,{transition:(b.getLast()||{}).transition||s}),b.activeIndex>0&&o.indexOf(C)>-1&&b.initialDst!==o){if(e.mobile.activePage&&!e.mobile.activePage.is(".ui-dialog"))return"back"===a.direction?e.mobile.back():t.history.forward(),n;o=a.pageUrl;var l=e.mobile.urlHistory.getActive();e.extend(r,{role:l.role,transition:l.transition,reverse:"back"===a.direction})}o?(o=p.isPath(o)?o:p.makeUrlAbsolute("#"+o,w),o===p.makeUrlAbsolute("#"+b.initialDst,w)&&b.stack.length&&b.stack[0].url!==b.initialDst.replace(C,"")&&(o=e.mobile.firstPage),e.mobile.changePage(o,r)):e.mobile.changePage(e.mobile.firstPage,r)},h.bind("navigate",function(t,i){var n;t.originalEvent&&t.originalEvent.isDefaultPrevented()||(n=e.event.special.navigate.originalEventName.indexOf("hashchange")>-1?i.state.hash:i.state.url,n||(n=e.mobile.path.parseLocation().hash),n&&"#"!==n&&0!==n.indexOf("#"+e.mobile.path.uiStateKey)||(n=location.href),e.mobile._handleHashChange(n,i.state))}),e.mobile.document.bind("pageshow",e.mobile.resetActivePageHeight),e.mobile.window.bind("throttledresize",e.mobile.resetActivePageHeight)},e(function(){g.resolve()}),e.when(g,e.mobile.navreadyDeferred).done(function(){e.mobile._registerInternalEvents()})}(e),function(e){e.mobile.transitionFallbacks.flip="fade"}(e,this),function(e){e.mobile.transitionFallbacks.flow="fade"}(e,this),function(e){e.mobile.transitionFallbacks.pop="fade"}(e,this),function(e){e.mobile.transitionHandlers.slide=e.mobile.transitionHandlers.simultaneous,e.mobile.transitionFallbacks.slide="fade"}(e,this),function(e){e.mobile.transitionFallbacks.slidedown="fade"}(e,this),function(e){e.mobile.transitionFallbacks.slidefade="fade"}(e,this),function(e){e.mobile.transitionFallbacks.slideup="fade"}(e,this),function(e){e.mobile.transitionFallbacks.turn="fade"}(e,this),function(e){e.mobile.page.prototype.options.degradeInputs={color:!1,date:!1,datetime:!1,"datetime-local":!1,email:!1,month:!1,number:!1,range:"number",search:"text",tel:!1,time:!1,url:!1,week:!1},e.mobile.document.bind("pagecreate create",function(t){var i,n=e.mobile.closestPageData(e(t.target));n&&(i=n.options,e(t.target).find("input").not(n.keepNativeSelector()).each(function(){var t=e(this),n=this.getAttribute("type"),a=i.degradeInputs[n]||"text";if(i.degradeInputs[n]){var o=e("<div>").html(t.clone()).html(),s=o.indexOf(" type=")>-1,r=s?/\s+type=["']?\w+['"]?/:/\/?>/,l=' type="'+a+'" data-'+e.mobile.ns+'type="'+n+'"'+(s?"":">");t.replaceWith(o.replace(r,l))}}))})}(e),function(e){e.widget("mobile.dialog",e.mobile.widget,{options:{closeBtn:"left",closeBtnText:"Close",overlayTheme:"a",corners:!0,initSelector:":jqmData(role='dialog')"},_handlePageBeforeShow:function(){this._isCloseable=!0,this.options.overlayTheme&&this.element.page("removeContainerBackground").page("setContainerBackground",this.options.overlayTheme)},_create:function(){var t=this.element,i=this.options.corners?" ui-corner-all":"",n=e("<div/>",{role:"dialog","class":"ui-dialog-contain ui-overlay-shadow"+i});t.addClass("ui-dialog ui-overlay-"+this.options.overlayTheme),t.wrapInner(n),t.bind("vclick submit",function(t){var i,n=e(t.target).closest("vclick"===t.type?"a":"form");n.length&&!n.jqmData("transition")&&(i=e.mobile.urlHistory.getActive()||{},n.attr("data-"+e.mobile.ns+"transition",i.transition||e.mobile.defaultDialogTransition).attr("data-"+e.mobile.ns+"direction","reverse"))}),this._on(t,{pagebeforeshow:"_handlePageBeforeShow"}),e.extend(this,{_createComplete:!1}),this._setCloseBtn(this.options.closeBtn)},_setCloseBtn:function(t){var i,n,a=this;this._headerCloseButton&&(this._headerCloseButton.remove(),this._headerCloseButton=null),"none"!==t&&(n="left"===t?"left":"right",i=e("<a href='#' class='ui-btn-"+n+"' data-"+e.mobile.ns+"icon='delete' data-"+e.mobile.ns+"iconpos='notext'>"+this.options.closeBtnText+"</a>"),this.element.children().find(":jqmData(role='header')").first().prepend(i),this._createComplete&&e.fn.buttonMarkup&&i.buttonMarkup(),this._createComplete=!0,i.bind("click",function(){a.close()}),this._headerCloseButton=i)},_setOption:function(e,t){"closeBtn"===e&&this._setCloseBtn(t),this._super(e,t)},close:function(){var t,i,n=e.mobile.navigate.history;this._isCloseable&&(this._isCloseable=!1,e.mobile.hashListeningEnabled&&n.activeIndex>0?e.mobile.back():(t=Math.max(0,n.activeIndex-1),i=n.stack[t].pageUrl||n.stack[t].url,n.previousIndex=n.activeIndex,n.activeIndex=t,e.mobile.path.isPath(i)||(i=e.mobile.path.makeUrlAbsolute("#"+i)),e.mobile.changePage(i,{direction:"back",changeHash:!1,fromHashChange:!0})))}}),e.mobile.document.delegate(e.mobile.dialog.prototype.options.initSelector,"pagecreate",function(){e.mobile.dialog.prototype.enhance(this)})}(e,this),function(e){e.mobile.page.prototype.options.backBtnText="Back",e.mobile.page.prototype.options.addBackBtn=!1,e.mobile.page.prototype.options.backBtnTheme=null,e.mobile.page.prototype.options.headerTheme="a",e.mobile.page.prototype.options.footerTheme="a",e.mobile.page.prototype.options.contentTheme=null,e.mobile.document.bind("pagecreate",function(t){var i=e(t.target),n=i.data("mobile-page").options,a=i.jqmData("role"),o=n.theme;e(":jqmData(role='header'), :jqmData(role='footer'), :jqmData(role='content')",i).jqmEnhanceable().each(function(){var t,s,r,l,d=e(this),c=d.jqmData("role"),h=d.jqmData("theme"),u=h||n.contentTheme||"dialog"===a&&o;if(d.addClass("ui-"+c),"header"===c||"footer"===c){var p=h||("header"===c?n.headerTheme:n.footerTheme)||o;d.addClass("ui-bar-"+p).attr("role","header"===c?"banner":"contentinfo"),"header"===c&&(t=d.children("a, button"),s=t.hasClass("ui-btn-left"),r=t.hasClass("ui-btn-right"),s=s||t.eq(0).not(".ui-btn-right").addClass("ui-btn-left").length,r=r||t.eq(1).addClass("ui-btn-right").length),n.addBackBtn&&"header"===c&&e(".ui-page").length>1&&i.jqmData("url")!==e.mobile.path.stripHash(location.hash)&&!s&&(l=e("<a href='javascript:void(0);' class='ui-btn-left' data-"+e.mobile.ns+"rel='back' data-"+e.mobile.ns+"icon='arrow-l'>"+n.backBtnText+"</a>").attr("data-"+e.mobile.ns+"theme",n.backBtnTheme||p).prependTo(d)),d.children("h1, h2, h3, h4, h5, h6").addClass("ui-title").attr({role:"heading","aria-level":"1"})}else"content"===c&&(u&&d.addClass("ui-body-"+u),d.attr("role","main"))})})}(e),function(e,t){function n(e){for(var t;e&&(t="string"==typeof e.className&&e.className+" ",!(t&&t.indexOf("ui-btn ")>-1&&0>t.indexOf("ui-disabled ")));)e=e.parentNode;return e}function a(n,a,o,s,r){var l=e.data(n[0],"buttonElements");n.removeClass(a).addClass(o),l&&(l.bcls=e(i.createElement("div")).addClass(l.bcls+" "+o).removeClass(a).attr("class"),s!==t&&(l.hover=s),l.state=r)}var o=function(e,i){var n=e.getAttribute(i);return"true"===n?!0:"false"===n?!1:null===n?t:n};e.fn.buttonMarkup=function(n){var a,r=this,l="data-"+e.mobile.ns;n=n&&"object"===e.type(n)?n:{};for(var d=0;r.length>d;d++){var c,h,u,p,m,f,g=r.eq(d),b=g[0],v=e.extend({},e.fn.buttonMarkup.defaults,{icon:n.icon!==t?n.icon:o(b,l+"icon"),iconpos:n.iconpos!==t?n.iconpos:o(b,l+"iconpos"),theme:n.theme!==t?n.theme:o(b,l+"theme")||e.mobile.getInheritedTheme(g,"c"),inline:n.inline!==t?n.inline:o(b,l+"inline"),shadow:n.shadow!==t?n.shadow:o(b,l+"shadow"),corners:n.corners!==t?n.corners:o(b,l+"corners"),iconshadow:n.iconshadow!==t?n.iconshadow:o(b,l+"iconshadow"),mini:n.mini!==t?n.mini:o(b,l+"mini")},n),_="ui-btn-inner",C="ui-btn-text",x=!1,y="up";for(a in v)v[a]===t||null===v[a]?g.removeAttr(l+a):b.setAttribute(l+a,v[a]);for("popup"===o(b,l+"rel")&&g.attr("href")&&(b.setAttribute("aria-haspopup",!0),b.setAttribute("aria-owns",g.attr("href"))),f=e.data("INPUT"===b.tagName||"BUTTON"===b.tagName?b.parentNode:b,"buttonElements"),f?(b=f.outer,g=e(b),u=f.inner,p=f.text,e(f.icon).remove(),f.icon=null,x=f.hover,y=f.state):(u=i.createElement(v.wrapperEls),p=i.createElement(v.wrapperEls)),m=v.icon?i.createElement("span"):null,s&&!f&&s(),v.theme||(v.theme=e.mobile.getInheritedTheme(g,"c")),c="ui-btn ",c+=x?"ui-btn-hover-"+v.theme:"",c+=y?" ui-btn-"+y+"-"+v.theme:"",c+=v.shadow?" ui-shadow":"",c+=v.corners?" ui-btn-corner-all":"",v.mini!==t&&(c+=v.mini===!0?" ui-mini":" ui-fullsize"),v.inline!==t&&(c+=v.inline===!0?" ui-btn-inline":" ui-btn-block"),v.icon&&(v.icon="ui-icon-"+v.icon,v.iconpos=v.iconpos||"left",h="ui-icon "+v.icon,v.iconshadow&&(h+=" ui-icon-shadow")),v.iconpos&&(c+=" ui-btn-icon-"+v.iconpos,"notext"!==v.iconpos||g.attr("title")||g.attr("title",g.getEncodedText())),f&&g.removeClass(f.bcls||""),g.removeClass("ui-link").addClass(c),u.className=_,p.className=C,f||u.appendChild(p),m&&(m.className=h,f&&f.icon||(m.innerHTML="&#160;",u.appendChild(m)));b.firstChild&&!f;)p.appendChild(b.firstChild);f||b.appendChild(u),f={hover:x,state:y,bcls:c,outer:b,inner:u,text:p,icon:m},e.data(b,"buttonElements",f),e.data(u,"buttonElements",f),e.data(p,"buttonElements",f),m&&e.data(m,"buttonElements",f)}return this},e.fn.buttonMarkup.defaults={corners:!0,shadow:!0,iconshadow:!0,wrapperEls:"span"};var s=function(){var i,o,r=e.mobile.buttonMarkup.hoverDelay;e.mobile.document.bind({"vmousedown vmousecancel vmouseup vmouseover vmouseout focus blur scrollstart":function(s){var l,d=e(n(s.target)),c=s.originalEvent&&/^touch/.test(s.originalEvent.type),h=s.type;d.length&&(l=d.attr("data-"+e.mobile.ns+"theme"),"vmousedown"===h?c?i=setTimeout(function(){a(d,"ui-btn-up-"+l,"ui-btn-down-"+l,t,"down")},r):a(d,"ui-btn-up-"+l,"ui-btn-down-"+l,t,"down"):"vmousecancel"===h||"vmouseup"===h?a(d,"ui-btn-down-"+l,"ui-btn-up-"+l,t,"up"):"vmouseover"===h||"focus"===h?c?o=setTimeout(function(){a(d,"ui-btn-up-"+l,"ui-btn-hover-"+l,!0,"")},r):a(d,"ui-btn-up-"+l,"ui-btn-hover-"+l,!0,""):("vmouseout"===h||"blur"===h||"scrollstart"===h)&&(a(d,"ui-btn-hover-"+l+" ui-btn-down-"+l,"ui-btn-up-"+l,!1,"up"),i&&clearTimeout(i),o&&clearTimeout(o)))},"focusin focus":function(t){e(n(t.target)).addClass(e.mobile.focusClass)},"focusout blur":function(t){e(n(t.target)).removeClass(e.mobile.focusClass)}}),s=null};e.mobile.document.bind("pagecreate create",function(t){e(":jqmData(role='button'), .ui-bar > a, .ui-header > a, .ui-footer > a, .ui-bar > :jqmData(role='controlgroup') > a",t.target).jqmEnhanceable().not("button, input, .ui-btn, :jqmData(role='none'), :jqmData(role='nojs')").buttonMarkup()})}(e),function(e,t){e.widget("mobile.collapsible",e.mobile.widget,{options:{expandCueText:" click to expand contents",collapseCueText:" click to collapse contents",collapsed:!0,heading:"h1,h2,h3,h4,h5,h6,legend",collapsedIcon:"plus",expandedIcon:"minus",iconpos:"left",theme:null,contentTheme:null,inset:!0,corners:!0,mini:!1,initSelector:":jqmData(role='collapsible')"},_create:function(){var i=this.element,n=this.options,a=i.addClass("ui-collapsible"),o=i.children(n.heading).first(),s=a.wrapInner("<div class='ui-collapsible-content'></div>").children(".ui-collapsible-content"),r=i.closest(":jqmData(role='collapsible-set')").addClass("ui-collapsible-set"),l="";o.is("legend")&&(o=e("<div role='heading'>"+o.html()+"</div>").insertBefore(o),o.next().remove()),r.length?(n.theme||(n.theme=r.jqmData("theme")||e.mobile.getInheritedTheme(r,"c")),n.contentTheme||(n.contentTheme=r.jqmData("content-theme")),n.collapsedIcon=i.jqmData("collapsed-icon")||r.jqmData("collapsed-icon")||n.collapsedIcon,n.expandedIcon=i.jqmData("expanded-icon")||r.jqmData("expanded-icon")||n.expandedIcon,n.iconpos=i.jqmData("iconpos")||r.jqmData("iconpos")||n.iconpos,n.inset=r.jqmData("inset")!==t?r.jqmData("inset"):!0,n.corners=!1,n.mini||(n.mini=r.jqmData("mini"))):n.theme||(n.theme=e.mobile.getInheritedTheme(i,"c")),n.inset&&(l+=" ui-collapsible-inset",n.corners&&(l+=" ui-corner-all")),n.contentTheme&&(l+=" ui-collapsible-themed-content",s.addClass("ui-body-"+n.contentTheme)),""!==l&&a.addClass(l),o.insertBefore(s).addClass("ui-collapsible-heading").append("<span class='ui-collapsible-heading-status'></span>").wrapInner("<a href='#' class='ui-collapsible-heading-toggle'></a>").find("a").first().buttonMarkup({shadow:!1,corners:!1,iconpos:n.iconpos,icon:n.collapsedIcon,mini:n.mini,theme:n.theme}),a.bind("expand collapse",function(t){if(!t.isDefaultPrevented()){var i=e(this),a="collapse"===t.type;t.preventDefault(),o.toggleClass("ui-collapsible-heading-collapsed",a).find(".ui-collapsible-heading-status").text(a?n.expandCueText:n.collapseCueText).end().find(".ui-icon").toggleClass("ui-icon-"+n.expandedIcon,!a).toggleClass("ui-icon-"+n.collapsedIcon,a||n.expandedIcon===n.collapsedIcon).end().find("a").first().removeClass(e.mobile.activeBtnClass),i.toggleClass("ui-collapsible-collapsed",a),s.toggleClass("ui-collapsible-content-collapsed",a).attr("aria-hidden",a),s.trigger("updatelayout")}}).trigger(n.collapsed?"collapse":"expand"),o.bind("tap",function(){o.find("a").first().addClass(e.mobile.activeBtnClass)}).bind("click",function(e){var t=o.is(".ui-collapsible-heading-collapsed")?"expand":"collapse";a.trigger(t),e.preventDefault(),e.stopPropagation()})}}),e.mobile.document.bind("pagecreate create",function(t){e.mobile.collapsible.prototype.enhanceWithin(t.target)})}(e),function(e){e.mobile.behaviors.addFirstLastClasses={_getVisibles:function(e,t){var i;return t?i=e.not(".ui-screen-hidden"):(i=e.filter(":visible"),0===i.length&&(i=e.not(".ui-screen-hidden"))),i},_addFirstLastClasses:function(e,t,i){e.removeClass("ui-first-child ui-last-child"),t.eq(0).addClass("ui-first-child").end().last().addClass("ui-last-child"),i||this.element.trigger("updatelayout")}}}(e),function(e,t){e.widget("mobile.collapsibleset",e.mobile.widget,e.extend({options:{initSelector:":jqmData(role='collapsible-set')"},_create:function(){var i=this.element.addClass("ui-collapsible-set"),n=this.options;n.theme||(n.theme=e.mobile.getInheritedTheme(i,"c")),n.contentTheme||(n.contentTheme=i.jqmData("content-theme")),n.corners||(n.corners=i.jqmData("corners")),i.jqmData("inset")!==t&&(n.inset=i.jqmData("inset")),n.inset=n.inset!==t?n.inset:!0,n.corners=n.corners!==t?n.corners:!0,n.corners&&n.inset&&i.addClass("ui-corner-all"),i.jqmData("collapsiblebound")||i.jqmData("collapsiblebound",!0).bind("expand",function(t){var i=e(t.target).closest(".ui-collapsible");i.parent().is(":jqmData(role='collapsible-set')")&&i.siblings(".ui-collapsible").trigger("collapse")})},_init:function(){var e=this.element,t=e.children(":jqmData(role='collapsible')"),i=t.filter(":jqmData(collapsed='false')");
this._refresh("true"),i.trigger("expand")},_refresh:function(t){var i=this.element.children(":jqmData(role='collapsible')");e.mobile.collapsible.prototype.enhance(i.not(".ui-collapsible")),this._addFirstLastClasses(i,this._getVisibles(i,t),t)},refresh:function(){this._refresh(!1)}},e.mobile.behaviors.addFirstLastClasses)),e.mobile.document.bind("pagecreate create",function(t){e.mobile.collapsibleset.prototype.enhanceWithin(t.target)})}(e),function(e){e.fn.fieldcontain=function(){return this.addClass("ui-field-contain ui-body ui-br").contents().filter(function(){return 3===this.nodeType&&!/\S/.test(this.nodeValue)}).remove()},e(i).bind("pagecreate create",function(t){e(":jqmData(role='fieldcontain')",t.target).jqmEnhanceable().fieldcontain()})}(e),function(e){e.fn.grid=function(t){return this.each(function(){var i,n=e(this),a=e.extend({grid:null},t),o=n.children(),s={solo:1,a:2,b:3,c:4,d:5},r=a.grid;if(!r)if(5>=o.length)for(var l in s)s[l]===o.length&&(r=l);else r="a",n.addClass("ui-grid-duo");i=s[r],n.addClass("ui-grid-"+r),o.filter(":nth-child("+i+"n+1)").addClass("ui-block-a"),i>1&&o.filter(":nth-child("+i+"n+2)").addClass("ui-block-b"),i>2&&o.filter(":nth-child("+i+"n+3)").addClass("ui-block-c"),i>3&&o.filter(":nth-child("+i+"n+4)").addClass("ui-block-d"),i>4&&o.filter(":nth-child("+i+"n+5)").addClass("ui-block-e")})}}(e),function(e,t){e.widget("mobile.navbar",e.mobile.widget,{options:{iconpos:"top",grid:null,initSelector:":jqmData(role='navbar')"},_create:function(){var n=this.element,a=n.find("a"),o=a.filter(":jqmData(icon)").length?this.options.iconpos:t;n.addClass("ui-navbar ui-mini").attr("role","navigation").find("ul").jqmEnhanceable().grid({grid:this.options.grid}),a.buttonMarkup({corners:!1,shadow:!1,inline:!0,iconpos:o}),n.delegate("a","vclick",function(t){var n=e(t.target).is("a")?e(this):e(this).parent("a");if(!n.is(".ui-disabled, .ui-btn-active")){a.removeClass(e.mobile.activeBtnClass),e(this).addClass(e.mobile.activeBtnClass);var o=e(this);e(i).one("pagehide",function(){o.removeClass(e.mobile.activeBtnClass)})}}),n.closest(".ui-page").bind("pagebeforeshow",function(){a.filter(".ui-state-persist").addClass(e.mobile.activeBtnClass)})}}),e.mobile.document.bind("pagecreate create",function(t){e.mobile.navbar.prototype.enhanceWithin(t.target)})}(e),function(e){var t={};e.widget("mobile.listview",e.mobile.widget,e.extend({options:{theme:null,countTheme:"c",headerTheme:"b",dividerTheme:"b",icon:"arrow-r",splitIcon:"arrow-r",splitTheme:"b",corners:!0,shadow:!0,inset:!1,initSelector:":jqmData(role='listview')"},_create:function(){var e=this,t="";t+=e.options.inset?" ui-listview-inset":"",e.options.inset&&(t+=e.options.corners?" ui-corner-all":"",t+=e.options.shadow?" ui-shadow":""),e.element.addClass(function(e,i){return i+" ui-listview"+t}),e.refresh(!0)},_findFirstElementByTagName:function(e,t,i,n){var a={};for(a[i]=a[n]=!0;e;){if(a[e.nodeName])return e;e=e[t]}return null},_getChildrenByTagName:function(t,i,n){var a=[],o={};for(o[i]=o[n]=!0,t=t.firstChild;t;)o[t.nodeName]&&a.push(t),t=t.nextSibling;return e(a)},_addThumbClasses:function(t){var i,n,a=t.length;for(i=0;a>i;i++)n=e(this._findFirstElementByTagName(t[i].firstChild,"nextSibling","img","IMG")),n.length&&(n.addClass("ui-li-thumb"),e(this._findFirstElementByTagName(n[0].parentNode,"parentNode","li","LI")).addClass(n.is(".ui-li-icon")?"ui-li-has-icon":"ui-li-has-thumb"))},refresh:function(t){this.parentPage=this.element.closest(".ui-page"),this._createSubPages();var n,a,o,s,r,l,d,c,h,u,p,m,f=this.options,g=this.element,b=g.jqmData("dividertheme")||f.dividerTheme,v=g.jqmData("splittheme"),_=g.jqmData("spliticon"),C=g.jqmData("icon"),x=this._getChildrenByTagName(g[0],"li","LI"),y=!!e.nodeName(g[0],"ol"),w=!e.support.cssPseudoElement,T=g.attr("start"),D={};y&&w&&g.find(".ui-li-dec").remove(),y&&(T||0===T?w?d=parseInt(T,10):(c=parseInt(T,10)-1,g.css("counter-reset","listnumbering "+c)):w&&(d=1)),f.theme||(f.theme=e.mobile.getInheritedTheme(this.element,"c"));for(var P=0,k=x.length;k>P;P++){if(n=x.eq(P),a="ui-li",t||!n.hasClass("ui-li")){o=n.jqmData("theme")||f.theme,s=this._getChildrenByTagName(n[0],"a","A");var E="list-divider"===n.jqmData("role");s.length&&!E?(p=n.jqmData("icon"),n.buttonMarkup({wrapperEls:"div",shadow:!1,corners:!1,iconpos:"right",icon:s.length>1||p===!1?!1:p||C||f.icon,theme:o}),p!==!1&&1===s.length&&n.addClass("ui-li-has-arrow"),s.first().removeClass("ui-link").addClass("ui-link-inherit"),s.length>1&&(a+=" ui-li-has-alt",r=s.last(),l=v||r.jqmData("theme")||f.splitTheme,m=r.jqmData("icon"),r.appendTo(n).attr("title",e.trim(r.getEncodedText())).addClass("ui-li-link-alt").empty().buttonMarkup({shadow:!1,corners:!1,theme:o,icon:!1,iconpos:"notext"}).find(".ui-btn-inner").append(e(i.createElement("span")).buttonMarkup({shadow:!0,corners:!0,theme:l,iconpos:"notext",icon:m||p||_||f.splitIcon})))):E?(a+=" ui-li-divider ui-bar-"+(n.jqmData("theme")||b),n.attr("role","heading"),y&&(T||0===T?w?d=parseInt(T,10):(h=parseInt(T,10)-1,n.css("counter-reset","listnumbering "+h)):w&&(d=1))):a+=" ui-li-static ui-btn-up-"+o}y&&w&&0>a.indexOf("ui-li-divider")&&(u=a.indexOf("ui-li-static")>0?n:n.find(".ui-link-inherit"),u.addClass("ui-li-jsnumbering").prepend("<span class='ui-li-dec'>"+d++ +". </span>")),D[a]||(D[a]=[]),D[a].push(n[0])}for(a in D)e(D[a]).addClass(a).children(".ui-btn-inner").addClass(a);g.find("h1, h2, h3, h4, h5, h6").addClass("ui-li-heading").end().find("p, dl").addClass("ui-li-desc").end().find(".ui-li-aside").each(function(){var t=e(this);t.prependTo(t.parent())}).end().find(".ui-li-count").each(function(){e(this).closest("li").addClass("ui-li-has-count")}).addClass("ui-btn-up-"+(g.jqmData("counttheme")||this.options.countTheme)+" ui-btn-corner-all"),this._addThumbClasses(x),this._addThumbClasses(g.find(".ui-link-inherit")),this._addFirstLastClasses(x,this._getVisibles(x,t),t),this._trigger("afterrefresh")},_idStringEscape:function(e){return e.replace(/[^a-zA-Z0-9]/g,"-")},_createSubPages:function(){var i,a=this.element,o=a.closest(".ui-page"),s=o.jqmData("url"),r=s||o[0][e.expando],l=a.attr("id"),d=this.options,c="data-"+e.mobile.ns,h=this,u=o.find(":jqmData(role='footer')").jqmData("id");if(t[r]===n&&(t[r]=-1),l=l||++t[r],e(a.find("li>ul, li>ol").toArray().reverse()).each(function(t){var n,o,r=e(this),h=r.attr("id")||l+"-"+t,p=r.parent(),m=e(r.prevAll().toArray().reverse()),f=m.length?m:e("<span>"+e.trim(p.contents()[0].nodeValue)+"</span>"),g=f.first().getEncodedText(),b=(s||"")+"&"+e.mobile.subPageUrlKey+"="+h,v=r.jqmData("theme")||d.theme,_=r.jqmData("counttheme")||a.jqmData("counttheme")||d.countTheme;i=!0,n=r.detach().wrap("<div "+c+"role='page' "+c+"url='"+b+"' "+c+"theme='"+v+"' "+c+"count-theme='"+_+"'><div "+c+"role='content'></div></div>").parent().before("<div "+c+"role='header' "+c+"theme='"+d.headerTheme+"'><div class='ui-title'>"+g+"</div></div>").after(u?e("<div "+c+"role='footer' "+c+"id='"+u+"'>"):"").parent().appendTo(e.mobile.pageContainer),n.page(),o=p.find("a:first"),o.length||(o=e("<a/>").html(f||g).prependTo(p.empty())),o.attr("href","#"+b)}).listview(),i&&o.is(":jqmData(external-page='true')")&&o.data("mobile-page").options.domCache===!1){var p=function(t,i){var n,a=i.nextPage,r=new e.Event("pageremove");i.nextPage&&(n=a.jqmData("url"),0!==n.indexOf(s+"&"+e.mobile.subPageUrlKey)&&(h.childPages().remove(),o.trigger(r),r.isDefaultPrevented()||o.removeWithDependents()))};o.unbind("pagehide.remove").bind("pagehide.remove",p)}},childPages:function(){var t=this.parentPage.jqmData("url");return e(":jqmData(url^='"+t+"&"+e.mobile.subPageUrlKey+"')")}},e.mobile.behaviors.addFirstLastClasses)),e.mobile.document.bind("pagecreate create",function(t){e.mobile.listview.prototype.enhanceWithin(t.target)})}(e),function(e){var t=e("meta[name=viewport]"),i=t.attr("content"),n=i+",maximum-scale=1, user-scalable=no",a=i+",maximum-scale=10, user-scalable=yes",o=/(user-scalable[\s]*=[\s]*no)|(maximum-scale[\s]*=[\s]*1)[$,\s]/.test(i);e.mobile.zoom=e.extend({},{enabled:!o,locked:!1,disable:function(i){o||e.mobile.zoom.locked||(t.attr("content",n),e.mobile.zoom.enabled=!1,e.mobile.zoom.locked=i||!1)},enable:function(i){o||e.mobile.zoom.locked&&i!==!0||(t.attr("content",a),e.mobile.zoom.enabled=!0,e.mobile.zoom.locked=!1)},restore:function(){o||(t.attr("content",i),e.mobile.zoom.enabled=!0)}})}(e),function(e){e.widget("mobile.textinput",e.mobile.widget,{options:{theme:null,mini:!1,preventFocusZoom:/iPhone|iPad|iPod/.test(navigator.platform)&&navigator.userAgent.indexOf("AppleWebKit")>-1,initSelector:"input[type='text'], input[type='search'], :jqmData(type='search'), input[type='number'], :jqmData(type='number'), input[type='password'], input[type='email'], input[type='url'], input[type='tel'], textarea, input[type='time'], input[type='date'], input[type='month'], input[type='week'], input[type='datetime'], input[type='datetime-local'], input[type='color'], input:not([type]), input[type='file']",clearBtn:!1,clearSearchButtonText:null,clearBtnText:"clear text",disabled:!1},_create:function(){function t(){setTimeout(function(){a.toggleClass("ui-input-clear-hidden",!s.val())},0)}var i,a,o=this,s=this.element,r=this.options,l=r.theme||e.mobile.getInheritedTheme(this.element,"c"),d=" ui-body-"+l,c=r.mini?" ui-mini":"",h=s.is("[type='search'], :jqmData(type='search')"),u=r.clearSearchButtonText||r.clearBtnText,p=s.is("textarea, :jqmData(type='range')"),m=!!r.clearBtn&&!p,f=s.is("input")&&!s.is(":jqmData(type='range')");if(e("label[for='"+s.attr("id")+"']").addClass("ui-input-text"),i=s.addClass("ui-input-text ui-body-"+l),s[0].autocorrect===n||e.support.touchOverflow||(s[0].setAttribute("autocorrect","off"),s[0].setAttribute("autocomplete","off")),h?i=s.wrap("<div class='ui-input-search ui-shadow-inset ui-btn-corner-all ui-btn-shadow ui-icon-searchfield"+d+c+"'></div>").parent():f&&(i=s.wrap("<div class='ui-input-text ui-shadow-inset ui-corner-all ui-btn-shadow"+d+c+"'></div>").parent()),m||h?(a=e("<a href='#' class='ui-input-clear' title='"+u+"'>"+u+"</a>").bind("click",function(e){s.val("").focus().trigger("change"),a.addClass("ui-input-clear-hidden"),e.preventDefault()}).appendTo(i).buttonMarkup({icon:"delete",iconpos:"notext",corners:!0,shadow:!0,mini:r.mini}),h||i.addClass("ui-input-has-clear"),t(),s.bind("paste cut keyup input focus change blur",t)):f||h||s.addClass("ui-corner-all ui-shadow-inset"+d+c),s.focus(function(){r.preventFocusZoom&&e.mobile.zoom.disable(!0),i.addClass(e.mobile.focusClass)}).blur(function(){i.removeClass(e.mobile.focusClass),r.preventFocusZoom&&e.mobile.zoom.enable(!0)}),s.is("textarea")){var g,b=15,v=100;this._keyup=function(){var e=s[0].scrollHeight,t=s[0].clientHeight;if(e>t){var i=parseFloat(s.css("padding-top")),n=parseFloat(s.css("padding-bottom")),a=i+n;s.height(e-a+b)}},s.on("keyup change input paste",function(){clearTimeout(g),g=setTimeout(o._keyup,v)}),this._on(!0,e.mobile.document,{pagechange:"_keyup"}),e.trim(s.val())&&this._on(!0,e.mobile.window,{load:"_keyup"})}s.attr("disabled")&&this.disable()},disable:function(){var e,t=this.element.is("[type='search'], :jqmData(type='search')"),i=this.element.is("input")&&!this.element.is(":jqmData(type='range')"),n=this.element.attr("disabled",!0)&&(i||t);return e=n?this.element.parent():this.element,e.addClass("ui-disabled"),this._setOption("disabled",!0)},enable:function(){var e,t=this.element.is("[type='search'], :jqmData(type='search')"),i=this.element.is("input")&&!this.element.is(":jqmData(type='range')"),n=this.element.attr("disabled",!1)&&(i||t);return e=n?this.element.parent():this.element,e.removeClass("ui-disabled"),this._setOption("disabled",!1)}}),e.mobile.document.bind("pagecreate create",function(t){e.mobile.textinput.prototype.enhanceWithin(t.target,!0)})}(e),function(e){e.mobile.listview.prototype.options.filter=!1,e.mobile.listview.prototype.options.filterPlaceholder="Filter items...",e.mobile.listview.prototype.options.filterTheme="c",e.mobile.listview.prototype.options.filterReveal=!1;var t=function(e,t){return-1===(""+e).toLowerCase().indexOf(t)};e.mobile.listview.prototype.options.filterCallback=t,e.mobile.document.delegate("ul, ol","listviewcreate",function(){var i=e(this),n=i.data("mobile-listview");if(n&&n.options.filter){n.options.filterReveal&&i.children().addClass("ui-screen-hidden");var a=e("<form>",{"class":"ui-listview-filter ui-bar-"+n.options.filterTheme,role:"search"}).submit(function(e){e.preventDefault(),s.blur()}),o=function(){var a,o=e(this),s=this.value.toLowerCase(),r=null,l=i.children(),d=o.jqmData("lastval")+"",c=!1,h="",u=n.options.filterCallback!==t;if(!d||d!==s){if(n._trigger("beforefilter","beforefilter",{input:this}),o.jqmData("lastval",s),u||s.length<d.length||0!==s.indexOf(d)?r=i.children():(r=i.children(":not(.ui-screen-hidden)"),!r.length&&n.options.filterReveal&&(r=i.children(".ui-screen-hidden"))),s){for(var p=r.length-1;p>=0;p--)a=e(r[p]),h=a.jqmData("filtertext")||a.text(),a.is("li:jqmData(role=list-divider)")?(a.toggleClass("ui-filter-hidequeue",!c),c=!1):n.options.filterCallback(h,s,a)?a.toggleClass("ui-filter-hidequeue",!0):c=!0;r.filter(":not(.ui-filter-hidequeue)").toggleClass("ui-screen-hidden",!1),r.filter(".ui-filter-hidequeue").toggleClass("ui-screen-hidden",!0).toggleClass("ui-filter-hidequeue",!1)}else r.toggleClass("ui-screen-hidden",!!n.options.filterReveal);n._addFirstLastClasses(l,n._getVisibles(l,!1),!1)}},s=e("<input>",{placeholder:n.options.filterPlaceholder}).attr("data-"+e.mobile.ns+"type","search").jqmData("lastval","").bind("keyup change input",o).appendTo(a).textinput();n.options.inset&&a.addClass("ui-listview-filter-inset"),a.bind("submit",function(){return!1}).insertBefore(i)}})}(e),function(e){e.mobile.listview.prototype.options.autodividers=!1,e.mobile.listview.prototype.options.autodividersSelector=function(t){var i=e.trim(t.text())||null;return i?i=i.slice(0,1).toUpperCase():null},e.mobile.document.delegate("ul,ol","listviewcreate",function(){var t=e(this),n=t.data("mobile-listview");if(n&&n.options.autodividers){var a=function(){t.find("li:jqmData(role='list-divider')").remove();for(var a,o,s=t.find("li"),r=null,l=0;s.length>l;l++){if(a=s[l],o=n.options.autodividersSelector(e(a)),o&&r!==o){var d=i.createElement("li");d.appendChild(i.createTextNode(o)),d.setAttribute("data-"+e.mobile.ns+"role","list-divider"),a.parentNode.insertBefore(d,a)}r=o}},o=function(){t.unbind("listviewafterrefresh",o),a(),n.refresh(),t.bind("listviewafterrefresh",o)};o()}})}(e),function(e){e(i).bind("pagecreate create",function(t){e(":jqmData(role='nojs')",t.target).addClass("ui-nojs")})}(e),function(e){e.mobile.behaviors.formReset={_handleFormReset:function(){this._on(this.element.closest("form"),{reset:function(){this._delay("_reset")}})}}}(e),function(e){e.widget("mobile.checkboxradio",e.mobile.widget,e.extend({options:{theme:null,mini:!1,initSelector:"input[type='checkbox'],input[type='radio']"},_create:function(){var t=this,a=this.element,o=this.options,s=function(e,t){return e.jqmData(t)||e.closest("form, fieldset").jqmData(t)},r=e(a).closest("label"),l=r.length?r:e(a).closest("form, fieldset, :jqmData(role='page'), :jqmData(role='dialog')").find("label").filter("[for='"+a[0].id+"']").first(),d=a[0].type,c=s(a,"mini")||o.mini,h=d+"-on",u=d+"-off",p=s(a,"iconpos"),m="ui-"+h,f="ui-"+u;if("checkbox"===d||"radio"===d){e.extend(this,{label:l,inputtype:d,checkedClass:m,uncheckedClass:f,checkedicon:h,uncheckedicon:u}),o.theme||(o.theme=e.mobile.getInheritedTheme(this.element,"c")),l.buttonMarkup({theme:o.theme,icon:u,shadow:!1,mini:c,iconpos:p});var g=i.createElement("div");g.className="ui-"+d,a.add(l).wrapAll(g),l.bind({vmouseover:function(t){e(this).parent().is(".ui-disabled")&&t.stopPropagation()},vclick:function(e){return a.is(":disabled")?(e.preventDefault(),n):(t._cacheVals(),a.prop("checked","radio"===d&&!0||!a.prop("checked")),a.triggerHandler("click"),t._getInputSet().not(a).prop("checked",!1),t._updateAll(),!1)}}),a.bind({vmousedown:function(){t._cacheVals()},vclick:function(){var i=e(this);i.is(":checked")?(i.prop("checked",!0),t._getInputSet().not(i).prop("checked",!1)):i.prop("checked",!1),t._updateAll()},focus:function(){l.addClass(e.mobile.focusClass)},blur:function(){l.removeClass(e.mobile.focusClass)}}),this._handleFormReset(),this.refresh()}},_cacheVals:function(){this._getInputSet().each(function(){e(this).jqmData("cacheVal",this.checked)})},_getInputSet:function(){return"checkbox"===this.inputtype?this.element:this.element.closest("form, :jqmData(role='page'), :jqmData(role='dialog')").find("input[name='"+this.element[0].name+"'][type='"+this.inputtype+"']")},_updateAll:function(){var t=this;this._getInputSet().each(function(){var i=e(this);(this.checked||"checkbox"===t.inputtype)&&i.trigger("change")}).checkboxradio("refresh")},_reset:function(){this.refresh()},refresh:function(){var t=this.element[0],i=" "+e.mobile.activeBtnClass,n=this.checkedClass+(this.element.parents(".ui-controlgroup-horizontal").length?i:""),a=this.label;t.checked?a.removeClass(this.uncheckedClass+i).addClass(n).buttonMarkup({icon:this.checkedicon}):a.removeClass(n).addClass(this.uncheckedClass).buttonMarkup({icon:this.uncheckedicon}),t.disabled?this.disable():this.enable()},disable:function(){this.element.prop("disabled",!0).parent().addClass("ui-disabled")},enable:function(){this.element.prop("disabled",!1).parent().removeClass("ui-disabled")}},e.mobile.behaviors.formReset)),e.mobile.document.bind("pagecreate create",function(t){e.mobile.checkboxradio.prototype.enhanceWithin(t.target,!0)})}(e),function(e){e.widget("mobile.button",e.mobile.widget,{options:{theme:null,icon:null,iconpos:null,corners:!0,shadow:!0,iconshadow:!0,inline:null,mini:null,initSelector:"button, [type='button'], [type='submit'], [type='reset']"},_create:function(){var t,i=this.element,a=function(e){var t,i={};for(t in e)null!==e[t]&&"initSelector"!==t&&(i[t]=e[t]);return i}(this.options),o="";return"A"===i[0].tagName?(i.hasClass("ui-btn")||i.buttonMarkup(),n):(this.options.theme||(this.options.theme=e.mobile.getInheritedTheme(this.element,"c")),~i[0].className.indexOf("ui-btn-left")&&(o="ui-btn-left"),~i[0].className.indexOf("ui-btn-right")&&(o="ui-btn-right"),("submit"===i.attr("type")||"reset"===i.attr("type"))&&(o?o+=" ui-submit":o="ui-submit"),e("label[for='"+i.attr("id")+"']").addClass("ui-submit"),this.button=e("<div></div>")[i.html()?"html":"text"](i.html()||i.val()).insertBefore(i).buttonMarkup(a).addClass(o).append(i.addClass("ui-btn-hidden")),t=this.button,i.bind({focus:function(){t.addClass(e.mobile.focusClass)},blur:function(){t.removeClass(e.mobile.focusClass)}}),this.refresh(),n)},_setOption:function(t,i){var n={};n[t]=i,"initSelector"!==t&&(this.button.buttonMarkup(n),this.element.attr("data-"+(e.mobile.ns||"")+t.replace(/([A-Z])/,"-$1").toLowerCase(),i)),this._super("_setOption",t,i)},enable:function(){return this.element.attr("disabled",!1),this.button.removeClass("ui-disabled").attr("aria-disabled",!1),this._setOption("disabled",!1)},disable:function(){return this.element.attr("disabled",!0),this.button.addClass("ui-disabled").attr("aria-disabled",!0),this._setOption("disabled",!0)},refresh:function(){var t=this.element;t.prop("disabled")?this.disable():this.enable(),e(this.button.data("buttonElements").text)[t.html()?"html":"text"](t.html()||t.val())}}),e.mobile.document.bind("pagecreate create",function(t){e.mobile.button.prototype.enhanceWithin(t.target,!0)})}(e),function(e,n){e.widget("mobile.slider",e.mobile.widget,e.extend({widgetEventPrefix:"slide",options:{theme:null,trackTheme:null,disabled:!1,initSelector:"input[type='range'], :jqmData(type='range'), :jqmData(role='slider')",mini:!1,highlight:!1},_create:function(){var a,o,s=this,r=this.element,l=e.mobile.getInheritedTheme(r,"c"),d=this.options.theme||l,c=this.options.trackTheme||l,h=r[0].nodeName.toLowerCase(),u=(this.isToggleSwitch="select"===h,r.parent().is(":jqmData(role='rangeslider')")),p=this.isToggleSwitch?"ui-slider-switch":"",m=r.attr("id"),f=e("[for='"+m+"']"),g=f.attr("id")||m+"-label",b=f.attr("id",g),v=this.isToggleSwitch?0:parseFloat(r.attr("min")),_=this.isToggleSwitch?r.find("option").length-1:parseFloat(r.attr("max")),C=t.parseFloat(r.attr("step")||1),x=this.options.mini||r.jqmData("mini")?" ui-mini":"",y=i.createElement("a"),w=e(y),T=i.createElement("div"),D=e(T),P=this.options.highlight&&!this.isToggleSwitch?function(){var t=i.createElement("div");return t.className="ui-slider-bg "+e.mobile.activeBtnClass+" ui-btn-corner-all",e(t).prependTo(D)}():!1;if(y.setAttribute("href","#"),T.setAttribute("role","application"),T.className=[this.isToggleSwitch?"ui-slider ":"ui-slider-track ",p," ui-btn-down-",c," ui-btn-corner-all",x].join(""),y.className="ui-slider-handle",T.appendChild(y),w.buttonMarkup({corners:!0,theme:d,shadow:!0}).attr({role:"slider","aria-valuemin":v,"aria-valuemax":_,"aria-valuenow":this._value(),"aria-valuetext":this._value(),title:this._value(),"aria-labelledby":g}),e.extend(this,{slider:D,handle:w,type:h,step:C,max:_,min:v,valuebg:P,isRangeslider:u,dragging:!1,beforeStart:null,userModified:!1,mouseMoved:!1}),this.isToggleSwitch){o=i.createElement("div"),o.className="ui-slider-inneroffset";for(var k=0,E=T.childNodes.length;E>k;k++)o.appendChild(T.childNodes[k]);T.appendChild(o),w.addClass("ui-slider-handle-snapping"),a=r.find("option");for(var q=0,j=a.length;j>q;q++){var S=q?"a":"b",A=q?" "+e.mobile.activeBtnClass:" ui-btn-down-"+c,N=(i.createElement("div"),i.createElement("span"));N.className=["ui-slider-label ui-slider-label-",S,A," ui-btn-corner-all"].join(""),N.setAttribute("role","img"),N.appendChild(i.createTextNode(a[q].innerHTML)),e(N).prependTo(D)}s._labels=e(".ui-slider-label",D)}b.addClass("ui-slider"),r.addClass(this.isToggleSwitch?"ui-slider-switch":"ui-slider-input"),this._on(r,{change:"_controlChange",keyup:"_controlKeyup",blur:"_controlBlur",vmouseup:"_controlVMouseUp"}),D.bind("vmousedown",e.proxy(this._sliderVMouseDown,this)).bind("vclick",!1),this._on(i,{vmousemove:"_preventDocumentDrag"}),this._on(D.add(i),{vmouseup:"_sliderVMouseUp"}),D.insertAfter(r),this.isToggleSwitch||u||(o=this.options.mini?"<div class='ui-slider ui-mini'>":"<div class='ui-slider'>",r.add(D).wrapAll(o)),this.isToggleSwitch&&this.handle.bind({focus:function(){D.addClass(e.mobile.focusClass)},blur:function(){D.removeClass(e.mobile.focusClass)}}),this._on(this.handle,{vmousedown:"_handleVMouseDown",keydown:"_handleKeydown",keyup:"_handleKeyup"}),this.handle.bind("vclick",!1),this._handleFormReset(),this.refresh(n,n,!0)},_controlChange:function(e){return this._trigger("controlchange",e)===!1?!1:(this.mouseMoved||this.refresh(this._value(),!0),n)},_controlKeyup:function(){this.refresh(this._value(),!0,!0)},_controlBlur:function(){this.refresh(this._value(),!0)},_controlVMouseUp:function(){this._checkedRefresh()},_handleVMouseDown:function(){this.handle.focus()},_handleKeydown:function(t){var i=this._value();if(!this.options.disabled){switch(t.keyCode){case e.mobile.keyCode.HOME:case e.mobile.keyCode.END:case e.mobile.keyCode.PAGE_UP:case e.mobile.keyCode.PAGE_DOWN:case e.mobile.keyCode.UP:case e.mobile.keyCode.RIGHT:case e.mobile.keyCode.DOWN:case e.mobile.keyCode.LEFT:t.preventDefault(),this._keySliding||(this._keySliding=!0,this.handle.addClass("ui-state-active"))}switch(t.keyCode){case e.mobile.keyCode.HOME:this.refresh(this.min);break;case e.mobile.keyCode.END:this.refresh(this.max);break;case e.mobile.keyCode.PAGE_UP:case e.mobile.keyCode.UP:case e.mobile.keyCode.RIGHT:this.refresh(i+this.step);break;case e.mobile.keyCode.PAGE_DOWN:case e.mobile.keyCode.DOWN:case e.mobile.keyCode.LEFT:this.refresh(i-this.step)}}},_handleKeyup:function(){this._keySliding&&(this._keySliding=!1,this.handle.removeClass("ui-state-active"))},_sliderVMouseDown:function(e){return this.options.disabled||1!==e.which&&0!==e.which?!1:this._trigger("beforestart",e)===!1?!1:(this.dragging=!0,this.userModified=!1,this.mouseMoved=!1,this.isToggleSwitch&&(this.beforeStart=this.element[0].selectedIndex),this.refresh(e),this._trigger("start"),!1)},_sliderVMouseUp:function(){return this.dragging?(this.dragging=!1,this.isToggleSwitch&&(this.handle.addClass("ui-slider-handle-snapping"),this.mouseMoved?this.userModified?this.refresh(0===this.beforeStart?1:0):this.refresh(this.beforeStart):this.refresh(0===this.beforeStart?1:0)),this.mouseMoved=!1,this._trigger("stop"),!1):n},_preventDocumentDrag:function(e){return this._trigger("drag",e)===!1?!1:this.dragging&&!this.options.disabled?(this.mouseMoved=!0,this.isToggleSwitch&&this.handle.removeClass("ui-slider-handle-snapping"),this.refresh(e),this.userModified=this.beforeStart!==this.element[0].selectedIndex,!1):n},_checkedRefresh:function(){this.value!==this._value()&&this.refresh(this._value())},_value:function(){return this.isToggleSwitch?this.element[0].selectedIndex:parseFloat(this.element.val())},_reset:function(){this.refresh(n,!1,!0)},refresh:function(t,a,o){var s,r,l,d,c=this,h=e.mobile.getInheritedTheme(this.element,"c"),u=this.options.theme||h,p=this.options.trackTheme||h;c.slider[0].className=[this.isToggleSwitch?"ui-slider ui-slider-switch":"ui-slider-track"," ui-btn-down-"+p," ui-btn-corner-all",this.options.mini?" ui-mini":""].join(""),(this.options.disabled||this.element.attr("disabled"))&&this.disable(),this.value=this._value(),this.options.highlight&&!this.isToggleSwitch&&0===this.slider.find(".ui-slider-bg").length&&(this.valuebg=function(){var t=i.createElement("div");return t.className="ui-slider-bg "+e.mobile.activeBtnClass+" ui-btn-corner-all",e(t).prependTo(c.slider)}()),this.handle.buttonMarkup({corners:!0,theme:u,shadow:!0});var m,f,g=this.element,b=!this.isToggleSwitch,v=b?[]:g.find("option"),_=b?parseFloat(g.attr("min")):0,C=b?parseFloat(g.attr("max")):v.length-1,x=b&&parseFloat(g.attr("step"))>0?parseFloat(g.attr("step")):1;if("object"==typeof t){if(l=t,d=8,s=this.slider.offset().left,r=this.slider.width(),m=r/((C-_)/x),!this.dragging||s-d>l.pageX||l.pageX>s+r+d)return;f=m>1?100*((l.pageX-s)/r):Math.round(100*((l.pageX-s)/r))}else null==t&&(t=b?parseFloat(g.val()||0):g[0].selectedIndex),f=100*((parseFloat(t)-_)/(C-_));if(!isNaN(f)){var y=f/100*(C-_)+_,w=(y-_)%x,T=y-w;2*Math.abs(w)>=x&&(T+=w>0?x:-x);var D=100/((C-_)/x);if(y=parseFloat(T.toFixed(5)),m===n&&(m=r/((C-_)/x)),m>1&&b&&(f=(y-_)*D*(1/x)),0>f&&(f=0),f>100&&(f=100),_>y&&(y=_),y>C&&(y=C),this.handle.css("left",f+"%"),this.handle[0].setAttribute("aria-valuenow",b?y:v.eq(y).attr("value")),this.handle[0].setAttribute("aria-valuetext",b?y:v.eq(y).getEncodedText()),this.handle[0].setAttribute("title",b?y:v.eq(y).getEncodedText()),this.valuebg&&this.valuebg.css("width",f+"%"),this._labels){var P=100*(this.handle.width()/this.slider.width()),k=f&&P+(100-P)*f/100,E=100===f?0:Math.min(P+100-k,100);this._labels.each(function(){var t=e(this).is(".ui-slider-label-a");e(this).width((t?k:E)+"%")})}if(!o){var q=!1;if(b?(q=g.val()!==y,g.val(y)):(q=g[0].selectedIndex!==y,g[0].selectedIndex=y),this._trigger("beforechange",t)===!1)return!1;!a&&q&&g.trigger("change")}}},enable:function(){return this.element.attr("disabled",!1),this.slider.removeClass("ui-disabled").attr("aria-disabled",!1),this._setOption("disabled",!1)},disable:function(){return this.element.attr("disabled",!0),this.slider.addClass("ui-disabled").attr("aria-disabled",!0),this._setOption("disabled",!0)}},e.mobile.behaviors.formReset)),e.mobile.document.bind("pagecreate create",function(t){e.mobile.slider.prototype.enhanceWithin(t.target,!0)})}(e),function(e){e.widget("mobile.rangeslider",e.mobile.widget,{options:{theme:null,trackTheme:null,disabled:!1,initSelector:":jqmData(role='rangeslider')",mini:!1,highlight:!0},_create:function(){var t,i=this.element,n=this.options.mini?"ui-rangeslider ui-mini":"ui-rangeslider",a=i.find("input").first(),o=i.find("input").last(),s=i.find("label").first(),r=e.data(a.get(0),"mobileSlider").slider,l=e.data(o.get(0),"mobileSlider").slider,d=e.data(a.get(0),"mobileSlider").handle,c=e('<div class="ui-rangeslider-sliders" />').appendTo(i);i.find("label").length>1&&(t=i.find("label").last().hide()),a.addClass("ui-rangeslider-first"),o.addClass("ui-rangeslider-last"),i.addClass(n),r.appendTo(c),l.appendTo(c),s.prependTo(i),d.prependTo(l),e.extend(this,{_inputFirst:a,_inputLast:o,_sliderFirst:r,_sliderLast:l,_targetVal:null,_sliderTarget:!1,_sliders:c,_proxy:!1}),this.refresh(),this._on(this.element.find("input.ui-slider-input"),{slidebeforestart:"_slidebeforestart",slidestop:"_slidestop",slidedrag:"_slidedrag",slidebeforechange:"_change",blur:"_change",keyup:"_change"}),this._on({mousedown:"_change"}),this._on(this.element.closest("form"),{reset:"_handleReset"}),this._on(d,{vmousedown:"_dragFirstHandle"})},_handleReset:function(){var e=this;setTimeout(function(){e._updateHighlight()},0)},_dragFirstHandle:function(t){return e.data(this._inputFirst.get(0),"mobileSlider").dragging=!0,e.data(this._inputFirst.get(0),"mobileSlider").refresh(t),!1},_slidedrag:function(t){var i=e(t.target).is(this._inputFirst),a=i?this._inputLast:this._inputFirst;return this._sliderTarget=!1,"first"===this._proxy&&i||"last"===this._proxy&&!i?(e.data(a.get(0),"mobileSlider").dragging=!0,e.data(a.get(0),"mobileSlider").refresh(t),!1):n},_slidestop:function(t){var i=e(t.target).is(this._inputFirst);this._proxy=!1,this.element.find("input").trigger("vmouseup"),this._sliderFirst.css("z-index",i?1:"")},_slidebeforestart:function(t){this._sliderTarget=!1,e(t.originalEvent.target).hasClass("ui-slider-track")&&(this._sliderTarget=!0,this._targetVal=e(t.target).val())},_setOption:function(e){this._superApply(e),this.refresh()},refresh:function(){var e=this.element,t=this.options;e.find("input").slider({theme:t.theme,trackTheme:t.trackTheme,disabled:t.disabled,mini:t.mini,highlight:t.highlight}).slider("refresh"),this._updateHighlight()},_change:function(t){if("keyup"===t.type)return this._updateHighlight(),!1;var i=this,a=parseFloat(this._inputFirst.val(),10),o=parseFloat(this._inputLast.val(),10),s=e(t.target).hasClass("ui-rangeslider-first"),r=s?this._inputFirst:this._inputLast,l=s?this._inputLast:this._inputFirst;if(this._inputFirst.val()>this._inputLast.val()&&"mousedown"===t.type&&!e(t.target).hasClass("ui-slider-handle"))r.blur();else if("mousedown"===t.type)return;return a>o&&!this._sliderTarget?(r.val(s?o:a).slider("refresh"),this._trigger("normalize")):a>o&&(r.val(this._targetVal).slider("refresh"),setTimeout(function(){l.val(s?a:o).slider("refresh"),e.data(l.get(0),"mobileSlider").handle.focus(),i._sliderFirst.css("z-index",s?"":1),i._trigger("normalize")},0),this._proxy=s?"first":"last"),a===o?(e.data(r.get(0),"mobileSlider").handle.css("z-index",1),e.data(l.get(0),"mobileSlider").handle.css("z-index",0)):(e.data(l.get(0),"mobileSlider").handle.css("z-index",""),e.data(r.get(0),"mobileSlider").handle.css("z-index","")),this._updateHighlight(),a>=o?!1:n},_updateHighlight:function(){var t=parseInt(e.data(this._inputFirst.get(0),"mobileSlider").handle.get(0).style.left,10),i=parseInt(e.data(this._inputLast.get(0),"mobileSlider").handle.get(0).style.left,10),n=i-t;this.element.find(".ui-slider-bg").css({"margin-left":t+"%",width:n+"%"})},_destroy:function(){this.element.removeClass("ui-rangeslider ui-mini").find("label").show(),this._inputFirst.after(this._sliderFirst),this._inputLast.after(this._sliderLast),this._sliders.remove(),this.element.find("input").removeClass("ui-rangeslider-first ui-rangeslider-last").slider("destroy")}}),e.widget("mobile.rangeslider",e.mobile.rangeslider,e.mobile.behaviors.formReset),e(i).bind("pagecreate create",function(t){e.mobile.rangeslider.prototype.enhanceWithin(t.target,!0)})}(e),function(e){e.widget("mobile.selectmenu",e.mobile.widget,e.extend({options:{theme:null,disabled:!1,icon:"arrow-d",iconpos:"right",inline:!1,corners:!0,shadow:!0,iconshadow:!0,overlayTheme:"a",dividerTheme:"b",hidePlaceholderMenuItems:!0,closeText:"Close",nativeMenu:!0,preventFocusZoom:/iPhone|iPad|iPod/.test(navigator.platform)&&navigator.userAgent.indexOf("AppleWebKit")>-1,initSelector:"select:not( :jqmData(role='slider') )",mini:!1},_button:function(){return e("<div/>")
},_setDisabled:function(e){return this.element.attr("disabled",e),this.button.attr("aria-disabled",e),this._setOption("disabled",e)},_focusButton:function(){var e=this;setTimeout(function(){e.button.focus()},40)},_selectOptions:function(){return this.select.find("option")},_preExtension:function(){var t="";~this.element[0].className.indexOf("ui-btn-left")&&(t=" ui-btn-left"),~this.element[0].className.indexOf("ui-btn-right")&&(t=" ui-btn-right"),this.select=this.element.removeClass("ui-btn-left ui-btn-right").wrap("<div class='ui-select"+t+"'>"),this.selectID=this.select.attr("id"),this.label=e("label[for='"+this.selectID+"']").addClass("ui-select"),this.isMultiple=this.select[0].multiple,this.options.theme||(this.options.theme=e.mobile.getInheritedTheme(this.select,"c"))},_destroy:function(){var e=this.element.parents(".ui-select");e.length>0&&(e.is(".ui-btn-left, .ui-btn-right")&&this.element.addClass(e.is(".ui-btn-left")?"ui-btn-left":"ui-btn-right"),this.element.insertAfter(e),e.remove())},_create:function(){this._preExtension(),this._trigger("beforeCreate"),this.button=this._button();var i=this,n=this.options,a=n.inline||this.select.jqmData("inline"),o=n.mini||this.select.jqmData("mini"),s=n.icon?n.iconpos||this.select.jqmData("iconpos"):!1,r=(-1===this.select[0].selectedIndex?0:this.select[0].selectedIndex,this.button.insertBefore(this.select).buttonMarkup({theme:n.theme,icon:n.icon,iconpos:s,inline:a,corners:n.corners,shadow:n.shadow,iconshadow:n.iconshadow,mini:o}));this.setButtonText(),n.nativeMenu&&t.opera&&t.opera.version&&r.addClass("ui-select-nativeonly"),this.isMultiple&&(this.buttonCount=e("<span>").addClass("ui-li-count ui-btn-up-c ui-btn-corner-all").hide().appendTo(r.addClass("ui-li-has-count"))),(n.disabled||this.element.attr("disabled"))&&this.disable(),this.select.change(function(){i.refresh(),n.nativeMenu&&this.blur()}),this._handleFormReset(),this.build()},build:function(){var t=this;this.select.appendTo(t.button).bind("vmousedown",function(){t.button.addClass(e.mobile.activeBtnClass)}).bind("focus",function(){t.button.addClass(e.mobile.focusClass)}).bind("blur",function(){t.button.removeClass(e.mobile.focusClass)}).bind("focus vmouseover",function(){t.button.trigger("vmouseover")}).bind("vmousemove",function(){t.button.removeClass(e.mobile.activeBtnClass)}).bind("change blur vmouseout",function(){t.button.trigger("vmouseout").removeClass(e.mobile.activeBtnClass)}).bind("change blur",function(){t.button.removeClass("ui-btn-down-"+t.options.theme)}),t.button.bind("vmousedown",function(){t.options.preventFocusZoom&&e.mobile.zoom.disable(!0)}),t.label.bind("click focus",function(){t.options.preventFocusZoom&&e.mobile.zoom.disable(!0)}),t.select.bind("focus",function(){t.options.preventFocusZoom&&e.mobile.zoom.disable(!0)}),t.button.bind("mouseup",function(){t.options.preventFocusZoom&&setTimeout(function(){e.mobile.zoom.enable(!0)},0)}),t.select.bind("blur",function(){t.options.preventFocusZoom&&e.mobile.zoom.enable(!0)})},selected:function(){return this._selectOptions().filter(":selected")},selectedIndices:function(){var e=this;return this.selected().map(function(){return e._selectOptions().index(this)}).get()},setButtonText:function(){var t=this,n=this.selected(),a=this.placeholder,o=e(i.createElement("span"));this.button.find(".ui-btn-text").html(function(){return a=n.length?n.map(function(){return e(this).text()}).get().join(", "):t.placeholder,o.text(a).addClass(t.select.attr("class")).addClass(n.attr("class"))})},setButtonCount:function(){var e=this.selected();this.isMultiple&&this.buttonCount[e.length>1?"show":"hide"]().text(e.length)},_reset:function(){this.refresh()},refresh:function(){this.setButtonText(),this.setButtonCount()},open:e.noop,close:e.noop,disable:function(){this._setDisabled(!0),this.button.addClass("ui-disabled")},enable:function(){this._setDisabled(!1),this.button.removeClass("ui-disabled")}},e.mobile.behaviors.formReset)),e.mobile.document.bind("pagecreate create",function(t){e.mobile.selectmenu.prototype.enhanceWithin(t.target,!0)})}(e),function(e,n){function a(e,t,i,n){var a=n;return a=t>e?i+(e-t)/2:Math.min(Math.max(i,n-t/2),i+e-t)}function o(){var i=e.mobile.window;return{x:i.scrollLeft(),y:i.scrollTop(),cx:t.innerWidth||i.width(),cy:t.innerHeight||i.height()}}e.widget("mobile.popup",e.mobile.widget,{options:{theme:null,overlayTheme:null,shadow:!0,corners:!0,transition:"none",positionTo:"origin",tolerance:null,initSelector:":jqmData(role='popup')",closeLinkSelector:"a:jqmData(rel='back')",closeLinkEvents:"click.popup",navigateEvents:"navigate.popup",closeEvents:"navigate.popup pagebeforechange.popup",dismissible:!0,history:!e.mobile.browser.oldIE},_eatEventAndClose:function(e){return e.preventDefault(),e.stopImmediatePropagation(),this.options.dismissible&&this.close(),!1},_resizeScreen:function(){var e=this._ui.container.outerHeight(!0);this._ui.screen.removeAttr("style"),e>this._ui.screen.height()&&this._ui.screen.height(e)},_handleWindowKeyUp:function(t){return this._isOpen&&t.keyCode===e.mobile.keyCode.ESCAPE?this._eatEventAndClose(t):n},_expectResizeEvent:function(){var t=o();if(this._resizeData){if(t.x===this._resizeData.winCoords.x&&t.y===this._resizeData.winCoords.y&&t.cx===this._resizeData.winCoords.cx&&t.cy===this._resizeData.winCoords.cy)return!1;clearTimeout(this._resizeData.timeoutId)}return this._resizeData={timeoutId:setTimeout(e.proxy(this,"_resizeTimeout"),200),winCoords:t},!0},_resizeTimeout:function(){this._isOpen?this._expectResizeEvent()||(this._ui.container.hasClass("ui-popup-hidden")&&(this._ui.container.removeClass("ui-popup-hidden"),this.reposition({positionTo:"window"}),this._ignoreResizeEvents()),this._resizeScreen(),this._resizeData=null,this._orientationchangeInProgress=!1):(this._resizeData=null,this._orientationchangeInProgress=!1)},_ignoreResizeEvents:function(){var e=this;this._ignoreResizeTo&&clearTimeout(this._ignoreResizeTo),this._ignoreResizeTo=setTimeout(function(){e._ignoreResizeTo=0},1e3)},_handleWindowResize:function(){this._isOpen&&0===this._ignoreResizeTo&&(!this._expectResizeEvent()&&!this._orientationchangeInProgress||this._ui.container.hasClass("ui-popup-hidden")||this._ui.container.addClass("ui-popup-hidden").removeAttr("style"))},_handleWindowOrientationchange:function(){!this._orientationchangeInProgress&&this._isOpen&&0===this._ignoreResizeTo&&(this._expectResizeEvent(),this._orientationchangeInProgress=!0)},_handleDocumentFocusIn:function(t){var n,a=t.target,o=this._ui;if(this._isOpen){if(a!==o.container[0]){if(n=e(t.target),0===n.parents().filter(o.container[0]).length)return e(i.activeElement).one("focus",function(){n.blur()}),o.focusElement.focus(),t.preventDefault(),t.stopImmediatePropagation(),!1;o.focusElement[0]===o.container[0]&&(o.focusElement=n)}this._ignoreResizeEvents()}},_create:function(){var t={screen:e("<div class='ui-screen-hidden ui-popup-screen'></div>"),placeholder:e("<div style='display: none;'><!-- placeholder --></div>"),container:e("<div class='ui-popup-container ui-popup-hidden'></div>")},i=this.element.closest(".ui-page"),a=this.element.attr("id"),o=this;this.options.history=this.options.history&&e.mobile.ajaxEnabled&&e.mobile.hashListeningEnabled,0===i.length&&(i=e("body")),this.options.container=this.options.container||e.mobile.pageContainer,i.append(t.screen),t.container.insertAfter(t.screen),t.placeholder.insertAfter(this.element),a&&(t.screen.attr("id",a+"-screen"),t.container.attr("id",a+"-popup"),t.placeholder.html("<!-- placeholder for "+a+" -->")),t.container.append(this.element),t.focusElement=t.container,this.element.addClass("ui-popup"),e.extend(this,{_scrollTop:0,_page:i,_ui:t,_fallbackTransition:"",_currentTransition:!1,_prereqs:null,_isOpen:!1,_tolerance:null,_resizeData:null,_ignoreResizeTo:0,_orientationchangeInProgress:!1}),e.each(this.options,function(e,t){o.options[e]=n,o._setOption(e,t,!0)}),t.screen.bind("vclick",e.proxy(this,"_eatEventAndClose")),this._on(e.mobile.window,{orientationchange:e.proxy(this,"_handleWindowOrientationchange"),resize:e.proxy(this,"_handleWindowResize"),keyup:e.proxy(this,"_handleWindowKeyUp")}),this._on(e.mobile.document,{focusin:e.proxy(this,"_handleDocumentFocusIn")})},_applyTheme:function(e,t,i){for(var n,a=(e.attr("class")||"").split(" "),o=null,s=t+"";a.length>0;){if(o=a.pop(),n=RegExp("^ui-"+i+"-([a-z])$").exec(o),n&&n.length>1){o=n[1];break}o=null}t!==o&&(e.removeClass("ui-"+i+"-"+o),null!==t&&"none"!==t&&e.addClass("ui-"+i+"-"+s))},_setTheme:function(e){this._applyTheme(this.element,e,"body")},_setOverlayTheme:function(e){this._applyTheme(this._ui.screen,e,"overlay"),this._isOpen&&this._ui.screen.addClass("in")},_setShadow:function(e){this.element.toggleClass("ui-overlay-shadow",e)},_setCorners:function(e){this.element.toggleClass("ui-corner-all",e)},_applyTransition:function(t){this._ui.container.removeClass(this._fallbackTransition),t&&"none"!==t&&(this._fallbackTransition=e.mobile._maybeDegradeTransition(t),"none"===this._fallbackTransition&&(this._fallbackTransition=""),this._ui.container.addClass(this._fallbackTransition))},_setTransition:function(e){this._currentTransition||this._applyTransition(e)},_setTolerance:function(t){var i={t:30,r:15,b:30,l:15};if(t!==n){var a=(t+"").split(",");switch(e.each(a,function(e,t){a[e]=parseInt(t,10)}),a.length){case 1:isNaN(a[0])||(i.t=i.r=i.b=i.l=a[0]);break;case 2:isNaN(a[0])||(i.t=i.b=a[0]),isNaN(a[1])||(i.l=i.r=a[1]);break;case 4:isNaN(a[0])||(i.t=a[0]),isNaN(a[1])||(i.r=a[1]),isNaN(a[2])||(i.b=a[2]),isNaN(a[3])||(i.l=a[3]);break;default:}}this._tolerance=i},_setOption:function(t,i){var a,o="_set"+t.charAt(0).toUpperCase()+t.slice(1);this[o]!==n&&this[o](i),a=["initSelector","closeLinkSelector","closeLinkEvents","navigateEvents","closeEvents","history","container"],e.mobile.widget.prototype._setOption.apply(this,arguments),-1===e.inArray(t,a)&&this.element.attr("data-"+(e.mobile.ns||"")+t.replace(/([A-Z])/,"-$1").toLowerCase(),i)},_placementCoords:function(e){var t,n,s=o(),r={x:this._tolerance.l,y:s.y+this._tolerance.t,cx:s.cx-this._tolerance.l-this._tolerance.r,cy:s.cy-this._tolerance.t-this._tolerance.b};this._ui.container.css("max-width",r.cx),t={cx:this._ui.container.outerWidth(!0),cy:this._ui.container.outerHeight(!0)},n={x:a(r.cx,t.cx,r.x,e.x),y:a(r.cy,t.cy,r.y,e.y)},n.y=Math.max(0,n.y);var l=i.documentElement,d=i.body,c=Math.max(l.clientHeight,d.scrollHeight,d.offsetHeight,l.scrollHeight,l.offsetHeight);return n.y-=Math.min(n.y,Math.max(0,n.y+t.cy-c)),{left:n.x,top:n.y}},_createPrereqs:function(t,i,n){var a,o=this;a={screen:e.Deferred(),container:e.Deferred()},a.screen.then(function(){a===o._prereqs&&t()}),a.container.then(function(){a===o._prereqs&&i()}),e.when(a.screen,a.container).done(function(){a===o._prereqs&&(o._prereqs=null,n())}),o._prereqs=a},_animate:function(t){return this._ui.screen.removeClass(t.classToRemove).addClass(t.screenClassToAdd),t.prereqs.screen.resolve(),t.transition&&"none"!==t.transition&&(t.applyTransition&&this._applyTransition(t.transition),this._fallbackTransition)?(this._ui.container.animationComplete(e.proxy(t.prereqs.container,"resolve")).addClass(t.containerClassToAdd).removeClass(t.classToRemove),n):(this._ui.container.removeClass(t.classToRemove),t.prereqs.container.resolve(),n)},_desiredCoords:function(t){var i,n=null,a=o(),s=t.x,r=t.y,l=t.positionTo;if(l&&"origin"!==l)if("window"===l)s=a.cx/2+a.x,r=a.cy/2+a.y;else{try{n=e(l)}catch(d){n=null}n&&(n.filter(":visible"),0===n.length&&(n=null))}return n&&(i=n.offset(),s=i.left+n.outerWidth()/2,r=i.top+n.outerHeight()/2),("number"!==e.type(s)||isNaN(s))&&(s=a.cx/2+a.x),("number"!==e.type(r)||isNaN(r))&&(r=a.cy/2+a.y),{x:s,y:r}},_reposition:function(e){e={x:e.x,y:e.y,positionTo:e.positionTo},this._trigger("beforeposition",e),this._ui.container.offset(this._placementCoords(this._desiredCoords(e)))},reposition:function(e){this._isOpen&&this._reposition(e)},_openPrereqsComplete:function(){this._ui.container.addClass("ui-popup-active"),this._isOpen=!0,this._resizeScreen(),this._ui.container.attr("tabindex","0").focus(),this._ignoreResizeEvents(),this._trigger("afteropen")},_open:function(t){var i=e.extend({},this.options,t),n=function(){var e=navigator.userAgent,t=e.match(/AppleWebKit\/([0-9\.]+)/),i=!!t&&t[1],n=e.match(/Android (\d+(?:\.\d+))/),a=!!n&&n[1],o=e.indexOf("Chrome")>-1;return null!==n&&"4.0"===a&&i&&i>534.13&&!o?!0:!1}();this._createPrereqs(e.noop,e.noop,e.proxy(this,"_openPrereqsComplete")),this._currentTransition=i.transition,this._applyTransition(i.transition),this.options.theme||this._setTheme(this._page.jqmData("theme")||e.mobile.getInheritedTheme(this._page,"c")),this._ui.screen.removeClass("ui-screen-hidden"),this._ui.container.removeClass("ui-popup-hidden"),this._reposition(i),this.options.overlayTheme&&n&&this.element.closest(".ui-page").addClass("ui-popup-open"),this._animate({additionalCondition:!0,transition:i.transition,classToRemove:"",screenClassToAdd:"in",containerClassToAdd:"in",applyTransition:!1,prereqs:this._prereqs})},_closePrereqScreen:function(){this._ui.screen.removeClass("out").addClass("ui-screen-hidden")},_closePrereqContainer:function(){this._ui.container.removeClass("reverse out").addClass("ui-popup-hidden").removeAttr("style")},_closePrereqsDone:function(){this.options,this._ui.container.removeAttr("tabindex"),e.mobile.popup.active=n,this._trigger("afterclose")},_close:function(t){this._ui.container.removeClass("ui-popup-active"),this._page.removeClass("ui-popup-open"),this._isOpen=!1,this._createPrereqs(e.proxy(this,"_closePrereqScreen"),e.proxy(this,"_closePrereqContainer"),e.proxy(this,"_closePrereqsDone")),this._animate({additionalCondition:this._ui.screen.hasClass("in"),transition:t?"none":this._currentTransition,classToRemove:"in",screenClassToAdd:"out",containerClassToAdd:"reverse out",applyTransition:!0,prereqs:this._prereqs})},_unenhance:function(){this._setTheme("none"),this.element.detach().insertAfter(this._ui.placeholder).removeClass("ui-popup ui-overlay-shadow ui-corner-all"),this._ui.screen.remove(),this._ui.container.remove(),this._ui.placeholder.remove()},_destroy:function(){e.mobile.popup.active===this?(this.element.one("popupafterclose",e.proxy(this,"_unenhance")),this.close()):this._unenhance()},_closePopup:function(i,n){var a,o,s=this.options,r=!1;t.scrollTo(0,this._scrollTop),i&&"pagebeforechange"===i.type&&n&&(a="string"==typeof n.toPage?n.toPage:n.toPage.jqmData("url"),a=e.mobile.path.parseUrl(a),o=a.pathname+a.search+a.hash,this._myUrl!==e.mobile.path.makeUrlAbsolute(o)?r=!0:i.preventDefault()),s.container.unbind(s.closeEvents),this.element.undelegate(s.closeLinkSelector,s.closeLinkEvents),this._close(r)},_bindContainerClose:function(){this.options.container.one(this.options.closeEvents,e.proxy(this,"_closePopup"))},open:function(i){var a,o,s,r,l,d,c=this,h=this.options;if(!e.mobile.popup.active){if(e.mobile.popup.active=this,this._scrollTop=e.mobile.window.scrollTop(),!h.history)return c._open(i),c._bindContainerClose(),c.element.delegate(h.closeLinkSelector,h.closeLinkEvents,function(e){c.close(),e.preventDefault()}),n;if(d=e.mobile.urlHistory,o=e.mobile.dialogHashKey,s=e.mobile.activePage,r=s.is(".ui-dialog"),this._myUrl=a=d.getActive().url,l=a.indexOf(o)>-1&&!r&&d.activeIndex>0)return c._open(i),c._bindContainerClose(),n;-1!==a.indexOf(o)||r?a=e.mobile.path.parseLocation().hash+o:a+=a.indexOf("#")>-1?o:"#"+o,0===d.activeIndex&&a===d.initialDst&&(a+=o),e(t).one("beforenavigate",function(e){e.preventDefault(),c._open(i),c._bindContainerClose()}),this.urlAltered=!0,e.mobile.navigate(a,{role:"dialog"})}},close:function(){e.mobile.popup.active===this&&(this._scrollTop=e.mobile.window.scrollTop(),this.options.history&&this.urlAltered?(e.mobile.back(),this.urlAltered=!1):this._closePopup())}}),e.mobile.popup.handleLink=function(t){var i,n=t.closest(":jqmData(role='page')"),a=0===n.length?e("body"):n,o=e(e.mobile.path.parseUrl(t.attr("href")).hash,a[0]);o.data("mobile-popup")&&(i=t.offset(),o.popup("open",{x:i.left+t.outerWidth()/2,y:i.top+t.outerHeight()/2,transition:t.jqmData("transition"),positionTo:t.jqmData("position-to")})),setTimeout(function(){var i=t.parent().parent();i.hasClass("ui-li")&&(t=i.parent()),t.removeClass(e.mobile.activeBtnClass)},300)},e.mobile.document.bind("pagebeforechange",function(t,i){"popup"===i.options.role&&(e.mobile.popup.handleLink(i.options.link),t.preventDefault())}),e.mobile.document.bind("pagecreate create",function(t){e.mobile.popup.prototype.enhanceWithin(t.target,!0)})}(e),function(e,t){var n=function(n){var a,o,s,r=(n.select,n._destroy),l=n.selectID,d=l?l:(e.mobile.ns||"")+"uuid-"+n.uuid,c=d+"-listbox",h=d+"-dialog",u=n.label,p=n.select.closest(".ui-page"),m=n._selectOptions(),f=n.isMultiple=n.select[0].multiple,g=l+"-button",b=l+"-menu",v=e("<div data-"+e.mobile.ns+"role='dialog' id='"+h+"' data-"+e.mobile.ns+"theme='"+n.options.theme+"' data-"+e.mobile.ns+"overlay-theme='"+n.options.overlayTheme+"'>"+"<div data-"+e.mobile.ns+"role='header'>"+"<div class='ui-title'>"+u.getEncodedText()+"</div>"+"</div>"+"<div data-"+e.mobile.ns+"role='content'></div>"+"</div>"),_=e("<div id='"+c+"' class='ui-selectmenu'>").insertAfter(n.select).popup({theme:n.options.overlayTheme}),C=e("<ul>",{"class":"ui-selectmenu-list",id:b,role:"listbox","aria-labelledby":g}).attr("data-"+e.mobile.ns+"theme",n.options.theme).attr("data-"+e.mobile.ns+"divider-theme",n.options.dividerTheme).appendTo(_),x=e("<div>",{"class":"ui-header ui-bar-"+n.options.theme}).prependTo(_),y=e("<h1>",{"class":"ui-title"}).appendTo(x);n.isMultiple&&(s=e("<a>",{text:n.options.closeText,href:"#","class":"ui-btn-left"}).attr("data-"+e.mobile.ns+"iconpos","notext").attr("data-"+e.mobile.ns+"icon","delete").appendTo(x).buttonMarkup()),e.extend(n,{select:n.select,selectID:l,buttonId:g,menuId:b,popupID:c,dialogID:h,thisPage:p,menuPage:v,label:u,selectOptions:m,isMultiple:f,theme:n.options.theme,listbox:_,list:C,header:x,headerTitle:y,headerClose:s,menuPageContent:a,menuPageClose:o,placeholder:"",build:function(){var i=this;i.refresh(),i._origTabIndex===t&&(i._origTabIndex=null===i.select[0].getAttribute("tabindex")?!1:i.select.attr("tabindex")),i.select.attr("tabindex","-1").focus(function(){e(this).blur(),i.button.focus()}),i.button.bind("vclick keydown",function(t){i.options.disabled||i.isOpen||("vclick"===t.type||t.keyCode&&(t.keyCode===e.mobile.keyCode.ENTER||t.keyCode===e.mobile.keyCode.SPACE))&&(i._decideFormat(),"overlay"===i.menuType?i.button.attr("href","#"+i.popupID).attr("data-"+(e.mobile.ns||"")+"rel","popup"):i.button.attr("href","#"+i.dialogID).attr("data-"+(e.mobile.ns||"")+"rel","dialog"),i.isOpen=!0)}),i.list.attr("role","listbox").bind("focusin",function(t){e(t.target).attr("tabindex","0").trigger("vmouseover")}).bind("focusout",function(t){e(t.target).attr("tabindex","-1").trigger("vmouseout")}).delegate("li:not(.ui-disabled, .ui-li-divider)","click",function(t){var a=i.select[0].selectedIndex,o=i.list.find("li:not(.ui-li-divider)").index(this),s=i._selectOptions().eq(o)[0];s.selected=i.isMultiple?!s.selected:!0,i.isMultiple&&e(this).find(".ui-icon").toggleClass("ui-icon-checkbox-on",s.selected).toggleClass("ui-icon-checkbox-off",!s.selected),(i.isMultiple||a!==o)&&i.select.trigger("change"),i.isMultiple?i.list.find("li:not(.ui-li-divider)").eq(o).addClass("ui-btn-down-"+n.options.theme).find("a").first().focus():i.close(),t.preventDefault()}).keydown(function(t){var i,a,o=e(t.target),s=o.closest("li");switch(t.keyCode){case 38:return i=s.prev().not(".ui-selectmenu-placeholder"),i.is(".ui-li-divider")&&(i=i.prev()),i.length&&(o.blur().attr("tabindex","-1"),i.addClass("ui-btn-down-"+n.options.theme).find("a").first().focus()),!1;case 40:return a=s.next(),a.is(".ui-li-divider")&&(a=a.next()),a.length&&(o.blur().attr("tabindex","-1"),a.addClass("ui-btn-down-"+n.options.theme).find("a").first().focus()),!1;case 13:case 32:return o.trigger("click"),!1}}),i.menuPage.bind("pagehide",function(){e.mobile._bindPageRemove.call(i.thisPage)}),i.listbox.bind("popupafterclose",function(){i.close()}),i.isMultiple&&i.headerClose.click(function(){return"overlay"===i.menuType?(i.close(),!1):t}),i.thisPage.addDependents(this.menuPage)},_isRebuildRequired:function(){var e=this.list.find("li"),t=this._selectOptions();return t.text()!==e.text()},selected:function(){return this._selectOptions().filter(":selected:not( :jqmData(placeholder='true') )")},refresh:function(t){var i,n=this;this.element,this.isMultiple,(t||this._isRebuildRequired())&&n._buildList(),i=this.selectedIndices(),n.setButtonText(),n.setButtonCount(),n.list.find("li:not(.ui-li-divider)").removeClass(e.mobile.activeBtnClass).attr("aria-selected",!1).each(function(t){if(e.inArray(t,i)>-1){var a=e(this);a.attr("aria-selected",!0),n.isMultiple?a.find(".ui-icon").removeClass("ui-icon-checkbox-off").addClass("ui-icon-checkbox-on"):a.is(".ui-selectmenu-placeholder")?a.next().addClass(e.mobile.activeBtnClass):a.addClass(e.mobile.activeBtnClass)}})},close:function(){if(!this.options.disabled&&this.isOpen){var e=this;"page"===e.menuType?(e.menuPage.dialog("close"),e.list.appendTo(e.listbox)):e.listbox.popup("close"),e._focusButton(),e.isOpen=!1}},open:function(){this.button.click()},_decideFormat:function(){function t(){var t=i.list.find("."+e.mobile.activeBtnClass+" a");0===t.length&&(t=i.list.find("li.ui-btn:not( :jqmData(placeholder='true') ) a")),t.first().focus().closest("li").addClass("ui-btn-down-"+n.options.theme)}var i=this,a=e.mobile.window,o=i.list.parent(),s=o.outerHeight(),r=(o.outerWidth(),e("."+e.mobile.activePageClass),a.scrollTop()),l=i.button.offset().top,d=a.height();a.width(),s>d-80||!e.support.scrollTop?(i.menuPage.appendTo(e.mobile.pageContainer).page(),i.menuPageContent=v.find(".ui-content"),i.menuPageClose=v.find(".ui-header a"),i.thisPage.unbind("pagehide.remove"),0===r&&l>d&&i.thisPage.one("pagehide",function(){e(this).jqmData("lastScroll",l)}),i.menuPage.one("pageshow",function(){t()}).one("pagehide",function(){i.close()}),i.menuType="page",i.menuPageContent.append(i.list),i.menuPage.find("div .ui-title").text(i.label.text())):(i.menuType="overlay",i.listbox.one("popupafteropen",t))},_buildList:function(){var t=this,n=this.options,a=this.placeholder,o=!0,s=t.isMultiple?"checkbox-off":"false";t.list.empty().filter(".ui-listview").listview("destroy");for(var r,l=t.select.find("option"),d=l.length,c=this.select[0],h="data-"+e.mobile.ns,u=h+"option-index",p=h+"icon",m=h+"role",f=h+"placeholder",g=i.createDocumentFragment(),b=!1,v=0;d>v;v++,b=!1){var _=l[v],C=e(_),x=_.parentNode,y=C.text(),w=i.createElement("a"),T=[];if(w.setAttribute("href","#"),w.appendChild(i.createTextNode(y)),x!==c&&"optgroup"===x.nodeName.toLowerCase()){var D=x.getAttribute("label");if(D!==r){var P=i.createElement("li");P.setAttribute(m,"list-divider"),P.setAttribute("role","option"),P.setAttribute("tabindex","-1"),P.appendChild(i.createTextNode(D)),g.appendChild(P),r=D}}!o||_.getAttribute("value")&&0!==y.length&&!C.jqmData("placeholder")||(o=!1,b=!0,null===_.getAttribute(f)&&(this._removePlaceholderAttr=!0),_.setAttribute(f,!0),n.hidePlaceholderMenuItems&&T.push("ui-selectmenu-placeholder"),a!==y&&(a=t.placeholder=y));var k=i.createElement("li");_.disabled&&(T.push("ui-disabled"),k.setAttribute("aria-disabled",!0)),k.setAttribute(u,v),k.setAttribute(p,s),b&&k.setAttribute(f,!0),k.className=T.join(" "),k.setAttribute("role","option"),w.setAttribute("tabindex","-1"),k.appendChild(w),g.appendChild(k)}t.list[0].appendChild(g),this.isMultiple||a.length?this.headerTitle.text(this.placeholder):this.header.hide(),t.list.listview()},_button:function(){return e("<a>",{href:"#",role:"button",id:this.buttonId,"aria-haspopup":"true","aria-owns":this.menuId})},_destroy:function(){this.close(),this._origTabIndex!==t&&(this._origTabIndex!==!1?this.select.attr("tabindex",this._origTabIndex):this.select.removeAttr("tabindex")),this._removePlaceholderAttr&&this._selectOptions().removeAttr("data-"+e.mobile.ns+"placeholder"),this.listbox.remove(),r.apply(this,arguments)}})};e.mobile.document.bind("selectmenubeforecreate",function(t){var i=e(t.target).data("mobile-selectmenu");i.options.nativeMenu||0!==i.element.parents(":jqmData(role='popup')").length||n(i)})}(e),function(e,t){e.widget("mobile.controlgroup",e.mobile.widget,e.extend({options:{shadow:!1,corners:!0,excludeInvisible:!0,type:"vertical",mini:!1,initSelector:":jqmData(role='controlgroup')"},_create:function(){var i=this.element,n={inner:e("<div class='ui-controlgroup-controls'></div>"),legend:e("<div role='heading' class='ui-controlgroup-label'></div>")},a=i.children("legend"),o=this;i.wrapInner(n.inner),a.length&&n.legend.append(a).insertBefore(i.children(0)),i.addClass("ui-corner-all ui-controlgroup"),e.extend(this,{_initialRefresh:!0}),e.each(this.options,function(e,i){o.options[e]=t,o._setOption(e,i,!0)})},_init:function(){this.refresh()},_setOption:function(i,n){var a="_set"+i.charAt(0).toUpperCase()+i.slice(1);this[a]!==t&&this[a](n),this._super(i,n),this.element.attr("data-"+(e.mobile.ns||"")+i.replace(/([A-Z])/,"-$1").toLowerCase(),n)},_setType:function(e){this.element.removeClass("ui-controlgroup-horizontal ui-controlgroup-vertical").addClass("ui-controlgroup-"+e),this.refresh()},_setCorners:function(e){this.element.toggleClass("ui-corner-all",e)},_setShadow:function(e){this.element.toggleClass("ui-shadow",e)},_setMini:function(e){this.element.toggleClass("ui-mini",e)},container:function(){return this.element.children(".ui-controlgroup-controls")},refresh:function(){var t=this.element.find(".ui-btn").not(".ui-slider-handle"),i=this._initialRefresh;e.mobile.checkboxradio&&this.element.find(":mobile-checkboxradio").checkboxradio("refresh"),this._addFirstLastClasses(t,this.options.excludeInvisible?this._getVisibles(t,i):t,i),this._initialRefresh=!1}},e.mobile.behaviors.addFirstLastClasses)),e(function(){e.mobile.document.bind("pagecreate create",function(t){e.mobile.controlgroup.prototype.enhanceWithin(t.target,!0)})})}(e),function(e){e(i).bind("pagecreate create",function(t){e(t.target).find("a").jqmEnhanceable().not(".ui-btn, .ui-link-inherit, :jqmData(role='none'), :jqmData(role='nojs')").addClass("ui-link")})}(e),function(e,t){e.widget("mobile.fixedtoolbar",e.mobile.widget,{options:{visibleOnPageShow:!0,disablePageZoom:!0,transition:"slide",fullscreen:!1,tapToggle:!0,tapToggleBlacklist:"a, button, input, select, textarea, .ui-header-fixed, .ui-footer-fixed, .ui-popup, .ui-panel, .ui-panel-dismiss-open",hideDuringFocus:"input, textarea, select",updatePagePadding:!0,trackPersistentToolbars:!0,supportBlacklist:function(){return!e.support.fixedPosition},initSelector:":jqmData(position='fixed')"},_create:function(){var i=this,n=i.options,a=i.element,o=a.is(":jqmData(role='header')")?"header":"footer",s=a.closest(".ui-page");return n.supportBlacklist()?(i.destroy(),t):(a.addClass("ui-"+o+"-fixed"),n.fullscreen?(a.addClass("ui-"+o+"-fullscreen"),s.addClass("ui-page-"+o+"-fullscreen")):s.addClass("ui-page-"+o+"-fixed"),e.extend(this,{_thisPage:null}),i._addTransitionClass(),i._bindPageEvents(),i._bindToggleHandlers(),t)},_addTransitionClass:function(){var e=this.options.transition;e&&"none"!==e&&("slide"===e&&(e=this.element.is(".ui-header")?"slidedown":"slideup"),this.element.addClass(e))},_bindPageEvents:function(){this._thisPage=this.element.closest(".ui-page"),this._on(this._thisPage,{pagebeforeshow:"_handlePageBeforeShow",webkitAnimationStart:"_handleAnimationStart",animationstart:"_handleAnimationStart",updatelayout:"_handleAnimationStart",pageshow:"_handlePageShow",pagebeforehide:"_handlePageBeforeHide"})},_handlePageBeforeShow:function(){var t=this.options;t.disablePageZoom&&e.mobile.zoom.disable(!0),t.visibleOnPageShow||this.hide(!0)},_handleAnimationStart:function(){this.options.updatePagePadding&&this.updatePagePadding(this._thisPage)},_handlePageShow:function(){this.updatePagePadding(this._thisPage),this.options.updatePagePadding&&this._on(e.mobile.window,{throttledresize:"updatePagePadding"})},_handlePageBeforeHide:function(t,i){var n=this.options;if(n.disablePageZoom&&e.mobile.zoom.enable(!0),n.updatePagePadding&&this._off(e.mobile.window,"throttledresize"),n.trackPersistentToolbars){var a=e(".ui-footer-fixed:jqmData(id)",this._thisPage),o=e(".ui-header-fixed:jqmData(id)",this._thisPage),s=a.length&&i.nextPage&&e(".ui-footer-fixed:jqmData(id='"+a.jqmData("id")+"')",i.nextPage)||e(),r=o.length&&i.nextPage&&e(".ui-header-fixed:jqmData(id='"+o.jqmData("id")+"')",i.nextPage)||e();(s.length||r.length)&&(s.add(r).appendTo(e.mobile.pageContainer),i.nextPage.one("pageshow",function(){r.prependTo(this),s.appendTo(this)}))}},_visible:!0,updatePagePadding:function(i){var n=this.element,a=n.is(".ui-header"),o=parseFloat(n.css(a?"top":"bottom"));this.options.fullscreen||(i=i&&i.type===t&&i||this._thisPage||n.closest(".ui-page"),e(i).css("padding-"+(a?"top":"bottom"),n.outerHeight()+o))},_useTransition:function(t){var i=e.mobile.window,n=this.element,a=i.scrollTop(),o=n.height(),s=n.closest(".ui-page").height(),r=e.mobile.getScreenHeight(),l=n.is(":jqmData(role='header')")?"header":"footer";return!t&&(this.options.transition&&"none"!==this.options.transition&&("header"===l&&!this.options.fullscreen&&a>o||"footer"===l&&!this.options.fullscreen&&s-o>a+r)||this.options.fullscreen)},show:function(e){var t="ui-fixed-hidden",i=this.element;this._useTransition(e)?i.removeClass("out "+t).addClass("in").animationComplete(function(){i.removeClass("in")}):i.removeClass(t),this._visible=!0},hide:function(e){var t="ui-fixed-hidden",i=this.element,n="out"+("slide"===this.options.transition?" reverse":"");this._useTransition(e)?i.addClass(n).removeClass("in").animationComplete(function(){i.addClass(t).removeClass(n)}):i.addClass(t).removeClass(n),this._visible=!1},toggle:function(){this[this._visible?"hide":"show"]()},_bindToggleHandlers:function(){var t,i,n=this,a=n.options,o=n.element,s=!0;o.closest(".ui-page").bind("vclick",function(t){a.tapToggle&&!e(t.target).closest(a.tapToggleBlacklist).length&&n.toggle()}).bind("focusin focusout",function(o){1025>screen.width&&e(o.target).is(a.hideDuringFocus)&&!e(o.target).closest(".ui-header-fixed, .ui-footer-fixed").length&&("focusout"!==o.type||s?"focusin"===o.type&&s&&(clearTimeout(t),s=!1,i=setTimeout(function(){n.hide()},0)):(s=!0,clearTimeout(i),t=setTimeout(function(){n.show()},0)))})},_destroy:function(){var e=this.element,t=e.is(".ui-header");e.closest(".ui-page").css("padding-"+(t?"top":"bottom"),""),e.removeClass("ui-header-fixed ui-footer-fixed ui-header-fullscreen ui-footer-fullscreen in out fade slidedown slideup ui-fixed-hidden"),e.closest(".ui-page").removeClass("ui-page-header-fixed ui-page-footer-fixed ui-page-header-fullscreen ui-page-footer-fullscreen")}}),e.mobile.document.bind("pagecreate create",function(t){e(t.target).jqmData("fullscreen")&&e(e.mobile.fixedtoolbar.prototype.options.initSelector,t.target).not(":jqmData(fullscreen)").jqmData("fullscreen",!0),e.mobile.fixedtoolbar.prototype.enhanceWithin(t.target)})}(e),function(e){e.widget("mobile.fixedtoolbar",e.mobile.fixedtoolbar,{_create:function(){this._super(),this._workarounds()},_workarounds:function(){var e=navigator.userAgent,t=navigator.platform,i=e.match(/AppleWebKit\/([0-9]+)/),n=!!i&&i[1],a=null,o=this;if(t.indexOf("iPhone")>-1||t.indexOf("iPad")>-1||t.indexOf("iPod")>-1)a="ios";else{if(!(e.indexOf("Android")>-1))return;a="android"}if("ios"===a)o._bindScrollWorkaround();else{if(!("android"===a&&n&&534>n))return;o._bindScrollWorkaround(),o._bindListThumbWorkaround()}},_viewportOffset:function(){var t=this.element,i=t.is(".ui-header"),n=Math.abs(t.offset().top-e.mobile.window.scrollTop());return i||(n=Math.round(n-e.mobile.window.height()+t.outerHeight())-60),n},_bindScrollWorkaround:function(){var t=this;this._on(e.mobile.window,{scrollstop:function(){var e=t._viewportOffset();e>2&&t._visible&&t._triggerRedraw()}})},_bindListThumbWorkaround:function(){this.element.closest(".ui-page").addClass("ui-android-2x-fixed")},_triggerRedraw:function(){var t=parseFloat(e(".ui-page-active").css("padding-bottom"));
e(".ui-page-active").css("padding-bottom",t+1+"px"),setTimeout(function(){e(".ui-page-active").css("padding-bottom",t+"px")},0)},destroy:function(){this._super(),this.element.closest(".ui-page-active").removeClass("ui-android-2x-fix")}})}(e),function(e,n){e.widget("mobile.panel",e.mobile.widget,{options:{classes:{panel:"ui-panel",panelOpen:"ui-panel-open",panelClosed:"ui-panel-closed",panelFixed:"ui-panel-fixed",panelInner:"ui-panel-inner",modal:"ui-panel-dismiss",modalOpen:"ui-panel-dismiss-open",pagePanel:"ui-page-panel",pagePanelOpen:"ui-page-panel-open",contentWrap:"ui-panel-content-wrap",contentWrapOpen:"ui-panel-content-wrap-open",contentWrapClosed:"ui-panel-content-wrap-closed",contentFixedToolbar:"ui-panel-content-fixed-toolbar",contentFixedToolbarOpen:"ui-panel-content-fixed-toolbar-open",contentFixedToolbarClosed:"ui-panel-content-fixed-toolbar-closed",animate:"ui-panel-animate"},animate:!0,theme:"c",position:"left",dismissible:!0,display:"reveal",initSelector:":jqmData(role='panel')",swipeClose:!0,positionFixed:!1},_panelID:null,_closeLink:null,_page:null,_modal:null,_panelInner:null,_wrapper:null,_fixedToolbar:null,_create:function(){var t=this,i=t.element,n=i.closest(":jqmData(role='page')"),a=function(){var t=e.data(n[0],"mobilePage").options.theme,i="ui-body-"+t;return i},o=function(){var e=i.find("."+t.options.classes.panelInner);return 0===e.length&&(e=i.children().wrapAll('<div class="'+t.options.classes.panelInner+'" />').parent()),e},s=function(){var i=n.find("."+t.options.classes.contentWrap);return 0===i.length&&(i=n.children(".ui-header:not(:jqmData(position='fixed')), .ui-content:not(:jqmData(role='popup')), .ui-footer:not(:jqmData(position='fixed'))").wrapAll('<div class="'+t.options.classes.contentWrap+" "+a()+'" />').parent(),e.support.cssTransform3d&&t.options.animate&&i.addClass(t.options.classes.animate)),i},r=function(){var i=n.find("."+t.options.classes.contentFixedToolbar);return 0===i.length&&(i=n.find(".ui-header:jqmData(position='fixed'), .ui-footer:jqmData(position='fixed')").addClass(t.options.classes.contentFixedToolbar),e.support.cssTransform3d&&t.options.animate&&i.addClass(t.options.classes.animate)),i};e.extend(this,{_panelID:i.attr("id"),_closeLink:i.find(":jqmData(rel='close')"),_page:i.closest(":jqmData(role='page')"),_pageTheme:a(),_panelInner:o(),_wrapper:s(),_fixedToolbar:r()}),t._addPanelClasses(),t._wrapper.addClass(this.options.classes.contentWrapClosed),t._fixedToolbar.addClass(this.options.classes.contentFixedToolbarClosed),t._page.addClass(t.options.classes.pagePanel),e.support.cssTransform3d&&t.options.animate&&this.element.addClass(t.options.classes.animate),t._bindUpdateLayout(),t._bindCloseEvents(),t._bindLinkListeners(),t._bindPageEvents(),t.options.dismissible&&t._createModal(),t._bindSwipeEvents()},_createModal:function(){var t=this;t._modal=e("<div class='"+t.options.classes.modal+"' data-panelid='"+t._panelID+"'></div>").on("mousedown",function(){t.close()}).appendTo(this._page)},_getPosDisplayClasses:function(e){return e+"-position-"+this.options.position+" "+e+"-display-"+this.options.display},_getPanelClasses:function(){var e=this.options.classes.panel+" "+this._getPosDisplayClasses(this.options.classes.panel)+" "+this.options.classes.panelClosed;return this.options.theme&&(e+=" ui-body-"+this.options.theme),this.options.positionFixed&&(e+=" "+this.options.classes.panelFixed),e},_addPanelClasses:function(){this.element.addClass(this._getPanelClasses())},_bindCloseEvents:function(){var e=this;e._closeLink.on("click.panel",function(t){return t.preventDefault(),e.close(),!1}),e.element.on("click.panel","a:jqmData(ajax='false')",function(){e.close()})},_positionPanel:function(){var t=this,i=t._panelInner.outerHeight(),n=i>e.mobile.getScreenHeight();n||!t.options.positionFixed?(n&&(t._unfixPanel(),e.mobile.resetActivePageHeight(i)),t._scrollIntoView(i)):t._fixPanel()},_scrollIntoView:function(i){e(t).scrollTop()>i&&t.scrollTo(0,0)},_bindFixListener:function(){this._on(e(t),{throttledresize:"_positionPanel"})},_unbindFixListener:function(){this._off(e(t),"throttledresize")},_unfixPanel:function(){this.options.positionFixed&&e.support.fixedPosition&&this.element.removeClass(this.options.classes.panelFixed)},_fixPanel:function(){this.options.positionFixed&&e.support.fixedPosition&&this.element.addClass(this.options.classes.panelFixed)},_bindUpdateLayout:function(){var e=this;e.element.on("updatelayout",function(){e._open&&e._positionPanel()})},_bindLinkListeners:function(){var t=this;t._page.on("click.panel","a",function(i){if(this.href.split("#")[1]===t._panelID&&t._panelID!==n){i.preventDefault();var a=e(this);return a.hasClass("ui-link")||(a.addClass(e.mobile.activeBtnClass),t.element.one("panelopen panelclose",function(){a.removeClass(e.mobile.activeBtnClass)})),t.toggle(),!1}})},_bindSwipeEvents:function(){var e=this,t=e._modal?e.element.add(e._modal):e.element;e.options.swipeClose&&("left"===e.options.position?t.on("swipeleft.panel",function(){e.close()}):t.on("swiperight.panel",function(){e.close()}))},_bindPageEvents:function(){var e=this;e._page.on("panelbeforeopen",function(t){e._open&&t.target!==e.element[0]&&e.close()}).on("pagehide",function(){e._open&&e.close(!0)}).on("keyup.panel",function(t){27===t.keyCode&&e._open&&e.close()})},_open:!1,_contentWrapOpenClasses:null,_fixedToolbarOpenClasses:null,_modalOpenClasses:null,open:function(t){if(!this._open){var i=this,n=i.options,a=function(){i._page.off("panelclose"),i._page.jqmData("panel","open"),!t&&e.support.cssTransform3d&&n.animate?i.element.add(i._wrapper).on(i._transitionEndEvents,o):setTimeout(o,0),i.options.theme&&"overlay"!==i.options.display&&i._page.removeClass(i._pageTheme).addClass("ui-body-"+i.options.theme),i.element.removeClass(n.classes.panelClosed).addClass(n.classes.panelOpen),i._positionPanel(),i.options.theme&&"overlay"!==i.options.display&&i._wrapper.css("min-height",i._page.css("min-height")),i._contentWrapOpenClasses=i._getPosDisplayClasses(n.classes.contentWrap),i._wrapper.removeClass(n.classes.contentWrapClosed).addClass(i._contentWrapOpenClasses+" "+n.classes.contentWrapOpen),i._fixedToolbarOpenClasses=i._getPosDisplayClasses(n.classes.contentFixedToolbar),i._fixedToolbar.removeClass(n.classes.contentFixedToolbarClosed).addClass(i._fixedToolbarOpenClasses+" "+n.classes.contentFixedToolbarOpen),i._modalOpenClasses=i._getPosDisplayClasses(n.classes.modal)+" "+n.classes.modalOpen,i._modal&&i._modal.addClass(i._modalOpenClasses)},o=function(){i.element.add(i._wrapper).off(i._transitionEndEvents,o),i._page.addClass(n.classes.pagePanelOpen),i._bindFixListener(),i._trigger("open")};0>this.element.closest(".ui-page-active").length&&(t=!0),i._trigger("beforeopen"),"open"===i._page.jqmData("panel")?i._page.on("panelclose",function(){a()}):a(),i._open=!0}},close:function(t){if(this._open){var i=this.options,n=this,a=function(){!t&&e.support.cssTransform3d&&i.animate?n.element.add(n._wrapper).on(n._transitionEndEvents,o):setTimeout(o,0),n._page.removeClass(i.classes.pagePanelOpen),n.element.removeClass(i.classes.panelOpen),n._wrapper.removeClass(i.classes.contentWrapOpen),n._fixedToolbar.removeClass(i.classes.contentFixedToolbarOpen),n._modal&&n._modal.removeClass(n._modalOpenClasses)},o=function(){n.options.theme&&"overlay"!==n.options.display&&(n._page.removeClass("ui-body-"+n.options.theme).addClass(n._pageTheme),n._wrapper.css("min-height","")),n.element.add(n._wrapper).off(n._transitionEndEvents,o),n.element.addClass(i.classes.panelClosed),n._wrapper.removeClass(n._contentWrapOpenClasses).addClass(i.classes.contentWrapClosed),n._fixedToolbar.removeClass(n._fixedToolbarOpenClasses).addClass(i.classes.contentFixedToolbarClosed),n._fixPanel(),n._unbindFixListener(),e.mobile.resetActivePageHeight(),n._page.jqmRemoveData("panel"),n._trigger("close")};0>this.element.closest(".ui-page-active").length&&(t=!0),n._trigger("beforeclose"),a(),n._open=!1}},toggle:function(){this[this._open?"close":"open"]()},_transitionEndEvents:"webkitTransitionEnd oTransitionEnd otransitionend transitionend msTransitionEnd",_destroy:function(){var t=this.options.classes,i=this.options.theme,n=this.element.siblings("."+t.panel).length;n?this._open&&(this._wrapper.removeClass(t.contentWrapOpen),this._fixedToolbar.removeClass(t.contentFixedToolbarOpen),this._page.jqmRemoveData("panel"),this._page.removeClass(t.pagePanelOpen),i&&this._page.removeClass("ui-body-"+i).addClass(this._pageTheme)):(this._wrapper.children().unwrap(),this._page.find("a").unbind("panelopen panelclose"),this._page.removeClass(t.pagePanel),this._open&&(this._page.jqmRemoveData("panel"),this._page.removeClass(t.pagePanelOpen),i&&this._page.removeClass("ui-body-"+i).addClass(this._pageTheme),e.mobile.resetActivePageHeight())),this._panelInner.children().unwrap(),this.element.removeClass([this._getPanelClasses(),t.panelAnimate].join(" ")).off("swipeleft.panel swiperight.panel").off("panelbeforeopen").off("panelhide").off("keyup.panel").off("updatelayout"),this._closeLink.off("click.panel"),this._modal&&this._modal.remove(),this.element.off(this._transitionEndEvents).removeClass([t.panelUnfixed,t.panelClosed,t.panelOpen].join(" "))}}),e(i).bind("pagecreate create",function(t){e.mobile.panel.prototype.enhanceWithin(t.target)})}(e),function(e,t){e.widget("mobile.table",e.mobile.widget,{options:{classes:{table:"ui-table"},initSelector:":jqmData(role='table')"},_create:function(){var e=this;e.refresh(!0)},refresh:function(i){var n=this,a=this.element.find("thead tr");i&&this.element.addClass(this.options.classes.table),n.headers=this.element.find("tr:eq(0)").children(),n.allHeaders=n.headers.add(a.children()),a.each(function(){var o=0;e(this).children().each(function(){var s=parseInt(e(this).attr("colspan"),10),r=":nth-child("+(o+1)+")";if(e(this).jqmData("colstart",o+1),s)for(var l=0;s-1>l;l++)o++,r+=", :nth-child("+(o+1)+")";i===t&&e(this).jqmData("cells",""),e(this).jqmData("cells",n.element.find("tr").not(a.eq(0)).not(this).children(r)),o++})}),i===t&&this.element.trigger("refresh")}}),e.mobile.document.bind("pagecreate create",function(t){e.mobile.table.prototype.enhanceWithin(t.target)})}(e),function(e,t){e.mobile.table.prototype.options.mode="columntoggle",e.mobile.table.prototype.options.columnBtnTheme=null,e.mobile.table.prototype.options.columnPopupTheme=null,e.mobile.table.prototype.options.columnBtnText="Columns...",e.mobile.table.prototype.options.classes=e.extend(e.mobile.table.prototype.options.classes,{popup:"ui-table-columntoggle-popup",columnBtn:"ui-table-columntoggle-btn",priorityPrefix:"ui-table-priority-",columnToggleTable:"ui-table-columntoggle"}),e.mobile.document.delegate(":jqmData(role='table')","tablecreate refresh",function(i){var n,a,o,s,r=e(this),l=r.data("mobile-table"),d=i.type,c=l.options,h=e.mobile.ns,u=(r.attr("id")||c.classes.popup)+"-popup";"columntoggle"===c.mode&&("refresh"!==d&&(l.element.addClass(c.classes.columnToggleTable),n=e("<a href='#"+u+"' class='"+c.classes.columnBtn+"' data-"+h+"rel='popup' data-"+h+"mini='true'>"+c.columnBtnText+"</a>"),a=e("<div data-"+h+"role='popup' data-"+h+"role='fieldcontain' class='"+c.classes.popup+"' id='"+u+"'></div>"),o=e("<fieldset data-"+h+"role='controlgroup'></fieldset>")),l.headers.not("td").each(function(t){var i=e(this).jqmData("priority"),n=e(this).add(e(this).jqmData("cells"));i&&(n.addClass(c.classes.priorityPrefix+i),"refresh"!==d?e("<label><input type='checkbox' checked />"+e(this).text()+"</label>").appendTo(o).children(0).jqmData("cells",n).checkboxradio({theme:c.columnPopupTheme}):e("#"+u+" fieldset div:eq("+t+")").find("input").jqmData("cells",n))}),"refresh"!==d&&o.appendTo(a),s=o===t?e("#"+u+" fieldset"):o,"refresh"!==d&&(s.on("change","input",function(){this.checked?e(this).jqmData("cells").removeClass("ui-table-cell-hidden").addClass("ui-table-cell-visible"):e(this).jqmData("cells").removeClass("ui-table-cell-visible").addClass("ui-table-cell-hidden")}),n.insertBefore(r).buttonMarkup({theme:c.columnBtnTheme}),a.insertBefore(r).popup()),l.update=function(){s.find("input").each(function(){this.checked?(this.checked="table-cell"===e(this).jqmData("cells").eq(0).css("display"),"refresh"===d&&e(this).jqmData("cells").addClass("ui-table-cell-visible")):e(this).jqmData("cells").addClass("ui-table-cell-hidden"),e(this).checkboxradio("refresh")})},e.mobile.window.on("throttledresize",l.update),l.update())})}(e),function(e){e.mobile.table.prototype.options.mode="reflow",e.mobile.table.prototype.options.classes=e.extend(e.mobile.table.prototype.options.classes,{reflowTable:"ui-table-reflow",cellLabels:"ui-table-cell-label"}),e.mobile.document.delegate(":jqmData(role='table')","tablecreate refresh",function(t){var i=e(this),n=t.type,a=i.data("mobile-table"),o=a.options;if("reflow"===o.mode){"refresh"!==n&&a.element.addClass(o.classes.reflowTable);var s=e(a.allHeaders.get().reverse());s.each(function(){var t=e(this).jqmData("cells"),i=e(this).jqmData("colstart"),n=t.not(this).filter("thead th").length&&" ui-table-cell-label-top",a=e(this).text();if(""!==a)if(n){var s=parseInt(e(this).attr("colspan"),10),r="";s&&(r="td:nth-child("+s+"n + "+i+")"),t.filter(r).prepend("<b class='"+o.classes.cellLabels+n+"'>"+a+"</b>")}else t.prepend("<b class='"+o.classes.cellLabels+"'>"+a+"</b>")})}})}(e),function(e,t){function i(e){o=e.originalEvent,d=o.accelerationIncludingGravity,s=Math.abs(d.x),r=Math.abs(d.y),l=Math.abs(d.z),!t.orientation&&(s>7||(l>6&&8>r||8>l&&r>6)&&s>5)?c.enabled&&c.disable():c.enabled||c.enable()}e.mobile.iosorientationfixEnabled=!0;var a=navigator.userAgent;if(!(/iPhone|iPad|iPod/.test(navigator.platform)&&/OS [1-5]_[0-9_]* like Mac OS X/i.test(a)&&a.indexOf("AppleWebKit")>-1))return e.mobile.iosorientationfixEnabled=!1,n;var o,s,r,l,d,c=e.mobile.zoom;e.mobile.document.on("mobileinit",function(){e.mobile.iosorientationfixEnabled&&e.mobile.window.bind("orientationchange.iosorientationfix",c.enable).bind("devicemotion.iosorientationfix",i)})}(e,this),function(e,t){function n(){a.removeClass("ui-mobile-rendering")}var a=e("html"),o=(e("head"),e.mobile.window);e(t.document).trigger("mobileinit"),e.mobile.gradeA()&&(e.mobile.ajaxBlacklist&&(e.mobile.ajaxEnabled=!1),a.addClass("ui-mobile ui-mobile-rendering"),setTimeout(n,5e3),e.extend(e.mobile,{initializePage:function(){var t=e.mobile.path,a=e(":jqmData(role='page'), :jqmData(role='dialog')"),s=t.stripHash(t.stripQueryParams(t.parseLocation().hash)),r=i.getElementById(s);a.length||(a=e("body").wrapInner("<div data-"+e.mobile.ns+"role='page'></div>").children(0)),a.each(function(){var t=e(this);t.jqmData("url")||t.attr("data-"+e.mobile.ns+"url",t.attr("id")||location.pathname+location.search)}),e.mobile.firstPage=a.first(),e.mobile.pageContainer=e.mobile.firstPage.parent().addClass("ui-mobile-viewport"),o.trigger("pagecontainercreate"),e.mobile.showPageLoadingMsg(),n(),e.mobile.hashListeningEnabled&&e.mobile.path.isHashValid(location.hash)&&(e(r).is(':jqmData(role="page")')||e.mobile.path.isPath(s)||s===e.mobile.dialogHashKey)?e.event.special.navigate.isPushStateEnabled()?(e.mobile.navigate.history.stack=[],e.mobile.navigate(e.mobile.path.isPath(location.hash)?location.hash:location.href)):o.trigger("hashchange",[!0]):(e.mobile.path.isHashValid(location.hash)&&(e.mobile.urlHistory.initialDst=s.replace("#","")),e.event.special.navigate.isPushStateEnabled()&&e.mobile.navigate.navigator.squash(t.parseLocation().href),e.mobile.changePage(e.mobile.firstPage,{transition:"none",reverse:!0,changeHash:!1,fromHashChange:!0}))}}),e.mobile.navreadyDeferred.resolve(),e(function(){t.scrollTo(0,1),e.mobile.defaultHomeScroll=e.support.scrollTop&&1!==e.mobile.window.scrollTop()?1:0,e.mobile.autoInitializePage&&e.mobile.initializePage(),o.load(e.mobile.silentScroll),e.support.cssPointerEvents||e.mobile.document.delegate(".ui-disabled","vclick",function(e){e.preventDefault(),e.stopImmediatePropagation()})}))}(e,this)});
//@ sourceMappingURL=jquery.mobile-1.3.1.min.map;
(function(){var n=this,t=n._,r={},e=Array.prototype,u=Object.prototype,i=Function.prototype,a=e.push,o=e.slice,c=e.concat,l=u.toString,f=u.hasOwnProperty,s=e.forEach,p=e.map,h=e.reduce,v=e.reduceRight,d=e.filter,g=e.every,m=e.some,y=e.indexOf,b=e.lastIndexOf,x=Array.isArray,_=Object.keys,j=i.bind,w=function(n){return n instanceof w?n:this instanceof w?(this._wrapped=n,void 0):new w(n)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=w),exports._=w):n._=w,w.VERSION="1.4.4";var A=w.each=w.forEach=function(n,t,e){if(null!=n)if(s&&n.forEach===s)n.forEach(t,e);else if(n.length===+n.length){for(var u=0,i=n.length;i>u;u++)if(t.call(e,n[u],u,n)===r)return}else for(var a in n)if(w.has(n,a)&&t.call(e,n[a],a,n)===r)return};w.map=w.collect=function(n,t,r){var e=[];return null==n?e:p&&n.map===p?n.map(t,r):(A(n,function(n,u,i){e[e.length]=t.call(r,n,u,i)}),e)};var O="Reduce of empty array with no initial value";w.reduce=w.foldl=w.inject=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),h&&n.reduce===h)return e&&(t=w.bind(t,e)),u?n.reduce(t,r):n.reduce(t);if(A(n,function(n,i,a){u?r=t.call(e,r,n,i,a):(r=n,u=!0)}),!u)throw new TypeError(O);return r},w.reduceRight=w.foldr=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),v&&n.reduceRight===v)return e&&(t=w.bind(t,e)),u?n.reduceRight(t,r):n.reduceRight(t);var i=n.length;if(i!==+i){var a=w.keys(n);i=a.length}if(A(n,function(o,c,l){c=a?a[--i]:--i,u?r=t.call(e,r,n[c],c,l):(r=n[c],u=!0)}),!u)throw new TypeError(O);return r},w.find=w.detect=function(n,t,r){var e;return E(n,function(n,u,i){return t.call(r,n,u,i)?(e=n,!0):void 0}),e},w.filter=w.select=function(n,t,r){var e=[];return null==n?e:d&&n.filter===d?n.filter(t,r):(A(n,function(n,u,i){t.call(r,n,u,i)&&(e[e.length]=n)}),e)},w.reject=function(n,t,r){return w.filter(n,function(n,e,u){return!t.call(r,n,e,u)},r)},w.every=w.all=function(n,t,e){t||(t=w.identity);var u=!0;return null==n?u:g&&n.every===g?n.every(t,e):(A(n,function(n,i,a){return(u=u&&t.call(e,n,i,a))?void 0:r}),!!u)};var E=w.some=w.any=function(n,t,e){t||(t=w.identity);var u=!1;return null==n?u:m&&n.some===m?n.some(t,e):(A(n,function(n,i,a){return u||(u=t.call(e,n,i,a))?r:void 0}),!!u)};w.contains=w.include=function(n,t){return null==n?!1:y&&n.indexOf===y?n.indexOf(t)!=-1:E(n,function(n){return n===t})},w.invoke=function(n,t){var r=o.call(arguments,2),e=w.isFunction(t);return w.map(n,function(n){return(e?t:n[t]).apply(n,r)})},w.pluck=function(n,t){return w.map(n,function(n){return n[t]})},w.where=function(n,t,r){return w.isEmpty(t)?r?null:[]:w[r?"find":"filter"](n,function(n){for(var r in t)if(t[r]!==n[r])return!1;return!0})},w.findWhere=function(n,t){return w.where(n,t,!0)},w.max=function(n,t,r){if(!t&&w.isArray(n)&&n[0]===+n[0]&&65535>n.length)return Math.max.apply(Math,n);if(!t&&w.isEmpty(n))return-1/0;var e={computed:-1/0,value:-1/0};return A(n,function(n,u,i){var a=t?t.call(r,n,u,i):n;a>=e.computed&&(e={value:n,computed:a})}),e.value},w.min=function(n,t,r){if(!t&&w.isArray(n)&&n[0]===+n[0]&&65535>n.length)return Math.min.apply(Math,n);if(!t&&w.isEmpty(n))return 1/0;var e={computed:1/0,value:1/0};return A(n,function(n,u,i){var a=t?t.call(r,n,u,i):n;e.computed>a&&(e={value:n,computed:a})}),e.value},w.shuffle=function(n){var t,r=0,e=[];return A(n,function(n){t=w.random(r++),e[r-1]=e[t],e[t]=n}),e};var k=function(n){return w.isFunction(n)?n:function(t){return t[n]}};w.sortBy=function(n,t,r){var e=k(t);return w.pluck(w.map(n,function(n,t,u){return{value:n,index:t,criteria:e.call(r,n,t,u)}}).sort(function(n,t){var r=n.criteria,e=t.criteria;if(r!==e){if(r>e||r===void 0)return 1;if(e>r||e===void 0)return-1}return n.index<t.index?-1:1}),"value")};var F=function(n,t,r,e){var u={},i=k(t||w.identity);return A(n,function(t,a){var o=i.call(r,t,a,n);e(u,o,t)}),u};w.groupBy=function(n,t,r){return F(n,t,r,function(n,t,r){(w.has(n,t)?n[t]:n[t]=[]).push(r)})},w.countBy=function(n,t,r){return F(n,t,r,function(n,t){w.has(n,t)||(n[t]=0),n[t]++})},w.sortedIndex=function(n,t,r,e){r=null==r?w.identity:k(r);for(var u=r.call(e,t),i=0,a=n.length;a>i;){var o=i+a>>>1;u>r.call(e,n[o])?i=o+1:a=o}return i},w.toArray=function(n){return n?w.isArray(n)?o.call(n):n.length===+n.length?w.map(n,w.identity):w.values(n):[]},w.size=function(n){return null==n?0:n.length===+n.length?n.length:w.keys(n).length},w.first=w.head=w.take=function(n,t,r){return null==n?void 0:null==t||r?n[0]:o.call(n,0,t)},w.initial=function(n,t,r){return o.call(n,0,n.length-(null==t||r?1:t))},w.last=function(n,t,r){return null==n?void 0:null==t||r?n[n.length-1]:o.call(n,Math.max(n.length-t,0))},w.rest=w.tail=w.drop=function(n,t,r){return o.call(n,null==t||r?1:t)},w.compact=function(n){return w.filter(n,w.identity)};var R=function(n,t,r){return A(n,function(n){w.isArray(n)?t?a.apply(r,n):R(n,t,r):r.push(n)}),r};w.flatten=function(n,t){return R(n,t,[])},w.without=function(n){return w.difference(n,o.call(arguments,1))},w.uniq=w.unique=function(n,t,r,e){w.isFunction(t)&&(e=r,r=t,t=!1);var u=r?w.map(n,r,e):n,i=[],a=[];return A(u,function(r,e){(t?e&&a[a.length-1]===r:w.contains(a,r))||(a.push(r),i.push(n[e]))}),i},w.union=function(){return w.uniq(c.apply(e,arguments))},w.intersection=function(n){var t=o.call(arguments,1);return w.filter(w.uniq(n),function(n){return w.every(t,function(t){return w.indexOf(t,n)>=0})})},w.difference=function(n){var t=c.apply(e,o.call(arguments,1));return w.filter(n,function(n){return!w.contains(t,n)})},w.zip=function(){for(var n=o.call(arguments),t=w.max(w.pluck(n,"length")),r=Array(t),e=0;t>e;e++)r[e]=w.pluck(n,""+e);return r},w.object=function(n,t){if(null==n)return{};for(var r={},e=0,u=n.length;u>e;e++)t?r[n[e]]=t[e]:r[n[e][0]]=n[e][1];return r},w.indexOf=function(n,t,r){if(null==n)return-1;var e=0,u=n.length;if(r){if("number"!=typeof r)return e=w.sortedIndex(n,t),n[e]===t?e:-1;e=0>r?Math.max(0,u+r):r}if(y&&n.indexOf===y)return n.indexOf(t,r);for(;u>e;e++)if(n[e]===t)return e;return-1},w.lastIndexOf=function(n,t,r){if(null==n)return-1;var e=null!=r;if(b&&n.lastIndexOf===b)return e?n.lastIndexOf(t,r):n.lastIndexOf(t);for(var u=e?r:n.length;u--;)if(n[u]===t)return u;return-1},w.range=function(n,t,r){1>=arguments.length&&(t=n||0,n=0),r=arguments[2]||1;for(var e=Math.max(Math.ceil((t-n)/r),0),u=0,i=Array(e);e>u;)i[u++]=n,n+=r;return i},w.bind=function(n,t){if(n.bind===j&&j)return j.apply(n,o.call(arguments,1));var r=o.call(arguments,2);return function(){return n.apply(t,r.concat(o.call(arguments)))}},w.partial=function(n){var t=o.call(arguments,1);return function(){return n.apply(this,t.concat(o.call(arguments)))}},w.bindAll=function(n){var t=o.call(arguments,1);return 0===t.length&&(t=w.functions(n)),A(t,function(t){n[t]=w.bind(n[t],n)}),n},w.memoize=function(n,t){var r={};return t||(t=w.identity),function(){var e=t.apply(this,arguments);return w.has(r,e)?r[e]:r[e]=n.apply(this,arguments)}},w.delay=function(n,t){var r=o.call(arguments,2);return setTimeout(function(){return n.apply(null,r)},t)},w.defer=function(n){return w.delay.apply(w,[n,1].concat(o.call(arguments,1)))},w.throttle=function(n,t){var r,e,u,i,a=0,o=function(){a=new Date,u=null,i=n.apply(r,e)};return function(){var c=new Date,l=t-(c-a);return r=this,e=arguments,0>=l?(clearTimeout(u),u=null,a=c,i=n.apply(r,e)):u||(u=setTimeout(o,l)),i}},w.debounce=function(n,t,r){var e,u;return function(){var i=this,a=arguments,o=function(){e=null,r||(u=n.apply(i,a))},c=r&&!e;return clearTimeout(e),e=setTimeout(o,t),c&&(u=n.apply(i,a)),u}},w.once=function(n){var t,r=!1;return function(){return r?t:(r=!0,t=n.apply(this,arguments),n=null,t)}},w.wrap=function(n,t){return function(){var r=[n];return a.apply(r,arguments),t.apply(this,r)}},w.compose=function(){var n=arguments;return function(){for(var t=arguments,r=n.length-1;r>=0;r--)t=[n[r].apply(this,t)];return t[0]}},w.after=function(n,t){return 0>=n?t():function(){return 1>--n?t.apply(this,arguments):void 0}},w.keys=_||function(n){if(n!==Object(n))throw new TypeError("Invalid object");var t=[];for(var r in n)w.has(n,r)&&(t[t.length]=r);return t},w.values=function(n){var t=[];for(var r in n)w.has(n,r)&&t.push(n[r]);return t},w.pairs=function(n){var t=[];for(var r in n)w.has(n,r)&&t.push([r,n[r]]);return t},w.invert=function(n){var t={};for(var r in n)w.has(n,r)&&(t[n[r]]=r);return t},w.functions=w.methods=function(n){var t=[];for(var r in n)w.isFunction(n[r])&&t.push(r);return t.sort()},w.extend=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)n[r]=t[r]}),n},w.pick=function(n){var t={},r=c.apply(e,o.call(arguments,1));return A(r,function(r){r in n&&(t[r]=n[r])}),t},w.omit=function(n){var t={},r=c.apply(e,o.call(arguments,1));for(var u in n)w.contains(r,u)||(t[u]=n[u]);return t},w.defaults=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)null==n[r]&&(n[r]=t[r])}),n},w.clone=function(n){return w.isObject(n)?w.isArray(n)?n.slice():w.extend({},n):n},w.tap=function(n,t){return t(n),n};var I=function(n,t,r,e){if(n===t)return 0!==n||1/n==1/t;if(null==n||null==t)return n===t;n instanceof w&&(n=n._wrapped),t instanceof w&&(t=t._wrapped);var u=l.call(n);if(u!=l.call(t))return!1;switch(u){case"[object String]":return n==t+"";case"[object Number]":return n!=+n?t!=+t:0==n?1/n==1/t:n==+t;case"[object Date]":case"[object Boolean]":return+n==+t;case"[object RegExp]":return n.source==t.source&&n.global==t.global&&n.multiline==t.multiline&&n.ignoreCase==t.ignoreCase}if("object"!=typeof n||"object"!=typeof t)return!1;for(var i=r.length;i--;)if(r[i]==n)return e[i]==t;r.push(n),e.push(t);var a=0,o=!0;if("[object Array]"==u){if(a=n.length,o=a==t.length)for(;a--&&(o=I(n[a],t[a],r,e)););}else{var c=n.constructor,f=t.constructor;if(c!==f&&!(w.isFunction(c)&&c instanceof c&&w.isFunction(f)&&f instanceof f))return!1;for(var s in n)if(w.has(n,s)&&(a++,!(o=w.has(t,s)&&I(n[s],t[s],r,e))))break;if(o){for(s in t)if(w.has(t,s)&&!a--)break;o=!a}}return r.pop(),e.pop(),o};w.isEqual=function(n,t){return I(n,t,[],[])},w.isEmpty=function(n){if(null==n)return!0;if(w.isArray(n)||w.isString(n))return 0===n.length;for(var t in n)if(w.has(n,t))return!1;return!0},w.isElement=function(n){return!(!n||1!==n.nodeType)},w.isArray=x||function(n){return"[object Array]"==l.call(n)},w.isObject=function(n){return n===Object(n)},A(["Arguments","Function","String","Number","Date","RegExp"],function(n){w["is"+n]=function(t){return l.call(t)=="[object "+n+"]"}}),w.isArguments(arguments)||(w.isArguments=function(n){return!(!n||!w.has(n,"callee"))}),"function"!=typeof/./&&(w.isFunction=function(n){return"function"==typeof n}),w.isFinite=function(n){return isFinite(n)&&!isNaN(parseFloat(n))},w.isNaN=function(n){return w.isNumber(n)&&n!=+n},w.isBoolean=function(n){return n===!0||n===!1||"[object Boolean]"==l.call(n)},w.isNull=function(n){return null===n},w.isUndefined=function(n){return n===void 0},w.has=function(n,t){return f.call(n,t)},w.noConflict=function(){return n._=t,this},w.identity=function(n){return n},w.times=function(n,t,r){for(var e=Array(n),u=0;n>u;u++)e[u]=t.call(r,u);return e},w.random=function(n,t){return null==t&&(t=n,n=0),n+Math.floor(Math.random()*(t-n+1))};var M={escape:{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","/":"&#x2F;"}};M.unescape=w.invert(M.escape);var S={escape:RegExp("["+w.keys(M.escape).join("")+"]","g"),unescape:RegExp("("+w.keys(M.unescape).join("|")+")","g")};w.each(["escape","unescape"],function(n){w[n]=function(t){return null==t?"":(""+t).replace(S[n],function(t){return M[n][t]})}}),w.result=function(n,t){if(null==n)return null;var r=n[t];return w.isFunction(r)?r.call(n):r},w.mixin=function(n){A(w.functions(n),function(t){var r=w[t]=n[t];w.prototype[t]=function(){var n=[this._wrapped];return a.apply(n,arguments),D.call(this,r.apply(w,n))}})};var N=0;w.uniqueId=function(n){var t=++N+"";return n?n+t:t},w.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var T=/(.)^/,q={"'":"'","\\":"\\","\r":"r","\n":"n","	":"t","\u2028":"u2028","\u2029":"u2029"},B=/\\|'|\r|\n|\t|\u2028|\u2029/g;w.template=function(n,t,r){var e;r=w.defaults({},r,w.templateSettings);var u=RegExp([(r.escape||T).source,(r.interpolate||T).source,(r.evaluate||T).source].join("|")+"|$","g"),i=0,a="__p+='";n.replace(u,function(t,r,e,u,o){return a+=n.slice(i,o).replace(B,function(n){return"\\"+q[n]}),r&&(a+="'+\n((__t=("+r+"))==null?'':_.escape(__t))+\n'"),e&&(a+="'+\n((__t=("+e+"))==null?'':__t)+\n'"),u&&(a+="';\n"+u+"\n__p+='"),i=o+t.length,t}),a+="';\n",r.variable||(a="with(obj||{}){\n"+a+"}\n"),a="var __t,__p='',__j=Array.prototype.join,"+"print=function(){__p+=__j.call(arguments,'');};\n"+a+"return __p;\n";try{e=Function(r.variable||"obj","_",a)}catch(o){throw o.source=a,o}if(t)return e(t,w);var c=function(n){return e.call(this,n,w)};return c.source="function("+(r.variable||"obj")+"){\n"+a+"}",c},w.chain=function(n){return w(n).chain()};var D=function(n){return this._chain?w(n).chain():n};w.mixin(w),A(["pop","push","reverse","shift","sort","splice","unshift"],function(n){var t=e[n];w.prototype[n]=function(){var r=this._wrapped;return t.apply(r,arguments),"shift"!=n&&"splice"!=n||0!==r.length||delete r[0],D.call(this,r)}}),A(["concat","join","slice"],function(n){var t=e[n];w.prototype[n]=function(){return D.call(this,t.apply(this._wrapped,arguments))}}),w.extend(w.prototype,{chain:function(){return this._chain=!0,this},value:function(){return this._wrapped}})}).call(this);;
/*
    json2.js
    2011-10-19

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
;
(function(){var t=this;var e=t.Backbone;var i=[];var r=i.push;var s=i.slice;var n=i.splice;var a;if(typeof exports!=="undefined"){a=exports}else{a=t.Backbone={}}a.VERSION="1.0.0";var h=t._;if(!h&&typeof require!=="undefined")h=require("underscore");a.$=t.jQuery||t.Zepto||t.ender||t.$;a.noConflict=function(){t.Backbone=e;return this};a.emulateHTTP=false;a.emulateJSON=false;var o=a.Events={on:function(t,e,i){if(!l(this,"on",t,[e,i])||!e)return this;this._events||(this._events={});var r=this._events[t]||(this._events[t]=[]);r.push({callback:e,context:i,ctx:i||this});return this},once:function(t,e,i){if(!l(this,"once",t,[e,i])||!e)return this;var r=this;var s=h.once(function(){r.off(t,s);e.apply(this,arguments)});s._callback=e;return this.on(t,s,i)},off:function(t,e,i){var r,s,n,a,o,u,c,f;if(!this._events||!l(this,"off",t,[e,i]))return this;if(!t&&!e&&!i){this._events={};return this}a=t?[t]:h.keys(this._events);for(o=0,u=a.length;o<u;o++){t=a[o];if(n=this._events[t]){this._events[t]=r=[];if(e||i){for(c=0,f=n.length;c<f;c++){s=n[c];if(e&&e!==s.callback&&e!==s.callback._callback||i&&i!==s.context){r.push(s)}}}if(!r.length)delete this._events[t]}}return this},trigger:function(t){if(!this._events)return this;var e=s.call(arguments,1);if(!l(this,"trigger",t,e))return this;var i=this._events[t];var r=this._events.all;if(i)c(i,e);if(r)c(r,arguments);return this},stopListening:function(t,e,i){var r=this._listeners;if(!r)return this;var s=!e&&!i;if(typeof e==="object")i=this;if(t)(r={})[t._listenerId]=t;for(var n in r){r[n].off(e,i,this);if(s)delete this._listeners[n]}return this}};var u=/\s+/;var l=function(t,e,i,r){if(!i)return true;if(typeof i==="object"){for(var s in i){t[e].apply(t,[s,i[s]].concat(r))}return false}if(u.test(i)){var n=i.split(u);for(var a=0,h=n.length;a<h;a++){t[e].apply(t,[n[a]].concat(r))}return false}return true};var c=function(t,e){var i,r=-1,s=t.length,n=e[0],a=e[1],h=e[2];switch(e.length){case 0:while(++r<s)(i=t[r]).callback.call(i.ctx);return;case 1:while(++r<s)(i=t[r]).callback.call(i.ctx,n);return;case 2:while(++r<s)(i=t[r]).callback.call(i.ctx,n,a);return;case 3:while(++r<s)(i=t[r]).callback.call(i.ctx,n,a,h);return;default:while(++r<s)(i=t[r]).callback.apply(i.ctx,e)}};var f={listenTo:"on",listenToOnce:"once"};h.each(f,function(t,e){o[e]=function(e,i,r){var s=this._listeners||(this._listeners={});var n=e._listenerId||(e._listenerId=h.uniqueId("l"));s[n]=e;if(typeof i==="object")r=this;e[t](i,r,this);return this}});o.bind=o.on;o.unbind=o.off;h.extend(a,o);var d=a.Model=function(t,e){var i;var r=t||{};e||(e={});this.cid=h.uniqueId("c");this.attributes={};h.extend(this,h.pick(e,p));if(e.parse)r=this.parse(r,e)||{};if(i=h.result(this,"defaults")){r=h.defaults({},r,i)}this.set(r,e);this.changed={};this.initialize.apply(this,arguments)};var p=["url","urlRoot","collection"];h.extend(d.prototype,o,{changed:null,validationError:null,idAttribute:"id",initialize:function(){},toJSON:function(t){return h.clone(this.attributes)},sync:function(){return a.sync.apply(this,arguments)},get:function(t){return this.attributes[t]},escape:function(t){return h.escape(this.get(t))},has:function(t){return this.get(t)!=null},set:function(t,e,i){var r,s,n,a,o,u,l,c;if(t==null)return this;if(typeof t==="object"){s=t;i=e}else{(s={})[t]=e}i||(i={});if(!this._validate(s,i))return false;n=i.unset;o=i.silent;a=[];u=this._changing;this._changing=true;if(!u){this._previousAttributes=h.clone(this.attributes);this.changed={}}c=this.attributes,l=this._previousAttributes;if(this.idAttribute in s)this.id=s[this.idAttribute];for(r in s){e=s[r];if(!h.isEqual(c[r],e))a.push(r);if(!h.isEqual(l[r],e)){this.changed[r]=e}else{delete this.changed[r]}n?delete c[r]:c[r]=e}if(!o){if(a.length)this._pending=true;for(var f=0,d=a.length;f<d;f++){this.trigger("change:"+a[f],this,c[a[f]],i)}}if(u)return this;if(!o){while(this._pending){this._pending=false;this.trigger("change",this,i)}}this._pending=false;this._changing=false;return this},unset:function(t,e){return this.set(t,void 0,h.extend({},e,{unset:true}))},clear:function(t){var e={};for(var i in this.attributes)e[i]=void 0;return this.set(e,h.extend({},t,{unset:true}))},hasChanged:function(t){if(t==null)return!h.isEmpty(this.changed);return h.has(this.changed,t)},changedAttributes:function(t){if(!t)return this.hasChanged()?h.clone(this.changed):false;var e,i=false;var r=this._changing?this._previousAttributes:this.attributes;for(var s in t){if(h.isEqual(r[s],e=t[s]))continue;(i||(i={}))[s]=e}return i},previous:function(t){if(t==null||!this._previousAttributes)return null;return this._previousAttributes[t]},previousAttributes:function(){return h.clone(this._previousAttributes)},fetch:function(t){t=t?h.clone(t):{};if(t.parse===void 0)t.parse=true;var e=this;var i=t.success;t.success=function(r){if(!e.set(e.parse(r,t),t))return false;if(i)i(e,r,t);e.trigger("sync",e,r,t)};R(this,t);return this.sync("read",this,t)},save:function(t,e,i){var r,s,n,a=this.attributes;if(t==null||typeof t==="object"){r=t;i=e}else{(r={})[t]=e}if(r&&(!i||!i.wait)&&!this.set(r,i))return false;i=h.extend({validate:true},i);if(!this._validate(r,i))return false;if(r&&i.wait){this.attributes=h.extend({},a,r)}if(i.parse===void 0)i.parse=true;var o=this;var u=i.success;i.success=function(t){o.attributes=a;var e=o.parse(t,i);if(i.wait)e=h.extend(r||{},e);if(h.isObject(e)&&!o.set(e,i)){return false}if(u)u(o,t,i);o.trigger("sync",o,t,i)};R(this,i);s=this.isNew()?"create":i.patch?"patch":"update";if(s==="patch")i.attrs=r;n=this.sync(s,this,i);if(r&&i.wait)this.attributes=a;return n},destroy:function(t){t=t?h.clone(t):{};var e=this;var i=t.success;var r=function(){e.trigger("destroy",e,e.collection,t)};t.success=function(s){if(t.wait||e.isNew())r();if(i)i(e,s,t);if(!e.isNew())e.trigger("sync",e,s,t)};if(this.isNew()){t.success();return false}R(this,t);var s=this.sync("delete",this,t);if(!t.wait)r();return s},url:function(){var t=h.result(this,"urlRoot")||h.result(this.collection,"url")||U();if(this.isNew())return t;return t+(t.charAt(t.length-1)==="/"?"":"/")+encodeURIComponent(this.id)},parse:function(t,e){return t},clone:function(){return new this.constructor(this.attributes)},isNew:function(){return this.id==null},isValid:function(t){return this._validate({},h.extend(t||{},{validate:true}))},_validate:function(t,e){if(!e.validate||!this.validate)return true;t=h.extend({},this.attributes,t);var i=this.validationError=this.validate(t,e)||null;if(!i)return true;this.trigger("invalid",this,i,h.extend(e||{},{validationError:i}));return false}});var v=["keys","values","pairs","invert","pick","omit"];h.each(v,function(t){d.prototype[t]=function(){var e=s.call(arguments);e.unshift(this.attributes);return h[t].apply(h,e)}});var g=a.Collection=function(t,e){e||(e={});if(e.url)this.url=e.url;if(e.model)this.model=e.model;if(e.comparator!==void 0)this.comparator=e.comparator;this._reset();this.initialize.apply(this,arguments);if(t)this.reset(t,h.extend({silent:true},e))};var m={add:true,remove:true,merge:true};var y={add:true,merge:false,remove:false};h.extend(g.prototype,o,{model:d,initialize:function(){},toJSON:function(t){return this.map(function(e){return e.toJSON(t)})},sync:function(){return a.sync.apply(this,arguments)},add:function(t,e){return this.set(t,h.defaults(e||{},y))},remove:function(t,e){t=h.isArray(t)?t.slice():[t];e||(e={});var i,r,s,n;for(i=0,r=t.length;i<r;i++){n=this.get(t[i]);if(!n)continue;delete this._byId[n.id];delete this._byId[n.cid];s=this.indexOf(n);this.models.splice(s,1);this.length--;if(!e.silent){e.index=s;n.trigger("remove",n,this,e)}this._removeReference(n)}return this},set:function(t,e){e=h.defaults(e||{},m);if(e.parse)t=this.parse(t,e);if(!h.isArray(t))t=t?[t]:[];var i,s,a,o,u,l;var c=e.at;var f=this.comparator&&c==null&&e.sort!==false;var d=h.isString(this.comparator)?this.comparator:null;var p=[],v=[],g={};for(i=0,s=t.length;i<s;i++){if(!(a=this._prepareModel(t[i],e)))continue;if(u=this.get(a)){if(e.remove)g[u.cid]=true;if(e.merge){u.set(a.attributes,e);if(f&&!l&&u.hasChanged(d))l=true}}else if(e.add){p.push(a);a.on("all",this._onModelEvent,this);this._byId[a.cid]=a;if(a.id!=null)this._byId[a.id]=a}}if(e.remove){for(i=0,s=this.length;i<s;++i){if(!g[(a=this.models[i]).cid])v.push(a)}if(v.length)this.remove(v,e)}if(p.length){if(f)l=true;this.length+=p.length;if(c!=null){n.apply(this.models,[c,0].concat(p))}else{r.apply(this.models,p)}}if(l)this.sort({silent:true});if(e.silent)return this;for(i=0,s=p.length;i<s;i++){(a=p[i]).trigger("add",a,this,e)}if(l)this.trigger("sort",this,e);return this},reset:function(t,e){e||(e={});for(var i=0,r=this.models.length;i<r;i++){this._removeReference(this.models[i])}e.previousModels=this.models;this._reset();this.add(t,h.extend({silent:true},e));if(!e.silent)this.trigger("reset",this,e);return this},push:function(t,e){t=this._prepareModel(t,e);this.add(t,h.extend({at:this.length},e));return t},pop:function(t){var e=this.at(this.length-1);this.remove(e,t);return e},unshift:function(t,e){t=this._prepareModel(t,e);this.add(t,h.extend({at:0},e));return t},shift:function(t){var e=this.at(0);this.remove(e,t);return e},slice:function(t,e){return this.models.slice(t,e)},get:function(t){if(t==null)return void 0;return this._byId[t.id!=null?t.id:t.cid||t]},at:function(t){return this.models[t]},where:function(t,e){if(h.isEmpty(t))return e?void 0:[];return this[e?"find":"filter"](function(e){for(var i in t){if(t[i]!==e.get(i))return false}return true})},findWhere:function(t){return this.where(t,true)},sort:function(t){if(!this.comparator)throw new Error("Cannot sort a set without a comparator");t||(t={});if(h.isString(this.comparator)||this.comparator.length===1){this.models=this.sortBy(this.comparator,this)}else{this.models.sort(h.bind(this.comparator,this))}if(!t.silent)this.trigger("sort",this,t);return this},sortedIndex:function(t,e,i){e||(e=this.comparator);var r=h.isFunction(e)?e:function(t){return t.get(e)};return h.sortedIndex(this.models,t,r,i)},pluck:function(t){return h.invoke(this.models,"get",t)},fetch:function(t){t=t?h.clone(t):{};if(t.parse===void 0)t.parse=true;var e=t.success;var i=this;t.success=function(r){var s=t.reset?"reset":"set";i[s](r,t);if(e)e(i,r,t);i.trigger("sync",i,r,t)};R(this,t);return this.sync("read",this,t)},create:function(t,e){e=e?h.clone(e):{};if(!(t=this._prepareModel(t,e)))return false;if(!e.wait)this.add(t,e);var i=this;var r=e.success;e.success=function(s){if(e.wait)i.add(t,e);if(r)r(t,s,e)};t.save(null,e);return t},parse:function(t,e){return t},clone:function(){return new this.constructor(this.models)},_reset:function(){this.length=0;this.models=[];this._byId={}},_prepareModel:function(t,e){if(t instanceof d){if(!t.collection)t.collection=this;return t}e||(e={});e.collection=this;var i=new this.model(t,e);if(!i._validate(t,e)){this.trigger("invalid",this,t,e);return false}return i},_removeReference:function(t){if(this===t.collection)delete t.collection;t.off("all",this._onModelEvent,this)},_onModelEvent:function(t,e,i,r){if((t==="add"||t==="remove")&&i!==this)return;if(t==="destroy")this.remove(e,r);if(e&&t==="change:"+e.idAttribute){delete this._byId[e.previous(e.idAttribute)];if(e.id!=null)this._byId[e.id]=e}this.trigger.apply(this,arguments)}});var _=["forEach","each","map","collect","reduce","foldl","inject","reduceRight","foldr","find","detect","filter","select","reject","every","all","some","any","include","contains","invoke","max","min","toArray","size","first","head","take","initial","rest","tail","drop","last","without","indexOf","shuffle","lastIndexOf","isEmpty","chain"];h.each(_,function(t){g.prototype[t]=function(){var e=s.call(arguments);e.unshift(this.models);return h[t].apply(h,e)}});var w=["groupBy","countBy","sortBy"];h.each(w,function(t){g.prototype[t]=function(e,i){var r=h.isFunction(e)?e:function(t){return t.get(e)};return h[t](this.models,r,i)}});var b=a.View=function(t){this.cid=h.uniqueId("view");this._configure(t||{});this._ensureElement();this.initialize.apply(this,arguments);this.delegateEvents()};var x=/^(\S+)\s*(.*)$/;var E=["model","collection","el","id","attributes","className","tagName","events"];h.extend(b.prototype,o,{tagName:"div",$:function(t){return this.$el.find(t)},initialize:function(){},render:function(){return this},remove:function(){this.$el.remove();this.stopListening();return this},setElement:function(t,e){if(this.$el)this.undelegateEvents();this.$el=t instanceof a.$?t:a.$(t);this.el=this.$el[0];if(e!==false)this.delegateEvents();return this},delegateEvents:function(t){if(!(t||(t=h.result(this,"events"))))return this;this.undelegateEvents();for(var e in t){var i=t[e];if(!h.isFunction(i))i=this[t[e]];if(!i)continue;var r=e.match(x);var s=r[1],n=r[2];i=h.bind(i,this);s+=".delegateEvents"+this.cid;if(n===""){this.$el.on(s,i)}else{this.$el.on(s,n,i)}}return this},undelegateEvents:function(){this.$el.off(".delegateEvents"+this.cid);return this},_configure:function(t){if(this.options)t=h.extend({},h.result(this,"options"),t);h.extend(this,h.pick(t,E));this.options=t},_ensureElement:function(){if(!this.el){var t=h.extend({},h.result(this,"attributes"));if(this.id)t.id=h.result(this,"id");if(this.className)t["class"]=h.result(this,"className");var e=a.$("<"+h.result(this,"tagName")+">").attr(t);this.setElement(e,false)}else{this.setElement(h.result(this,"el"),false)}}});a.sync=function(t,e,i){var r=k[t];h.defaults(i||(i={}),{emulateHTTP:a.emulateHTTP,emulateJSON:a.emulateJSON});var s={type:r,dataType:"json"};if(!i.url){s.url=h.result(e,"url")||U()}if(i.data==null&&e&&(t==="create"||t==="update"||t==="patch")){s.contentType="application/json";s.data=JSON.stringify(i.attrs||e.toJSON(i))}if(i.emulateJSON){s.contentType="application/x-www-form-urlencoded";s.data=s.data?{model:s.data}:{}}if(i.emulateHTTP&&(r==="PUT"||r==="DELETE"||r==="PATCH")){s.type="POST";if(i.emulateJSON)s.data._method=r;var n=i.beforeSend;i.beforeSend=function(t){t.setRequestHeader("X-HTTP-Method-Override",r);if(n)return n.apply(this,arguments)}}if(s.type!=="GET"&&!i.emulateJSON){s.processData=false}if(s.type==="PATCH"&&window.ActiveXObject&&!(window.external&&window.external.msActiveXFilteringEnabled)){s.xhr=function(){return new ActiveXObject("Microsoft.XMLHTTP")}}var o=i.xhr=a.ajax(h.extend(s,i));e.trigger("request",e,o,i);return o};var k={create:"POST",update:"PUT",patch:"PATCH","delete":"DELETE",read:"GET"};a.ajax=function(){return a.$.ajax.apply(a.$,arguments)};var S=a.Router=function(t){t||(t={});if(t.routes)this.routes=t.routes;this._bindRoutes();this.initialize.apply(this,arguments)};var $=/\((.*?)\)/g;var T=/(\(\?)?:\w+/g;var H=/\*\w+/g;var A=/[\-{}\[\]+?.,\\\^$|#\s]/g;h.extend(S.prototype,o,{initialize:function(){},route:function(t,e,i){if(!h.isRegExp(t))t=this._routeToRegExp(t);if(h.isFunction(e)){i=e;e=""}if(!i)i=this[e];var r=this;a.history.route(t,function(s){var n=r._extractParameters(t,s);i&&i.apply(r,n);r.trigger.apply(r,["route:"+e].concat(n));r.trigger("route",e,n);a.history.trigger("route",r,e,n)});return this},navigate:function(t,e){a.history.navigate(t,e);return this},_bindRoutes:function(){if(!this.routes)return;this.routes=h.result(this,"routes");var t,e=h.keys(this.routes);while((t=e.pop())!=null){this.route(t,this.routes[t])}},_routeToRegExp:function(t){t=t.replace(A,"\\$&").replace($,"(?:$1)?").replace(T,function(t,e){return e?t:"([^/]+)"}).replace(H,"(.*?)");return new RegExp("^"+t+"$")},_extractParameters:function(t,e){var i=t.exec(e).slice(1);return h.map(i,function(t){return t?decodeURIComponent(t):null})}});var I=a.History=function(){this.handlers=[];h.bindAll(this,"checkUrl");if(typeof window!=="undefined"){this.location=window.location;this.history=window.history}};var N=/^[#\/]|\s+$/g;var P=/^\/+|\/+$/g;var O=/msie [\w.]+/;var C=/\/$/;I.started=false;h.extend(I.prototype,o,{interval:50,getHash:function(t){var e=(t||this).location.href.match(/#(.*)$/);return e?e[1]:""},getFragment:function(t,e){if(t==null){if(this._hasPushState||!this._wantsHashChange||e){t=this.location.pathname;var i=this.root.replace(C,"");if(!t.indexOf(i))t=t.substr(i.length)}else{t=this.getHash()}}return t.replace(N,"")},start:function(t){if(I.started)throw new Error("Backbone.history has already been started");I.started=true;this.options=h.extend({},{root:"/"},this.options,t);this.root=this.options.root;this._wantsHashChange=this.options.hashChange!==false;this._wantsPushState=!!this.options.pushState;this._hasPushState=!!(this.options.pushState&&this.history&&this.history.pushState);var e=this.getFragment();var i=document.documentMode;var r=O.exec(navigator.userAgent.toLowerCase())&&(!i||i<=7);this.root=("/"+this.root+"/").replace(P,"/");if(r&&this._wantsHashChange){this.iframe=a.$('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo("body")[0].contentWindow;this.navigate(e)}if(this._hasPushState){a.$(window).on("popstate",this.checkUrl)}else if(this._wantsHashChange&&"onhashchange"in window&&!r){a.$(window).on("hashchange",this.checkUrl)}else if(this._wantsHashChange){this._checkUrlInterval=setInterval(this.checkUrl,this.interval)}this.fragment=e;var s=this.location;var n=s.pathname.replace(/[^\/]$/,"$&/")===this.root;if(this._wantsHashChange&&this._wantsPushState&&!this._hasPushState&&!n){this.fragment=this.getFragment(null,true);this.location.replace(this.root+this.location.search+"#"+this.fragment);return true}else if(this._wantsPushState&&this._hasPushState&&n&&s.hash){this.fragment=this.getHash().replace(N,"");this.history.replaceState({},document.title,this.root+this.fragment+s.search)}if(!this.options.silent)return this.loadUrl()},stop:function(){a.$(window).off("popstate",this.checkUrl).off("hashchange",this.checkUrl);clearInterval(this._checkUrlInterval);I.started=false},route:function(t,e){this.handlers.unshift({route:t,callback:e})},checkUrl:function(t){var e=this.getFragment();if(e===this.fragment&&this.iframe){e=this.getFragment(this.getHash(this.iframe))}if(e===this.fragment)return false;if(this.iframe)this.navigate(e);this.loadUrl()||this.loadUrl(this.getHash())},loadUrl:function(t){var e=this.fragment=this.getFragment(t);var i=h.any(this.handlers,function(t){if(t.route.test(e)){t.callback(e);return true}});return i},navigate:function(t,e){if(!I.started)return false;if(!e||e===true)e={trigger:e};t=this.getFragment(t||"");if(this.fragment===t)return;this.fragment=t;var i=this.root+t;if(this._hasPushState){this.history[e.replace?"replaceState":"pushState"]({},document.title,i)}else if(this._wantsHashChange){this._updateHash(this.location,t,e.replace);if(this.iframe&&t!==this.getFragment(this.getHash(this.iframe))){if(!e.replace)this.iframe.document.open().close();this._updateHash(this.iframe.location,t,e.replace)}}else{return this.location.assign(i)}if(e.trigger)this.loadUrl(t)},_updateHash:function(t,e,i){if(i){var r=t.href.replace(/(javascript:|#).*$/,"");t.replace(r+"#"+e)}else{t.hash="#"+e}}});a.history=new I;var j=function(t,e){var i=this;var r;if(t&&h.has(t,"constructor")){r=t.constructor}else{r=function(){return i.apply(this,arguments)}}h.extend(r,i,e);var s=function(){this.constructor=r};s.prototype=i.prototype;r.prototype=new s;if(t)h.extend(r.prototype,t);r.__super__=i.prototype;return r};d.extend=g.extend=S.extend=b.extend=I.extend=j;var U=function(){throw new Error('A "url" property or function must be specified')};var R=function(t,e){var i=e.error;e.error=function(r){if(i)i(t,r,e);t.trigger("error",t,r,e)}}}).call(this);
/*
//@ sourceMappingURL=backbone-min.map
*/;
//////////////////////////////////////////////////////////////////////////////////////
//
//	Copyright 2012 Piotr Walczyszyn (http://outof.me | @pwalczyszyn)
//
//	Licensed under the Apache License, Version 2.0 (the "License");
//	you may not use this file except in compliance with the License.
//	You may obtain a copy of the License at
//
//		http://www.apache.org/licenses/LICENSE-2.0
//
//	Unless required by applicable law or agreed to in writing, software
//	distributed under the License is distributed on an "AS IS" BASIS,
//	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//	See the License for the specific language governing permissions and
//	limitations under the License.
//
//////////////////////////////////////////////////////////////////////////////////////

// BackStack version 1.1.1

(function (root, factory) {
    // Set up BackStack appropriately for the environment.
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery', 'underscore', 'Backbone'], factory);
    } else {
        // Browser globals
        root.BackStack = factory((root.jQuery || root.Zepto || root.ender), root._, root.Backbone);
    }
}(this, function ($, _, Backbone) {

/**
 * almond 0.1.1 Copyright (c) 2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var defined = {},
        waiting = {},
        config = {},
        defining = {},
        aps = [].slice,
        main, req;

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {},
            nameParts, nameSegment, mapValue, foundMap, i, j, part;

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; (part = name[i]); i++) {
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            return true;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                break;
                            }
                        }
                    }
                }

                foundMap = foundMap || starMap[nameSegment];

                if (foundMap) {
                    nameParts.splice(0, i, foundMap);
                    name = nameParts.join('/');
                    break;
                }
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (waiting.hasOwnProperty(name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!defined.hasOwnProperty(name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    function makeMap(name, relName) {
        var prefix, plugin,
            index = name.indexOf('!');

        if (index !== -1) {
            prefix = normalize(name.slice(0, index), relName);
            name = name.slice(index + 1);
            plugin = callDep(prefix);

            //Normalize according
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            p: plugin
        };
    }

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    main = function (name, deps, callback, relName) {
        var args = [],
            usingExports,
            cjsModule, depName, ret, map, i;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i++) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = makeRequire(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = defined[name] = {};
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = {
                        id: name,
                        uri: '',
                        exports: defined[name],
                        config: makeConfig(name)
                    };
                } else if (defined.hasOwnProperty(depName) || waiting.hasOwnProperty(depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else if (!defining[depName]) {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                    cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync) {
        if (typeof deps === "string") {
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 15);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        return req;
    };

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        waiting[name] = [name, deps, callback];
    };

    define.amd = {
        jQuery: true
    };
}());

define("almond", function(){});

define('effects/vendorPrefix',[], function () {

    /**
     * Helper function to detect browser vendor prefix.
     * Thanks to Lea Verou: http://lea.verou.me/2009/02/find-the-vendor-prefix-of-the-current-browser/
     * I just modified it slightly as I expect it to be used in mobile/WebKit scenarios mostly.
     */
    var vendorPrefix,
        regex = /^(Moz|Webkit|Khtml|O|ms|Icab)(?=[A-Z])/,
        someScript = document.getElementsByTagName('script')[0];

    // Exception for WebKit based browsers
    if ('WebkitOpacity' in someScript.style) {
        vendorPrefix = 'Webkit';
    } else if ('KhtmlOpacity' in someScript.style) {
        vendorPrefix = 'Khtml';
    } else {
        for (var prop in someScript.style) {
            if (regex.test(prop)) {
                // test is faster than match, so it's better to perform
                // that on the lot and match only when necessary
                vendorPrefix = prop.match(regex)[0];
                break;
            }
        }
    }

    return (vendorPrefix.toLowerCase() || '');
});
define('effects/Effect',['effects/vendorPrefix'], function (vendorPrefix) {

    var Effect = function Effect(params) {

        if (params) _.extend(this, params);

        this.vendorPrefix = vendorPrefix;

        if (this.vendorPrefix == 'moz' || this.vendorPrefix == '') this.transitionEndEvent = 'transitionend';
        else if (this.vendorPrefix == 'ms') this.transitionEndEvent = 'MSTransitionEnd';
        else this.transitionEndEvent = this.vendorPrefix + 'TransitionEnd';

    };

    // Shared empty constructor function to aid in prototype-chain creation.
    var ctor = function () {
    };

    Effect.extend = function (protoProps, staticProps) {
        var child = function () {
            Effect.apply(this, arguments);
        };

        // Inherit class (static) properties from parent.
        _.extend(child, Effect);

        // Set the prototype chain to inherit from `parent`, without calling
        // `parent`'s constructor function.
        ctor.prototype = Effect.prototype;
        child.prototype = new ctor();

        // Add prototype properties (instance properties) to the subclass,
        // if supplied.
        if (protoProps) _.extend(child.prototype, protoProps);

        // Add static properties to the constructor function, if supplied.
        if (staticProps) _.extend(child, staticProps);

        // Correctly set child's `prototype.constructor`.
        child.prototype.constructor = child;

        // Set a convenience property in case the parent's prototype is needed later.
        child.__super__ = Effect.prototype;

        return child;
    };

    return Effect;
});
define('effects/SlideEffect',['effects/Effect'], function (Effect) {

    var SlideEffect = Effect.extend({

        direction:'left',

        fromViewTransitionProps:{duration:0.25, easing:'ease-out', delay:0},

        toViewTransitionProps:{duration:0.25, easing:'ease-out', delay:0},

        play:function ($fromView, $toView, callback, context) {

            var timeout,
                that = this,
                activeTransitions = 0,
                transformParams,
                transformProp = that.vendorPrefix == '' ? 'transform' :
                    ['-' + that.vendorPrefix, '-', 'transform'].join(''),
                transitionProp = that.vendorPrefix == '' ? 'transition' :
                    ['-' + that.vendorPrefix, '-', 'transition'].join('');

            var transitionEndHandler = function (event) {
                if (activeTransitions >= 0) {
                    activeTransitions--;

                    var $target = $(event.target);
                    $target.css(transformProp, '');
                    $target.css(transitionProp, '');

                    if ($toView && $toView[0] == event.target) $toView.css('left', 0);

                    if (activeTransitions == 0 && callback) {
                        if (timeout) clearTimeout(timeout);
                        callback.call(context);
                    }
                }
            };

            if ($fromView) {
                activeTransitions++;

                $fromView.one(that.transitionEndEvent, transitionEndHandler);

                $fromView.css('left', 0);
                $fromView.css(transitionProp, [transformProp, ' ',
                                               that.fromViewTransitionProps.duration, 's ',
                                               that.fromViewTransitionProps.easing, ' ',
                                               that.fromViewTransitionProps.delay, 's'].join(''));
            }

            if ($toView) {
                activeTransitions++;

                $toView.one(that.transitionEndEvent, transitionEndHandler);

                $toView.css('left', that.direction == 'left' ? context.$el.width() : -context.$el.width());
                $toView.css(transitionProp, [transformProp, ' ',
                                             that.toViewTransitionProps.duration, 's ',
                                             that.toViewTransitionProps.easing, ' ',
                                             that.toViewTransitionProps.delay, 's'].join(''));

                // Showing the view
                $toView.css('visibility', 'visible');
            }

            if ($fromView || $toView) {
                // This is a hack to force DOM reflow before transition starts
                context.$el.css('width');

                transformParams = 'translate3d(' + (that.direction == 'left' ? -context.$el.width() : context.$el.width()) + 'px, 0, 0)';
            }

            // This is a fallback for situations when TransitionEnd event doesn't get triggered
            var transDuration = Math.max(that.fromViewTransitionProps.duration, that.toViewTransitionProps.duration) +
                Math.max(that.fromViewTransitionProps.delay, that.toViewTransitionProps.delay);

            timeout = setTimeout(function () {
                if (activeTransitions > 0) {
                    activeTransitions = -1;

                    console.log('Warning ' + that.transitionEndEvent + ' didn\'t trigger in expected time!');

                    if ($toView) {
                        $toView.off(that.transitionEndEvent, transitionEndHandler);
                        $toView.css(transitionProp, '');
                        $toView.css(transformProp, '');
                        $toView.css('left', 0);
                    }

                    if ($fromView) {
                        $fromView.off(that.transitionEndEvent, transitionEndHandler);
                        $fromView.css(transitionProp, '');
                        $fromView.css(transformProp, '');
                    }

                    callback.call(context);
                }
            }, transDuration * 1.5 * 1000);

            var $views;
            if ($fromView && $toView) $views = $fromView.add($toView);
            else if ($toView) $views = $toView;
            else if ($fromView) $views = $fromView;

            if ($views) $views.css(transformProp, transformParams);
        }
    });

    return SlideEffect;
});
define('StackNavigator',['effects/SlideEffect'], function (SlideEffect) {

    /**
     * Rendering the view and setting props required by StackNavigator.
     * @private
     * @ignore
     *
     * @param {View} view View to be rendered.
     * @param {StackNavigator} stackNavigator View StackNavigator instance.
     */
    function appendView(view, stackNavigator) {

        if (!view.__backStackRendered__) {

            // Setting ref to parent StackNavigator
            view.stackNavigator = stackNavigator;

            // Setting default destructionPolicy if it's not set
            if (typeof view.destructionPolicy === 'undefined') view.destructionPolicy = 'auto';

            // Setting default styles
            view.$el.css({position:'absolute', visibility:'hidden', overflow:'hidden', width:'100%', height:'100%'});

        } else {
            // Resetting visibility to hidden
            view.$el.css({visibility:'hidden'});
        }

        // Adding view to the DOM
        stackNavigator.$el.append(view.el);

        if (!view.__backStackRendered__) {
            // Rendering the view
            view.render.call(view);

            // Setting default of __backStackRendered__ property
            view.__backStackRendered__ = true;
        }
    }

    /**
     * Creates event objects triggered by BackStack.
     * @private
     * @ignore
     *
     * @param {string} type Event type name.
     * @param {*} args Event args.
     * @param {boolean} cancelable Flag indicating if event is cancelable.
     * @return {event} The new object.
     */
    function createEvent(type, args, cancelable) {
        return _.extend({

            type:type,

            cancelable:_.isUndefined(cancelable) ? false : cancelable,

            preventDefault:function () {
                if (this.cancelable)
                    this.isDefaultPrevented = function () {
                        return true;
                    };
            },

            isDefaultPrevented:function () {
                return false;
            },

            trigger:function (target) {
                target.trigger(this.type, this);
                return this;
            }
        }, args);
    }

    /**
     * Private common push method.
     * @private
     * @ignore
     *
     * @param {object} fromViewRef Reference to from view.
     * @param {object} toViewRef Reference to to view.
     * @param {number} replaceHowMany Number of views to replace with pushed view.
     * @param {Effect} transition Transition to played during push.
     */
    function push(fromViewRef, toViewRef, replaceHowMany, transition) {

        // Rendering view if required
        appendView(toViewRef.instance, this);

        transition = transition || this.defaultPushTransition || (this.defaultPushTransition = new SlideEffect({direction:'left'}));
        transition.play(fromViewRef ? fromViewRef.instance.$el : null, toViewRef.instance.$el,
            function () { // Callback function

                var remove = replaceHowMany > 0 ? this.viewsStack.splice(this.viewsStack.length - replaceHowMany, replaceHowMany)
                    : (fromViewRef ? [fromViewRef] : null);

                _.each(remove, function (ref) {

                    // Triggering viewDeactivate event
                    createEvent('viewDeactivate', {target:ref.instance}).trigger(ref.instance);

                    if (ref.instance.destructionPolicy == 'never') { // Detaching if destructionPolicy == 'never'
                        ref.instance.$el.detach();
                    } else { // Removing if destructionPolicy == 'auto'
                        ref.instance.remove();
                        ref.instance = null;
                    }
                }, this);

                // Adding view to the stack internal array
                this.viewsStack.push(toViewRef);

                // Setting activeView property
                this.activeView = toViewRef.instance;

                // Triggering viewActivate event
                createEvent('viewActivate', {target:toViewRef.instance}).trigger(toViewRef.instance);

                // Triggering viewChanged event
                createEvent('viewChanged', {target:this}).trigger(this);

                // Popping item from actions queue
                popActionsQueue.call(this);

            }, this);
    }

    /**
     * Private common pop method.
     * @private
     * @ignore
     *
     * @param {object} fromViewRef Reference to from view.
     * @param {object} toViewRef Reference to to view.
     * @param {number} howMany Number of views to pop from the stack.
     * @param {Effect} transition Transition to played during pop.
     */
    function pop(fromViewRef, toViewRef, howMany, transition) {

        if (toViewRef) {
            // Recreating view instance if necessary
            toViewRef.instance = toViewRef.instance ? toViewRef.instance : new toViewRef.viewClass(toViewRef.options);
            // Rendering view if required
            appendView(toViewRef.instance, this);
        }

        transition = transition || this.defaultPopTransition || (this.defaultPopTransition = new SlideEffect({direction:'right'}));
        transition.play(fromViewRef.instance.$el, toViewRef ? toViewRef.instance.$el : null,
            function () { // Callback function

                // Popping views from a stack
                var remove = this.viewsStack.splice(this.viewsStack.length - howMany, howMany);
                _.each(remove, function (ref) {

                    // Triggering viewDeactivate event
                    createEvent('viewDeactivate', {target:ref.instance}).trigger(ref.instance);

                    if (ref.instance.destructionPolicy == 'never') { // Detaching if destructionPolicy == 'never'
                        ref.instance.$el.detach();
                    } else { // Removing if destructionPolicy == 'auto'
                        ref.instance.remove();
                        ref.instance = null;
                    }
                }, this);

                if (toViewRef) { // If toViewRef exists activating it

                    // Setting activeView property
                    this.activeView = toViewRef.instance;

                    // Triggering viewActivate event
                    createEvent('viewActivate', {target:toViewRef.instance}).trigger(toViewRef.instance);

                } else { // Nulling activeView property
                    this.activeView = null;
                }

                // Triggering viewChanged event
                createEvent('viewChanged', {target:this}).trigger(this);

                // Popping item from actions queue
                popActionsQueue.call(this);
            }, this);
    }

    function pushView(view, viewOptions, transition) {
        // Getting ref of the view on top of the stack
        var fromViewRef = _.last(this.viewsStack),
        // Creating new view instance if it is necessary
            toView = _.isFunction(view) ? new view(viewOptions) : view,
        // Creating new view ref
            toViewRef = {instance:toView, viewClass:toView.constructor, options:viewOptions},
        // Creating viewChanging event object and triggering it
            event = createEvent('viewChanging',
                {
                    action:'push',
                    fromViewClass:fromViewRef ? fromViewRef.viewClass : null,
                    fromView:fromViewRef ? fromViewRef.instance : null,
                    toViewClass:toViewRef.viewClass,
                    toView:toViewRef.instance
                },
                true).trigger(this);

        // Checking if event wasn't cancelled
        if (event.isDefaultPrevented()) return null;

        push.call(this, fromViewRef, toViewRef, 0, transition);
    }

    function popView(transition) {
        if (this.viewsStack.length == 0) throw new Error('Popping from an empty stack!');

        // Getting ref of the view on top of the stack
        var fromViewRef = _.last(this.viewsStack),
        // Getting ref of the view below current one
            toViewRef = this.viewsStack.length > 1 ? this.viewsStack[this.viewsStack.length - 2] : null,
        // Creating viewChanging event object and triggering it
            event = createEvent('viewChanging',
                {
                    action:'pop',
                    fromViewClass:fromViewRef.viewClass,
                    fromView:fromViewRef.instance,
                    toViewClass:toViewRef ? toViewRef.viewClass : null,
                    toView:toViewRef ? toViewRef.instance : null
                },
                true).trigger(this);

        // Checking if event wasn't cancelled
        if (event.isDefaultPrevented()) return;

        // Popping top view
        pop.call(this, fromViewRef, toViewRef, 1, transition);
    }

    function popAll(transition) {
        if (this.viewsStack.length == 0) throw new Error('Popping from an empty stack!');

        // Getting ref of the view on top of the stack
        var fromViewRef = _.last(this.viewsStack),
        // Creating viewChanging event object and triggering it
            event = createEvent('viewChanging',
                {
                    action:'popAll',
                    fromViewClass:fromViewRef.viewClass,
                    fromView:fromViewRef.instance,
                    toViewClass:null,
                    toView:null
                },
                true).trigger(this);

        // Checking if event wasn't cancelled
        if (event.isDefaultPrevented()) return;

        // Popping top view
        pop.call(this, fromViewRef, null, this.viewsStack.length, transition);
    }

    function replaceView(view, viewOptions, transition) {
        if (this.viewsStack.length == 0) throw new Error('Replacing on an empty stack!');

        // Getting ref of the view on top of the stack
        var fromViewRef = _.last(this.viewsStack),
        // Creating new view instance if it is necessary
            toView = _.isFunction(view) ? new view(viewOptions) : view,
        // Creating new view ref
            toViewRef = {instance:toView, viewClass:toView.constructor, options:viewOptions},
        // Creating viewChanging event object and triggering it
            event = createEvent('viewChanging',
                {
                    action:'replace',
                    fromViewClass:fromViewRef.viewClass,
                    fromView:fromViewRef.instance,
                    toViewClass:toViewRef.viewClass,
                    toView:toViewRef.instance
                },
                true).trigger(this);

        // Checking if event wasn't cancelled
        if (event.isDefaultPrevented()) return null;

        // Pushing new view on top
        push.call(this, fromViewRef, toViewRef, 1, transition);
    }

    function replaceAll(view, viewOptions, transition) {
        if (this.viewsStack.length == 0) throw new Error('Replacing on an empty stack!');

        // Getting ref of the view on top of the stack
        var fromViewRef = _.last(this.viewsStack),
        // Creating new view instance if it is necessary
            toView = _.isFunction(view) ? new view(viewOptions) : view,
        // Creating new view ref
            toViewRef = {instance:toView, viewClass:toView.constructor, options:viewOptions},
        // Creating viewChanging event object and triggering it
            event = createEvent('viewChanging',
                {
                    action:'replaceAll',
                    fromViewClass:fromViewRef.viewClass,
                    fromView:fromViewRef.instance,
                    toViewClass:toViewRef.viewClass,
                    toView:toViewRef.instance
                },
                true).trigger(this);

        // Checking if event wasn't cancelled
        if (event.isDefaultPrevented()) return null;

        // Pushing new view on top
        push.call(this, fromViewRef, toViewRef, this.viewsStack.length, transition);
    }

    function popActionsQueue() {
        this.actionsQueue.splice(0, 1);
        if (this.actionsQueue.length > 0) {
            var action = this.actionsQueue[0],
                args = Array.prototype.slice.call(action.args);
            switch (action.fn) {
                case 'pushView':
                    pushView.apply(this, args);
                    break;
                case 'popView':
                    popView.apply(this, args);
                    break;
                case 'popAll':
                    popAll.apply(this, args);
                    break;
                case 'replaceView':
                    replaceView.apply(this, args);
                    break;
                case 'replaceAll':
                    replaceAll.apply(this, args);
                    break;
            }
        }
    }

    var StackNavigator = Backbone.View.extend(
        /** @lends BackStack.StackNavigator */
        {
            /**
             * @name StackNavigator#viewChanging
             * @event
             * @param {Object} e
             * @param {Boolean} [e.cancelable=true]
             */

            /**
             * An array with all the view refs on the stack.
             */
            viewsStack:null,

            /**
             * View on top of the stack.
             */
            activeView:null,

            /**
             * Default push transition effect.
             */
            defaultPushTransition:null,

            /**
             * Default pop transition effect.
             */
            defaultPopTransition:null,

            /**
             * Queue of actions to be executed on the stack.
             */
            actionsQueue:null,

            /**
             * Initializes StackNavigator.
             *
             * @param {Object} options This is a Backbone.View options hash that can have popTransition and pushTransition
             * properties that can be initiated for this instance of navigator.
             *
             * @constructs
             * */
            initialize:function (options) {
                // Setting default styles
                this.$el.css({overflow:'hidden'});

                // Setting new viewsStack array
                this.viewsStack = [];

                // Setting new queue of actions
                this.actionsQueue = [];

                // Setting default pop transition
                if (options.popTransition) this.defaultPopTransition = options.popTransition;

                // Setting default push transition
                if (options.pushTransition) this.defaultPushTransition = options.pushTransition;
            },

            /**
             * Pushes new view to the stack.
             *
             * @param {Backbone.View || Backbone.ViewClass} view View class or view instance to be pushed to the stack.
             * @param {Object} viewOptions Options to be passed if view is contructed by StackNavigator.
             * @param {Effect} transition Transition effect to be played when pushing new view.
             */
            pushView:function (view, viewOptions, transition) {
                // Pushing current action to the queue
                this.actionsQueue.push({fn:'pushView', args:arguments});

                if (this.actionsQueue.length == 1) pushView.call(this, view, viewOptions, transition);
            },

            /**
             * Pops an active view from a stack and displays one below.
             *
             * @param {Effect} transition Transition effect to be played when popping new view.
             */
            popView:function (transition) {
                // Pushing current action to the queue
                this.actionsQueue.push({fn:'popView', args:arguments});

                if (this.actionsQueue.length == 1) popView.call(this, transition);
            },

            /**
             * Pops all views from a stack and leaves empty stack.
             *
             * @param {Effect} transition Transition effect to be played when popping views.
             */
            popAll:function (transition) {
                // Pushing current action to the queue
                this.actionsQueue.push({fn:'popAll', args:arguments});

                if (this.actionsQueue.length == 1) popAll.call(this, transition);
            },

            /**
             * Replaces view on top of the stack, with the one passed as a view param.
             *
             * @param {Backbone.View || Backbone.ViewClass} view View class or view instance to be pushed on top of the stack instead of current one.
             * @param {Object} viewOptions Hash with options to be passed to the view, if view param is not an instance.
             * @param {Effect} transition Transition effect to be played when replacing views.
             */
            replaceView:function (view, viewOptions, transition) {
                // Pushing current action to the queue
                this.actionsQueue.push({fn:'replaceView', args:arguments});

                if (this.actionsQueue.length == 1) replaceView.call(this, view, viewOptions, transition);
            },

            /**
             * Replaces all of the views on the stack, with the one passed as a view param.
             *
             * @param {Backbone.View || Backbone.ViewClass} view View class or view instance to be pushed on top of the stack.
             * @param {Object} viewOptions Hash with options to be passed to the view, if view param is not an instance.
             * @param {Effect} transition Transition effect to be played when replacing views.
             */
            replaceAll:function (view, viewOptions, transition) {
                // Pushing current action to the queue
                this.actionsQueue.push({fn:'replaceAll', args:arguments});

                if (this.actionsQueue.length == 1) replaceAll.call(this, view, viewOptions, transition);
            }
        });

    return StackNavigator;
});
define('effects/FadeEffect',['effects/Effect'], function (Effect) {

    var FadeEffect = Effect.extend({

        fromViewTransitionProps:{duration:0.4, easing:'linear', delay:0.1},

        toViewTransitionProps:{duration:0.4, easing:'linear', delay:0.1},

        play:function ($fromView, $toView, callback, context) {

            var that = this,
                timeout,
                activeTransitions = 0,
                transitionProp = that.vendorPrefix == '' ? 'transition'
                    : ['-' + that.vendorPrefix.toLowerCase(), '-', 'transition'].join('');

            var transitionEndHandler = function (event) {
                if (activeTransitions >= 0) {
                    activeTransitions--;

                    $(event.target).css(transitionProp, '');

                    if (activeTransitions == 0 && callback) {
                        if (timeout) clearTimeout(timeout);
                        callback.call(context);
                    }
                }
            };

            if ($fromView) {
                activeTransitions++;

                // Registering transition end handler
                $fromView.one(that.transitionEndEvent, transitionEndHandler);

                // Setting transition css props
                $fromView.css(transitionProp, ['opacity ', that.fromViewTransitionProps.duration, 's ',
                                               that.fromViewTransitionProps.easing, ' ',
                                               that.fromViewTransitionProps.delay, 's'].join(''));
            }

            if ($toView) {
                activeTransitions++;

                $toView.one(that.transitionEndEvent, transitionEndHandler);

                // Setting initial opacity
                $toView.css('opacity', 0);

                // Setting transition css props
                $toView.css(transitionProp, ['opacity ', that.toViewTransitionProps.duration, 's ',
                                             that.toViewTransitionProps.easing, ' ',
                                             that.toViewTransitionProps.delay, 's'].join(''));

                // Showing the view
                $toView.css('visibility', 'visible');
            }

            // This is a hack to force DOM reflow before transition starts
            context.$el.css('width');

            // This is a fallback for situations when TransitionEnd event doesn't get triggered
            var transDuration = Math.max(that.fromViewTransitionProps.duration, that.toViewTransitionProps.duration) +
                Math.max(that.fromViewTransitionProps.delay, that.toViewTransitionProps.delay);

            timeout = setTimeout(function () {
                if (activeTransitions > 0) {
                    activeTransitions = -1;

                    console.log('Warning ' + that.transitionEndEvent + ' didn\'t trigger in expected time!');

                    if ($toView) {
                        $toView.off(that.transitionEndEvent, transitionEndHandler);
                        $toView.css(transitionProp, '');
                    }

                    if ($fromView) {
                        $fromView.off(that.transitionEndEvent, transitionEndHandler);
                        $fromView.css(transitionProp, '');
                    }

                    callback.call(context);
                }
            }, transDuration * 1.5 * 1000);

            if ($toView) $toView.css('opacity', 1);
            if ($fromView) $fromView.css('opacity', 0);
        }
    });

    return FadeEffect;
});
define('effects/NoEffect',['effects/Effect'], function (Effect) {

    var NoEffect = Effect.extend();
    NoEffect.prototype.play = function ($fromView, $toView, callback, context) {
        if ($toView) {
            // Showing the view
            $toView.css('visibility', 'visible');
        }
        callback.call(context);
    };

    return NoEffect;
});
    return {
        StackNavigator : require('StackNavigator'),
        Effect : require('effects/Effect'),
        NoEffect : require('effects/NoEffect'),
        SlideEffect : require('effects/SlideEffect'),
        FadeEffect : require('effects/FadeEffect')
    };
}));;
// jQuery RoyalSlider plugin. Custom build. Copyright 2011-2013 Dmitry Semenov http://dimsemenov.com 
// http://dimsemenov.com/private/home.php?build=bullets_auto-height 
// jquery.royalslider v9.4.8
(function(l){function t(b,f){var c,h,a=this,e=navigator.userAgent.toLowerCase();a.uid=l.rsModules.uid++;a.ns=".rs"+a.uid;var d=document.createElement("div").style,j=["webkit","Moz","ms","O"],g="",k=0;for(c=0;c<j.length;c++)h=j[c],!g&&h+"Transform"in d&&(g=h),h=h.toLowerCase(),window.requestAnimationFrame||(window.requestAnimationFrame=window[h+"RequestAnimationFrame"],window.cancelAnimationFrame=window[h+"CancelAnimationFrame"]||window[h+"CancelRequestAnimationFrame"]);window.requestAnimationFrame||
(window.requestAnimationFrame=function(a){var b=(new Date).getTime(),d=Math.max(0,16-(b-k)),c=window.setTimeout(function(){a(b+d)},d);k=b+d;return c});window.cancelAnimationFrame||(window.cancelAnimationFrame=function(a){clearTimeout(a)});a.isIPAD=e.match(/(ipad)/);j=/(chrome)[ \/]([\w.]+)/.exec(e)||/(webkit)[ \/]([\w.]+)/.exec(e)||/(opera)(?:.*version|)[ \/]([\w.]+)/.exec(e)||/(msie) ([\w.]+)/.exec(e)||0>e.indexOf("compatible")&&/(mozilla)(?:.*? rv:([\w.]+)|)/.exec(e)||[];c=j[1]||"";h=j[2]||"0";
j={};c&&(j[c]=!0,j.version=h);j.chrome&&(j.webkit=!0);a._a=j;a.isAndroid=-1<e.indexOf("android");a.slider=l(b);a.ev=l(a);a._b=l(document);a.st=l.extend({},l.fn.royalSlider.defaults,f);a._c=a.st.transitionSpeed;a._d=0;if(a.st.allowCSS3&&(!j.webkit||a.st.allowCSS3OnWebkit))e=g+(g?"T":"t"),a._e=e+"ransform"in d&&e+"ransition"in d,a._e&&(a._f=g+(g?"P":"p")+"erspective"in d);g=g.toLowerCase();a._g="-"+g+"-";a._h="vertical"===a.st.slidesOrientation?!1:!0;a._i=a._h?"left":"top";a._j=a._h?"width":"height";
a._k=-1;a._l="fade"===a.st.transitionType?!1:!0;a._l||(a.st.sliderDrag=!1,a._m=10);a._n="z-index:0; display:none; opacity:0;";a._o=0;a._p=0;a._q=0;l.each(l.rsModules,function(b,d){"uid"!==b&&d.call(a)});a.slides=[];a._r=0;(a.st.slides?l(a.st.slides):a.slider.children().detach()).each(function(){a._s(this,!0)});a.st.randomizeSlides&&a.slides.sort(function(){return 0.5-Math.random()});a.numSlides=a.slides.length;a._t();a.st.startSlideId?a.st.startSlideId>a.numSlides-1&&(a.st.startSlideId=a.numSlides-
1):a.st.startSlideId=0;a._o=a.staticSlideId=a.currSlideId=a._u=a.st.startSlideId;a.currSlide=a.slides[a.currSlideId];a._v=0;a.msTouch=!1;a.slider.addClass((a._h?"rsHor":"rsVer")+(a._l?"":" rsFade"));d='<div class="rsOverflow"><div class="rsContainer">';a.slidesSpacing=a.st.slidesSpacing;a._w=(a._h?a.slider.width():a.slider.height())+a.st.slidesSpacing;a._x=Boolean(0<a._y);1>=a.numSlides&&(a._z=!1);a._a1=a._z&&a._l?2===a.numSlides?1:2:0;a._b1=6>a.numSlides?a.numSlides:6;a._c1=0;a._d1=0;a.slidesJQ=
[];for(c=0;c<a.numSlides;c++)a.slidesJQ.push(l('<div style="'+(a._l?"":c!==a.currSlideId?a._n:"z-index:0;")+'" class="rsSlide "></div>'));a._e1=d=l(d+"</div></div>");g=a.ns;a.msEnabled=window.navigator.msPointerEnabled;a.msEnabled?(a.msTouch=Boolean(1<window.navigator.msMaxTouchPoints),a.hasTouch=!1,a._n1=0.2,a._j1="MSPointerDown"+g,a._k1="MSPointerMove"+g,a._l1="MSPointerUp"+g,a._m1="MSPointerCancel"+g):(a._j1="mousedown"+g,a._k1="mousemove"+g,a._l1="mouseup"+g,a._m1="mouseup"+g,"ontouchstart"in
window||"createTouch"in document?(a.hasTouch=!0,a._j1+=" touchstart"+g,a._k1+=" touchmove"+g,a._l1+=" touchend"+g,a._m1+=" touchcancel"+g,a._n1=0.5,a.st.sliderTouch&&(a._f1=!0)):(a.hasTouch=!1,a._n1=0.2));a.st.sliderDrag&&(a._f1=!0,j.msie||j.opera?a._g1=a._h1="move":j.mozilla?(a._g1="-moz-grab",a._h1="-moz-grabbing"):j.webkit&&-1!=navigator.platform.indexOf("Mac")&&(a._g1="-webkit-grab",a._h1="-webkit-grabbing"),a._i1());a.slider.html(d);a._o1=a.st.controlsInside?a._e1:a.slider;a._p1=a._e1.children(".rsContainer");
a.msEnabled&&a._p1.css("-ms-touch-action",a._h?"pan-y":"pan-x");a._q1=l('<div class="rsPreloader"></div>');d=a._p1.children(".rsSlide");a._r1=a.slidesJQ[a.currSlideId];a._s1=0;a._e?(a._t1="transition-property",a._u1="transition-duration",a._v1="transition-timing-function",a._w1=a._x1=a._g+"transform",a._f?(j.webkit&&!j.chrome&&a.slider.addClass("rsWebkit3d"),a._y1="translate3d(",a._z1="px, ",a._a2="px, 0px)"):(a._y1="translate(",a._z1="px, ",a._a2="px)"),a._l?a._p1[a._g+a._t1]=a._g+"transform":(g=
{},g[a._g+a._t1]="opacity",g[a._g+a._u1]=a.st.transitionSpeed+"ms",g[a._g+a._v1]=a.st.css3easeInOut,d.css(g))):(a._x1="left",a._w1="top");var n;l(window).on("resize"+a.ns,function(){n&&clearTimeout(n);n=setTimeout(function(){a.updateSliderSize()},50)});a.ev.trigger("rsAfterPropsSetup");a.updateSliderSize();a.st.keyboardNavEnabled&&a._b2();if(a.st.arrowsNavHideOnTouch&&(a.hasTouch||a.msTouch))a.st.arrowsNav=!1;a.st.arrowsNav&&(d=a._o1,l('<div class="rsArrow rsArrowLeft"><div class="rsArrowIcn"></div></div><div class="rsArrow rsArrowRight"><div class="rsArrowIcn"></div></div>').appendTo(d),
a._c2=d.children(".rsArrowLeft").click(function(b){b.preventDefault();a.prev()}),a._d2=d.children(".rsArrowRight").click(function(b){b.preventDefault();a.next()}),a.st.arrowsNavAutoHide&&!a.hasTouch&&(a._c2.addClass("rsHidden"),a._d2.addClass("rsHidden"),d.one("mousemove.arrowshover",function(){a._c2.removeClass("rsHidden");a._d2.removeClass("rsHidden")}),d.hover(function(){a._e2||(a._c2.removeClass("rsHidden"),a._d2.removeClass("rsHidden"))},function(){a._e2||(a._c2.addClass("rsHidden"),a._d2.addClass("rsHidden"))})),
a.ev.on("rsOnUpdateNav",function(){a._f2()}),a._f2());if(a._f1)a._p1.on(a._j1,function(b){a._g2(b)});else a.dragSuccess=!1;var m=["rsPlayBtnIcon","rsPlayBtn","rsCloseVideoBtn","rsCloseVideoIcn"];a._p1.click(function(b){if(!a.dragSuccess){var d=l(b.target).attr("class");if(-1!==l.inArray(d,m)&&a.toggleVideo())return!1;if(a.st.navigateByClick&&!a._h2){if(l(b.target).closest(".rsNoDrag",a._r1).length)return!0;a._i2(b)}a.ev.trigger("rsSlideClick")}}).on("click.rs","a",function(){if(a.dragSuccess)return!1;
a._h2=!0;setTimeout(function(){a._h2=!1},3)});a.ev.trigger("rsAfterInit")}l.rsModules||(l.rsModules={uid:0});t.prototype={constructor:t,_i2:function(b){b=b[this._h?"pageX":"pageY"]-this._j2;b>=this._q?this.next():0>b&&this.prev()},_t:function(){var b;b=this.st.numImagesToPreload;if(this._z=this.st.loop)2===this.numSlides?(this._z=!1,this.st.loopRewind=!0):2>this.numSlides&&(this.st.loopRewind=this._z=!1);this._z&&0<b&&(4>=this.numSlides?b=1:this.st.numImagesToPreload>(this.numSlides-1)/2&&(b=Math.floor((this.numSlides-
1)/2)));this._y=b},_s:function(b,f){function c(a,b){b?e.images.push(a.attr(b)):e.images.push(a.text());if(j){j=!1;e.caption="src"===b?a.attr("alt"):a.contents();e.image=e.images[0];e.videoURL=a.attr("data-rsVideo");var d=a.attr("data-rsw"),c=a.attr("data-rsh");"undefined"!==typeof d&&!1!==d&&"undefined"!==typeof c&&!1!==c?(e.iW=parseInt(d),e.iH=parseInt(c)):h.st.imgWidth&&h.st.imgHeight&&(e.iW=h.st.imgWidth,e.iH=h.st.imgHeight)}}var h=this,a,e={},d,j=!0;b=l(b);h._k2=b;h.ev.trigger("rsBeforeParseNode",
[b,e]);if(!e.stopParsing)return b=h._k2,e.id=h._r,e.contentAdded=!1,h._r++,e.images=[],e.isBig=!1,e.hasCover||(b.hasClass("rsImg")?(d=b,a=!0):(d=b.find(".rsImg"),d.length&&(a=!0)),a?(e.bigImage=d.eq(0).attr("data-rsBigImg"),d.each(function(){var a=l(this);a.is("a")?c(a,"href"):a.is("img")?c(a,"src"):c(a)})):b.is("img")&&(b.addClass("rsImg rsMainSlideImage"),c(b,"src"))),d=b.find(".rsCaption"),d.length&&(e.caption=d.remove()),e.content=b,h.ev.trigger("rsAfterParseNode",[b,e]),f&&h.slides.push(e),0===
e.images.length&&(e.isLoaded=!0,e.isRendered=!1,e.isLoading=!1,e.images=null),e},_b2:function(){var b=this,f,c,h=function(a){37===a?b.prev():39===a&&b.next()};b._b.on("keydown"+b.ns,function(a){if(!b._l2&&(c=a.keyCode,(37===c||39===c)&&!f))h(c),f=setInterval(function(){h(c)},700)}).on("keyup"+b.ns,function(){f&&(clearInterval(f),f=null)})},goTo:function(b,f){b!==this.currSlideId&&this._m2(b,this.st.transitionSpeed,!0,!f)},destroy:function(b){this.ev.trigger("rsBeforeDestroy");this._b.off("keydown"+
this.ns+" keyup"+this.ns+" "+this._k1+" "+this._l1);this._p1.off(this._j1+" click");this.slider.data("royalSlider",null);l.removeData(this.slider,"royalSlider");l(window).off("resize"+this.ns);b&&this.slider.remove();this.ev=this.slider=this.slides=null},_n2:function(b,f){function c(c,e,f){c.isAdded?(h(e,c),a(e,c)):(f||(f=d.slidesJQ[e]),c.holder?f=c.holder:(f=d.slidesJQ[e]=l(f),c.holder=f),c.appendOnLoaded=!1,a(e,c,f),h(e,c),d._p2(c,f,b),appended=c.isAdded=!0)}function h(a,c){c.contentAdded||(d.setItemHtml(c,
b),b||(c.contentAdded=!0))}function a(a,b,c){d._l&&(c||(c=d.slidesJQ[a]),c.css(d._i,(a+d._d1+p)*d._w))}function e(a){if(k){if(a>n-1)return e(a-n);if(0>a)return e(n+a)}return a}var d=this,j,g,k=d._z,n=d.numSlides;if(!isNaN(f))return e(f);var m=d.currSlideId,p,q=b?Math.abs(d._o2-d.currSlideId)>=d.numSlides-1?0:1:d._y,r=Math.min(2,q),u=!1,t=!1,s;for(g=m;g<m+1+r;g++)if(s=e(g),(j=d.slides[s])&&(!j.isAdded||!j.positionSet)){u=!0;break}for(g=m-1;g>m-1-r;g--)if(s=e(g),(j=d.slides[s])&&(!j.isAdded||!j.positionSet)){t=
!0;break}if(u)for(g=m;g<m+q+1;g++)s=e(g),p=Math.floor((d._u-(m-g))/d.numSlides)*d.numSlides,(j=d.slides[s])&&c(j,s);if(t)for(g=m-1;g>m-1-q;g--)s=e(g),p=Math.floor((d._u-(m-g))/n)*n,(j=d.slides[s])&&c(j,s);if(!b){r=e(m-q);m=e(m+q);q=r>m?0:r;for(g=0;g<n;g++)if(!(r>m&&g>r-1)&&(g<q||g>m))if((j=d.slides[g])&&j.holder)j.holder.detach(),j.isAdded=!1}},setItemHtml:function(b,f){function c(){if(b.images){if(!b.isLoading){var a,c;b.content.hasClass("rsImg")?(a=b.content,c=!0):a=b.content.find(".rsImg:not(img)");
a&&!a.is("img")&&a.each(function(){var a=l(this),d='<img class="rsImg" src="'+(a.is("a")?a.attr("href"):a.text())+'" />';c?b.content=l(d):a.replaceWith(d)});a=c?b.content:b.content.find("img.rsImg");j();a.eq(0).addClass("rsMainSlideImage");b.iW&&b.iH&&(b.isLoaded||k._q2(b),e());b.isLoading=!0;if(b.isBig)l("<img />").on("load.rs error.rs",function(){h([this],!0)}).attr("src",b.image);else{b.loaded=[];b.imgLoaders=[];for(a=0;a<b.images.length;a++){var d=l("<img />");b.imgLoaders.push(this);d.on("load.rs error.rs",
function(){b.loaded.push(this);b.loaded.length===b.imgLoaders.length&&h(b.loaded,!1)}).attr("src",b.images[a])}}}}else b.isRendered=!0,b.isLoaded=!0,b.isLoading=!1,e(!0)}function h(c,d){if(c.length){var e=c[0];if(d!==b.isBig)(e=b.holder.children())&&1<e.length&&g();else if(b.iW&&b.iH)a();else if(b.iW=e.width,b.iH=e.height,b.iW&&b.iH)a();else{var f=new Image;f.onload=function(){f.width?(b.iW=f.width,b.iH=f.height,a()):setTimeout(function(){f.width&&(b.iW=f.width,b.iH=f.height);a()},1E3)};f.src=e.src}}else a()}
function a(){b.isLoaded=!0;b.isLoading=!1;e();g();d()}function e(){if(!b.isAppended){var a=k.st.visibleNearby,c=b.id-k._o;if(!f&&!b.appendOnLoaded&&k.st.fadeinLoadedSlide&&(0===c||(a||k._r2||k._l2)&&(-1===c||1===c)))a={visibility:"visible",opacity:0},a[k._g+"transition"]="opacity 400ms ease-in-out",b.content.css(a),setTimeout(function(){b.content.css("opacity",1)},16);b.holder.find(".rsPreloader").length?b.holder.append(b.content):b.holder.html(b.content);b.isAppended=!0;b.isLoaded&&(k._q2(b),d());
b.sizeReady||(b.sizeReady=!0,setTimeout(function(){k.ev.trigger("rsMaybeSizeReady",b)},100))}}function d(){b.loadedTriggered||(b.isLoaded=b.loadedTriggered=!0,b.holder.trigger("rsAfterContentSet"),k.ev.trigger("rsAfterContentSet",b))}function j(){k.st.usePreloader&&b.holder.html(k._q1.clone())}function g(){if(k.st.usePreloader){var a=b.holder.find(".rsPreloader");a.length&&a.remove()}}var k=this;b.isLoaded?e():f?!k._l&&b.images&&b.iW&&b.iH?c():(b.holder.isWaiting=!0,j(),b.holder.slideId=-99):c()},
_p2:function(b){this._p1.append(b.holder);b.appendOnLoaded=!1},_g2:function(b,f){var c=this,h,a="touchstart"===b.type;c._s2=a;c.ev.trigger("rsDragStart");if(l(b.target).closest(".rsNoDrag",c._r1).length)return c.dragSuccess=!1,!0;!f&&c._r2&&(c._t2=!0,c._u2());c.dragSuccess=!1;if(c._l2)a&&(c._v2=!0);else{a&&(c._v2=!1);c._w2();if(a){var e=b.originalEvent.touches;if(e&&0<e.length)h=e[0],1<e.length&&(c._v2=!0);else return}else b.preventDefault(),h=b,c.msEnabled&&(h=h.originalEvent);c._l2=!0;c._b.on(c._k1,
function(a){c._x2(a,f)}).on(c._l1,function(a){c._y2(a,f)});c._z2="";c._a3=!1;c._b3=h.pageX;c._c3=h.pageY;c._d3=c._v=(!f?c._h:c._e3)?h.pageX:h.pageY;c._f3=0;c._g3=0;c._h3=!f?c._p:c._i3;c._j3=(new Date).getTime();if(a)c._e1.on(c._m1,function(a){c._y2(a,f)})}},_k3:function(b,f){if(this._l3){var c=this._m3,h=b.pageX-this._b3,a=b.pageY-this._c3,e=this._h3+h,d=this._h3+a,j=!f?this._h:this._e3,e=j?e:d,d=this._z2;this._a3=!0;this._b3=b.pageX;this._c3=b.pageY;"x"===d&&0!==h?this._f3=0<h?1:-1:"y"===d&&0!==
a&&(this._g3=0<a?1:-1);d=j?this._b3:this._c3;h=j?h:a;f?e>this._n3?e=this._h3+h*this._n1:e<this._o3&&(e=this._h3+h*this._n1):this._z||(0>=this.currSlideId&&0<d-this._d3&&(e=this._h3+h*this._n1),this.currSlideId>=this.numSlides-1&&0>d-this._d3&&(e=this._h3+h*this._n1));this._h3=e;200<c-this._j3&&(this._j3=c,this._v=d);f?this._q3(this._h3):this._l&&this._p3(this._h3)}},_x2:function(b,f){var c=this,h,a="touchmove"===b.type;if(!c._s2||a){if(a){if(c._r3)return;var e=b.originalEvent.touches;if(e){if(1<e.length)return;
h=e[0]}else return}else h=b,c.msEnabled&&(h=h.originalEvent);c._a3||(c._e&&(!f?c._p1:c._s3).css(c._g+c._u1,"0s"),function j(){c._l2&&(c._t3=requestAnimationFrame(j),c._u3&&c._k3(c._u3,f))}());if(c._l3)b.preventDefault(),c._m3=(new Date).getTime(),c._u3=h;else if(e=!f?c._h:c._e3,h=Math.abs(h.pageX-c._b3)-Math.abs(h.pageY-c._c3)-(e?-7:7),7<h){if(e)b.preventDefault(),c._z2="x";else if(a){c._v3();return}c._l3=!0}else if(-7>h){if(e){if(a){c._v3();return}}else b.preventDefault(),c._z2="y";c._l3=!0}}},_v3:function(){this._r3=
!0;this._a3=this._l2=!1;this._y2()},_y2:function(b,f){function c(a){return 100>a?100:500<a?500:a}function h(b,d){if(a._l||f)j=(-a._u-a._d1)*a._w,g=Math.abs(a._p-j),a._c=g/d,b&&(a._c+=250),a._c=c(a._c),a._x3(j,!1)}var a=this,e,d,j,g;d="touchend"===b.type||"touchcancel"===b.type;if(!a._s2||d)if(a._s2=!1,a.ev.trigger("rsDragRelease"),a._u3=null,a._l2=!1,a._r3=!1,a._l3=!1,a._m3=0,cancelAnimationFrame(a._t3),a._a3&&(f?a._q3(a._h3):a._l&&a._p3(a._h3)),a._b.off(a._k1).off(a._l1),d&&a._e1.off(a._m1),a._i1(),
!a._a3&&!a._v2&&f&&a._w3){var k=l(b.target).closest(".rsNavItem");k.length&&a.goTo(k.index())}else{e=!f?a._h:a._e3;if(!a._a3||"y"===a._z2&&e||"x"===a._z2&&!e)if(!f&&a._t2){a._t2=!1;if(a.st.navigateByClick){a._i2(a.msEnabled?b.originalEvent:b);a.dragSuccess=!0;return}a.dragSuccess=!0}else{a._t2=!1;a.dragSuccess=!1;return}else a.dragSuccess=!0;a._t2=!1;a._z2="";var n=a.st.minSlideOffset;d=d?b.originalEvent.changedTouches[0]:a.msEnabled?b.originalEvent:b;var m=e?d.pageX:d.pageY,p=a._d3;d=a._v;var q=
a.currSlideId,r=a.numSlides,u=e?a._f3:a._g3,t=a._z;Math.abs(m-p);e=m-d;d=(new Date).getTime()-a._j3;d=Math.abs(e)/d;if(0===u||1>=r)h(!0,d);else{if(!t&&!f)if(0>=q){if(0<u){h(!0,d);return}}else if(q>=r-1&&0>u){h(!0,d);return}if(f){j=a._i3;if(j>a._n3)j=a._n3;else if(j<a._o3)j=a._o3;else{n=d*d/0.006;k=-a._i3;m=a._y3-a._z3+a._i3;0<e&&n>k?(k+=a._z3/(15/(0.003*(n/d))),d=d*k/n,n=k):0>e&&n>m&&(m+=a._z3/(15/(0.003*(n/d))),d=d*m/n,n=m);k=Math.max(Math.round(d/0.003),50);j+=n*(0>e?-1:1);if(j>a._n3){a._a4(j,k,
!0,a._n3,200);return}if(j<a._o3){a._a4(j,k,!0,a._o3,200);return}}a._a4(j,k,!0)}else p+n<m?0>u?h(!1,d):a._m2("prev",c(Math.abs(a._p-(-a._u-a._d1+1)*a._w)/d),!1,!0,!0):p-n>m?0<u?h(!1,d):a._m2("next",c(Math.abs(a._p-(-a._u-a._d1-1)*a._w)/d),!1,!0,!0):h(!1,d)}}},_p3:function(b){b=this._p=b;this._e?this._p1.css(this._x1,this._y1+(this._h?b+this._z1+0:0+this._z1+b)+this._a2):this._p1.css(this._h?this._x1:this._w1,b)},updateSliderSize:function(b){var f,c;if(this.st.autoScaleSlider){var h=this.st.autoScaleSliderWidth,
a=this.st.autoScaleSliderHeight;this.st.autoScaleHeight?(f=this.slider.width(),f!=this.width&&(this.slider.css("height",f*(a/h)),f=this.slider.width()),c=this.slider.height()):(c=this.slider.height(),c!=this.height&&(this.slider.css("width",c*(h/a)),c=this.slider.height()),f=this.slider.width())}else f=this.slider.width(),c=this.slider.height();if(b||f!=this.width||c!=this.height){this.width=f;this.height=c;this._b4=f;this._c4=c;this.ev.trigger("rsBeforeSizeSet");this.ev.trigger("rsAfterSizePropSet");
this._e1.css({width:this._b4,height:this._c4});this._w=(this._h?this._b4:this._c4)+this.st.slidesSpacing;this._d4=this.st.imageScalePadding;for(f=0;f<this.slides.length;f++)b=this.slides[f],b.positionSet=!1,b&&(b.images&&b.isLoaded)&&(b.isRendered=!1,this._q2(b));if(this._e4)for(f=0;f<this._e4.length;f++)b=this._e4[f],b.holder.css(this._i,(b.id+this._d1)*this._w);this._n2();this._l&&(this._e&&this._p1.css(this._g+"transition-duration","0s"),this._p3((-this._u-this._d1)*this._w));this.ev.trigger("rsOnUpdateNav")}this._j2=
this._e1.offset();this._j2=this._j2[this._i]},appendSlide:function(b,f){var c=this._s(b);if(isNaN(f)||f>this.numSlides)f=this.numSlides;this.slides.splice(f,0,c);this.slidesJQ.splice(f,0,'<div style="'+(this._l?"position:absolute;":this._n)+'" class="rsSlide"></div>');f<this.currSlideId&&this.currSlideId++;this.ev.trigger("rsOnAppendSlide",[c,f]);this._g4(f);f===this.currSlideId&&this.ev.trigger("rsAfterSlideChange")},removeSlide:function(b){var f=this.slides[b];f&&(f.holder&&f.holder.remove(),b<
this.currSlideId&&this.currSlideId--,this.slides.splice(b,1),this.slidesJQ.splice(b,1),this.ev.trigger("rsOnRemoveSlide",[b]),this._g4(b),b===this.currSlideId&&this.ev.trigger("rsAfterSlideChange"))},_g4:function(){var b=this,f=b.numSlides,f=0>=b._u?0:Math.floor(b._u/f);b.numSlides=b.slides.length;0===b.numSlides?(b.currSlideId=b._d1=b._u=0,b.currSlide=b._h4=null):b._u=f*b.numSlides+b.currSlideId;for(f=0;f<b.numSlides;f++)b.slides[f].id=f;b.currSlide=b.slides[b.currSlideId];b._r1=b.slidesJQ[b.currSlideId];
b.currSlideId>=b.numSlides?b.goTo(b.numSlides-1):0>b.currSlideId&&b.goTo(0);b._t();b._l&&b._z&&b._p1.css(b._g+b._u1,"0ms");b._i4&&clearTimeout(b._i4);b._i4=setTimeout(function(){b._l&&b._p3((-b._u-b._d1)*b._w);b._n2();b._l||b._r1.css({display:"block",opacity:1})},14);b.ev.trigger("rsOnUpdateNav")},_i1:function(){this._f1&&this._l&&(this._g1?this._e1.css("cursor",this._g1):(this._e1.removeClass("grabbing-cursor"),this._e1.addClass("grab-cursor")))},_w2:function(){this._f1&&this._l&&(this._h1?this._e1.css("cursor",
this._h1):(this._e1.removeClass("grab-cursor"),this._e1.addClass("grabbing-cursor")))},next:function(b){this._m2("next",this.st.transitionSpeed,!0,!b)},prev:function(b){this._m2("prev",this.st.transitionSpeed,!0,!b)},_m2:function(b,f,c,h,a){var e=this,d,j,g;e.ev.trigger("rsBeforeMove",[b,h]);newItemId="next"===b?e.currSlideId+1:"prev"===b?e.currSlideId-1:b=parseInt(b,10);if(!e._z){if(0>newItemId){e._j4("left",!h);return}if(newItemId>=e.numSlides){e._j4("right",!h);return}}e._r2&&(e._u2(!0),c=!1);
j=newItemId-e.currSlideId;g=e._o2=e.currSlideId;var k=e.currSlideId+j;h=e._u;var l;e._z?(k=e._n2(!1,k),h+=j):h=k;e._o=k;e._h4=e.slidesJQ[e.currSlideId];e._u=h;e.currSlideId=e._o;e.currSlide=e.slides[e.currSlideId];e._r1=e.slidesJQ[e.currSlideId];var k=e.st.slidesDiff,m=Boolean(0<j);j=Math.abs(j);var p=Math.floor(g/e._y),q=Math.floor((g+(m?k:-k))/e._y),p=(m?Math.max(p,q):Math.min(p,q))*e._y+(m?e._y-1:0);p>e.numSlides-1?p=e.numSlides-1:0>p&&(p=0);g=m?p-g:g-p;g>e._y&&(g=e._y);if(j>g+k){e._d1+=(j-(g+
k))*(m?-1:1);f*=1.4;for(g=0;g<e.numSlides;g++)e.slides[g].positionSet=!1}e._c=f;e._n2(!0);a||(l=!0);d=(-h-e._d1)*e._w;l?setTimeout(function(){e._k4=!1;e._x3(d,b,!1,c);e.ev.trigger("rsOnUpdateNav")},0):(e._x3(d,b,!1,c),e.ev.trigger("rsOnUpdateNav"))},_f2:function(){this.st.arrowsNav&&(1>=this.numSlides?(this._c2.css("display","none"),this._d2.css("display","none")):(this._c2.css("display","block"),this._d2.css("display","block"),!this._z&&!this.st.loopRewind&&(0===this.currSlideId?this._c2.addClass("rsArrowDisabled"):
this._c2.removeClass("rsArrowDisabled"),this.currSlideId===this.numSlides-1?this._d2.addClass("rsArrowDisabled"):this._d2.removeClass("rsArrowDisabled"))))},_x3:function(b,f,c,h,a){function e(){var a;if(j&&(a=j.data("rsTimeout")))j!==g&&j.css({opacity:0,display:"none",zIndex:0}),clearTimeout(a),j.data("rsTimeout","");if(a=g.data("rsTimeout"))clearTimeout(a),g.data("rsTimeout","")}var d=this,j,g,k={};isNaN(d._c)&&(d._c=400);d._p=d._h3=b;d.ev.trigger("rsBeforeAnimStart");d._e?d._l?(d._c=parseInt(d._c),
c=d._g+d._v1,k[d._g+d._u1]=d._c+"ms",k[c]=h?l.rsCSS3Easing[d.st.easeInOut]:l.rsCSS3Easing[d.st.easeOut],d._p1.css(k),h||!d.hasTouch?setTimeout(function(){d._p3(b)},5):d._p3(b)):(d._c=d.st.transitionSpeed,j=d._h4,g=d._r1,g.data("rsTimeout")&&g.css("opacity",0),e(),j&&j.data("rsTimeout",setTimeout(function(){k[d._g+d._u1]="0ms";k.zIndex=0;k.display="none";j.data("rsTimeout","");j.css(k);setTimeout(function(){j.css("opacity",0)},16)},d._c+60)),k.display="block",k.zIndex=d._m,k.opacity=0,k[d._g+d._u1]=
"0ms",k[d._g+d._v1]=l.rsCSS3Easing[d.st.easeInOut],g.css(k),g.data("rsTimeout",setTimeout(function(){g.css(d._g+d._u1,d._c+"ms");g.data("rsTimeout",setTimeout(function(){g.css("opacity",1);g.data("rsTimeout","")},20))},20))):d._l?(k[d._h?d._x1:d._w1]=b+"px",d._p1.animate(k,d._c,h?d.st.easeInOut:d.st.easeOut)):(j=d._h4,g=d._r1,g.stop(!0,!0).css({opacity:0,display:"block",zIndex:d._m}),d._c=d.st.transitionSpeed,g.animate({opacity:1},d._c,d.st.easeInOut),e(),j&&j.data("rsTimeout",setTimeout(function(){j.stop(!0,
!0).css({opacity:0,display:"none",zIndex:0})},d._c+60)));d._r2=!0;d.loadingTimeout&&clearTimeout(d.loadingTimeout);d.loadingTimeout=a?setTimeout(function(){d.loadingTimeout=null;a.call()},d._c+60):setTimeout(function(){d.loadingTimeout=null;d._l4(f)},d._c+60)},_u2:function(b){this._r2=!1;clearTimeout(this.loadingTimeout);if(this._l)if(this._e){if(!b){b=this._p;var f=this._h3=this._m4();this._p1.css(this._g+this._u1,"0ms");b!==f&&this._p3(f)}}else this._p1.stop(!0),this._p=parseInt(this._p1.css(this._x1),
10);else 20<this._m?this._m=10:this._m++},_m4:function(){var b=window.getComputedStyle(this._p1.get(0),null).getPropertyValue(this._g+"transform").replace(/^matrix\(/i,"").split(/, |\)$/g),f=0===b[0].indexOf("matrix3d");return parseInt(b[this._h?f?12:4:f?13:5],10)},_n4:function(b,f){return this._e?this._y1+(f?b+this._z1+0:0+this._z1+b)+this._a2:b},_l4:function(){this._l||(this._r1.css("z-index",0),this._m=10);this._r2=!1;this.staticSlideId=this.currSlideId;this._n2();this._o4=!1;this.ev.trigger("rsAfterSlideChange")},
_j4:function(b,f){var c=this,h=(-c._u-c._d1)*c._w;if(!(0===c.numSlides||c._r2))if(c.st.loopRewind)c.goTo("left"===b?c.numSlides-1:0,f);else if(c._l){c._c=200;var a=function(){c._r2=!1};c._x3(h+("left"===b?30:-30),"",!1,!0,function(){c._r2=!1;c._x3(h,"",!1,!0,a)})}},_q2:function(b){if(!b.isRendered){var f=b.content,c="rsMainSlideImage",h,a=this.st.imageAlignCenter,e=this.st.imageScaleMode,d;b.videoURL&&(c="rsVideoContainer","fill"!==e?h=!0:(d=f,d.hasClass(c)||(d=d.find("."+c)),d.css({width:"100%",
height:"100%"}),c="rsMainSlideImage"));f.hasClass(c)||(f=f.find("."+c));if(f){var j=b.iW,c=b.iH;b.isRendered=!0;if("none"!==e||a){bMargin="fill"!==e?this._d4:0;b=this._b4-2*bMargin;d=this._c4-2*bMargin;var g,k,l={};if("fit-if-smaller"===e&&(j>b||c>d))e="fit";if("fill"===e||"fit"===e)g=b/j,k=d/c,g="fill"==e?g>k?g:k:"fit"==e?g<k?g:k:1,j=Math.ceil(j*g,10),c=Math.ceil(c*g,10);"none"!==e&&(l.width=j,l.height=c,h&&f.find(".rsImg").css({width:"100%",height:"100%"}));a&&(l.marginLeft=Math.floor((b-j)/2)+
bMargin,l.marginTop=Math.floor((d-c)/2)+bMargin);f.css(l)}}}}};l.rsProto=t.prototype;l.fn.royalSlider=function(b){var f=arguments;return this.each(function(){var c=l(this);if("object"===typeof b||!b)c.data("royalSlider")||c.data("royalSlider",new t(c,b));else if((c=c.data("royalSlider"))&&c[b])return c[b].apply(c,Array.prototype.slice.call(f,1))})};l.fn.royalSlider.defaults={slidesSpacing:8,startSlideId:0,loop:!1,loopRewind:!1,numImagesToPreload:4,fadeinLoadedSlide:!0,slidesOrientation:"horizontal",
transitionType:"move",transitionSpeed:600,controlNavigation:"bullets",controlsInside:!0,arrowsNav:!0,arrowsNavAutoHide:!0,navigateByClick:!0,randomizeSlides:!1,sliderDrag:!0,sliderTouch:!0,keyboardNavEnabled:!1,fadeInAfterLoaded:!0,allowCSS3:!0,allowCSS3OnWebkit:!0,addActiveClass:!1,autoHeight:!1,easeOut:"easeOutSine",easeInOut:"easeInOutSine",minSlideOffset:10,imageScaleMode:"fit-if-smaller",imageAlignCenter:!0,imageScalePadding:4,usePreloader:!0,autoScaleSlider:!1,autoScaleSliderWidth:800,autoScaleSliderHeight:400,
autoScaleHeight:!0,arrowsNavHideOnTouch:!1,globalCaption:!1,slidesDiff:2};l.rsCSS3Easing={easeOutSine:"cubic-bezier(0.390, 0.575, 0.565, 1.000)",easeInOutSine:"cubic-bezier(0.445, 0.050, 0.550, 0.950)"};l.extend(jQuery.easing,{easeInOutSine:function(b,f,c,h,a){return-h/2*(Math.cos(Math.PI*f/a)-1)+c},easeOutSine:function(b,f,c,h,a){return h*Math.sin(f/a*(Math.PI/2))+c},easeOutCubic:function(b,f,c,h,a){return h*((f=f/a-1)*f*f+1)+c}})})(jQuery,window);
// jquery.rs.bullets v1.0.1
(function(c){c.extend(c.rsProto,{_j5:function(){var a=this;"bullets"===a.st.controlNavigation&&(a.ev.one("rsAfterPropsSetup",function(){a._k5=!0;a.slider.addClass("rsWithBullets");for(var b='<div class="rsNav rsBullets">',e=0;e<a.numSlides;e++)b+='<div class="rsNavItem rsBullet"><span></span></div>';a._l5=b=c(b+"</div>");a._m5=b.appendTo(a.slider).children();a._l5.on("click.rs",".rsNavItem",function(){a._n5||a.goTo(c(this).index())})}),a.ev.on("rsOnAppendSlide",function(b,c,d){d>=a.numSlides?a._l5.append('<div class="rsNavItem rsBullet"><span></span></div>'):
a._m5.eq(d).before('<div class="rsNavItem rsBullet"><span></span></div>');a._m5=a._l5.children()}),a.ev.on("rsOnRemoveSlide",function(b,c){var d=a._m5.eq(c);d&&d.length&&(d.remove(),a._m5=a._l5.children())}),a.ev.on("rsOnUpdateNav",function(){var b=a.currSlideId;a._o5&&a._o5.removeClass("rsNavSelected");b=a._m5.eq(b);b.addClass("rsNavSelected");a._o5=b}))}});c.rsModules.bullets=c.rsProto._j5})(jQuery);
// jquery.rs.auto-height v1.0.2
(function(b){b.extend(b.rsProto,{_x4:function(){var a=this;if(a.st.autoHeight){var b,d,e,c=function(c){e=a.slides[a.currSlideId];if(b=e.holder)if((d=b.height())&&void 0!==d)a._c4=d,a._e||!c?a._e1.css("height",d):a._e1.stop(!0,!0).animate({height:d},a.st.transitionSpeed)};a.ev.on("rsMaybeSizeReady.rsAutoHeight",function(a,b){e===b&&c()});a.ev.on("rsAfterContentSet.rsAutoHeight",function(a,b){e===b&&c()});a.slider.addClass("rsAutoHeight");a.ev.one("rsAfterInit",function(){setTimeout(function(){c(!1);
setTimeout(function(){a.slider.append('<div style="clear:both; float: none;"></div>');a._e&&a._e1.css(a._g+"transition","height "+a.st.transitionSpeed+"ms ease-in-out")},16)},16)});a.ev.on("rsBeforeAnimStart",function(){c(!0)});a.ev.on("rsBeforeSizeSet",function(){setTimeout(function(){c(!1)},16)})}}});b.rsModules.autoHeight=b.rsProto._x4})(jQuery);;
// lib/handlebars/base.js
var Handlebars = {};

Handlebars.VERSION = "1.0.beta.6";

Handlebars.helpers  = {};
Handlebars.partials = {};

Handlebars.registerHelper = function(name, fn, inverse) {
  if(inverse) { fn.not = inverse; }
  this.helpers[name] = fn;
};

Handlebars.registerPartial = function(name, str) {
  this.partials[name] = str;
};

Handlebars.registerHelper('helperMissing', function(arg) {
  if(arguments.length === 2) {
    return undefined;
  } else {
    throw new Error("Could not find property '" + arg + "'");
  }
});

var toString = Object.prototype.toString, functionType = "[object Function]";

Handlebars.registerHelper('blockHelperMissing', function(context, options) {
  var inverse = options.inverse || function() {}, fn = options.fn;


  var ret = "";
  var type = toString.call(context);

  if(type === functionType) { context = context.call(this); }

  if(context === true) {
    return fn(this);
  } else if(context === false || context == null) {
    return inverse(this);
  } else if(type === "[object Array]") {
    if(context.length > 0) {
      for(var i=0, j=context.length; i<j; i++) {
        ret = ret + fn(context[i]);
      }
    } else {
      ret = inverse(this);
    }
    return ret;
  } else {
    return fn(context);
  }
});

Handlebars.registerHelper('each', function(context, options) {
  var fn = options.fn, inverse = options.inverse;
  var ret = "";

  if(context && context.length > 0) {
    for(var i=0, j=context.length; i<j; i++) {
      ret = ret + fn(context[i]);
    }
  } else {
    ret = inverse(this);
  }
  return ret;
});

Handlebars.registerHelper('if', function(context, options) {
  var type = toString.call(context);
  if(type === functionType) { context = context.call(this); }

  if(!context || Handlebars.Utils.isEmpty(context)) {
    return options.inverse(this);
  } else {
    return options.fn(this);
  }
});

Handlebars.registerHelper('unless', function(context, options) {
  var fn = options.fn, inverse = options.inverse;
  options.fn = inverse;
  options.inverse = fn;

  return Handlebars.helpers['if'].call(this, context, options);
});

Handlebars.registerHelper('with', function(context, options) {
  return options.fn(context);
});

Handlebars.registerHelper('log', function(context) {
  Handlebars.log(context);
});
;
// lib/handlebars/utils.js
Handlebars.Exception = function(message) {
  var tmp = Error.prototype.constructor.apply(this, arguments);

  for (var p in tmp) {
    if (tmp.hasOwnProperty(p)) { this[p] = tmp[p]; }
  }

  this.message = tmp.message;
};
Handlebars.Exception.prototype = new Error;

// Build out our basic SafeString type
Handlebars.SafeString = function(string) {
  this.string = string;
};
Handlebars.SafeString.prototype.toString = function() {
  return this.string.toString();
};

(function() {
  var escape = {
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "`": "&#x60;"
  };

  var badChars = /&(?!\w+;)|[<>"'`]/g;
  var possible = /[&<>"'`]/;

  var escapeChar = function(chr) {
    return escape[chr] || "&amp;";
  };

  Handlebars.Utils = {
    escapeExpression: function(string) {
      // don't escape SafeStrings, since they're already safe
      if (string instanceof Handlebars.SafeString) {
        return string.toString();
      } else if (string == null || string === false) {
        return "";
      }

      if(!possible.test(string)) { return string; }
      return string.replace(badChars, escapeChar);
    },

    isEmpty: function(value) {
      if (typeof value === "undefined") {
        return true;
      } else if (value === null) {
        return true;
      } else if (value === false) {
        return true;
      } else if(Object.prototype.toString.call(value) === "[object Array]" && value.length === 0) {
        return true;
      } else {
        return false;
      }
    }
  };
})();;
// lib/handlebars/runtime.js
Handlebars.VM = {
  template: function(templateSpec) {
    // Just add water
    var container = {
      escapeExpression: Handlebars.Utils.escapeExpression,
      invokePartial: Handlebars.VM.invokePartial,
      programs: [],
      program: function(i, fn, data) {
        var programWrapper = this.programs[i];
        if(data) {
          return Handlebars.VM.program(fn, data);
        } else if(programWrapper) {
          return programWrapper;
        } else {
          programWrapper = this.programs[i] = Handlebars.VM.program(fn);
          return programWrapper;
        }
      },
      programWithDepth: Handlebars.VM.programWithDepth,
      noop: Handlebars.VM.noop
    };

    return function(context, options) {
      options = options || {};
      return templateSpec.call(container, Handlebars, context, options.helpers, options.partials, options.data);
    };
  },

  programWithDepth: function(fn, data, $depth) {
    var args = Array.prototype.slice.call(arguments, 2);

    return function(context, options) {
      options = options || {};

      return fn.apply(this, [context, options.data || data].concat(args));
    };
  },
  program: function(fn, data) {
    return function(context, options) {
      options = options || {};

      return fn(context, options.data || data);
    };
  },
  noop: function() { return ""; },
  invokePartial: function(partial, name, context, helpers, partials, data) {
    options = { helpers: helpers, partials: partials, data: data };

    if(partial === undefined) {
      throw new Handlebars.Exception("The partial " + name + " could not be found");
    } else if(partial instanceof Function) {
      return partial(context, options);
    } else if (!Handlebars.compile) {
      throw new Handlebars.Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
    } else {
      partials[name] = Handlebars.compile(partial);
      return partials[name](context, options);
    }
  }
};

Handlebars.template = Handlebars.VM.template;
;
;
// Generated by CoffeeScript 1.6.1
(function() {
  var __slice = [].slice;

  (function($, window) {
    var chardinJs;
    chardinJs = (function() {

      function chardinJs(el) {
        var _this = this;
        this.$el = $(el);
        $(window).resize(function() {
          return _this.refresh();
        });
      }

      chardinJs.prototype.start = function() {
        var el, _i, _len, _ref;
        if (this._overlay_visible()) {
          return false;
        }
        this._add_overlay_layer();
        _ref = this.$el.find('*[data-intro]');
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          el = _ref[_i];
          this._show_element(el);
        }
        return this.$el.trigger('chardinJs:start');
      };

      chardinJs.prototype.toggle = function() {
        if (!this._overlay_visible()) {
          return this.start();
        } else {
          return this.stop();
        }
      };

      chardinJs.prototype.refresh = function() {
        var el, _i, _len, _ref, _results;
        if (this._overlay_visible()) {
          _ref = this.$el.find('*[data-intro]');
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            el = _ref[_i];
            _results.push(this._position_helper_layer(el));
          }
          return _results;
        } else {
          return this;
        }
      };

      chardinJs.prototype.stop = function() {
        this.$el.find(".chardinjs-overlay").fadeOut(function() {
          return $(this).remove();
        });
        this.$el.find('.chardinjs-helper-layer').remove();
        this.$el.find('.chardinjs-show-element').removeClass('chardinjs-show-element');
        if (window.removeEventListener) {
          window.removeEventListener("keydown", this._onKeyDown, true);
        } else {
          if (document.detachEvent) {
            document.detachEvent("onkeydown", this._onKeyDown);
          }
        }
        return this.$el.trigger('chardinJs:stop');
      };

      chardinJs.prototype._overlay_visible = function() {
        return this.$el.find('.chardinjs-overlay').length !== 0;
      };

      chardinJs.prototype._add_overlay_layer = function() {
        var element_position, overlay_layer, styleText,
          _this = this;
        if (this._overlay_visible()) {
          return false;
        }
        overlay_layer = document.createElement("div");
        styleText = "";
        overlay_layer.className = "chardinjs-overlay";
        if (this.$el.prop('tagName') === "BODY") {
          styleText += "top: 0;bottom: 0; left: 0;right: 0;position: fixed;";
          overlay_layer.setAttribute("style", styleText);
        } else {
          element_position = this._get_offset(this.$el.get()[0]);
          if (element_position) {
            styleText += "width: " + element_position.width + "px; height:" + element_position.height + "px; top:" + element_position.top + "px;left: " + element_position.left + "px;";
            overlay_layer.setAttribute("style", styleText);
          }
        }
        this.$el.get()[0].appendChild(overlay_layer);
        overlay_layer.onclick = function() {
          return _this.stop();
        };
        return setTimeout(function() {
          styleText += "opacity: .7;";
          return overlay_layer.setAttribute("style", styleText);
        }, 10);
      };

      chardinJs.prototype._get_position = function(element) {
        return element.getAttribute('data-position') || 'bottom';
      };

      chardinJs.prototype._place_tooltip = function(element) {
        var my_height, my_width, target_element_position, target_height, target_width, tooltip_layer, tooltip_layer_position;
        tooltip_layer = $(element).data('tooltip_layer');
        tooltip_layer_position = this._get_offset(tooltip_layer);
        tooltip_layer.style.top = null;
        tooltip_layer.style.right = null;
        tooltip_layer.style.bottom = null;
        tooltip_layer.style.left = null;
        switch (this._get_position(element)) {
          case "top":
          case "bottom":
            target_element_position = this._get_offset(element);
            target_width = target_element_position.width;
            my_width = $(tooltip_layer).width();
            tooltip_layer.style.left = "" + ((target_width / 2) - (tooltip_layer_position.width / 2)) + "px";
            break;
          case "left":
          case "right":
            target_element_position = this._get_offset(element);
            target_height = target_element_position.height;
            my_height = $(tooltip_layer).height();
            tooltip_layer.style.top = "" + ((target_height / 2) - (tooltip_layer_position.height / 2)) + "px";
        }
        switch (this._get_position(element)) {
          case "left":
            return tooltip_layer.style.left = "-" + (tooltip_layer_position.width - 34) + "px";
          case "right":
            return tooltip_layer.style.right = "-" + (tooltip_layer_position.width - 34) + "px";
          case "bottom":
            return tooltip_layer.style.bottom = "-" + tooltip_layer_position.height + "px";
          case "top":
            return tooltip_layer.style.top = "-" + tooltip_layer_position.height + "px";
        }
      };

      chardinJs.prototype._position_helper_layer = function(element) {
        var element_position, helper_layer;
        helper_layer = $(element).data('helper_layer');
        element_position = this._get_offset(element);
        return helper_layer.setAttribute("style", "width: " + element_position.width + "px; height:" + element_position.height + "px; top:" + element_position.top + "px; left: " + element_position.left + "px;");
      };

      chardinJs.prototype._show_element = function(element) {
        var current_element_position, element_position, helper_layer, tooltip_layer;
        element_position = this._get_offset(element);
        helper_layer = document.createElement("div");
        tooltip_layer = document.createElement("div");
        $(element).data('helper_layer', helper_layer).data('tooltip_layer', tooltip_layer);
        if (element.id) {
          helper_layer.setAttribute("data-id", element.id);
        }
        helper_layer.className = "chardinjs-helper-layer chardinjs-" + (this._get_position(element));
        this._position_helper_layer(element);
        this.$el.get()[0].appendChild(helper_layer);
        tooltip_layer.className = "chardinjs-tooltip chardinjs-" + (this._get_position(element));
        tooltip_layer.innerHTML = "<div class='chardinjs-tooltiptext'>" + (element.getAttribute('data-intro')) + "</div>";
        helper_layer.appendChild(tooltip_layer);
        this._place_tooltip(element);
        element.className += " chardinjs-show-element";
        current_element_position = "";
        if (element.currentStyle) {
          current_element_position = element.currentStyle["position"];
        } else {
          if (document.defaultView && document.defaultView.getComputedStyle) {
            current_element_position = document.defaultView.getComputedStyle(element, null).getPropertyValue("position");
          }
        }
        current_element_position = current_element_position.toLowerCase();
        if (current_element_position !== "absolute" && current_element_position !== "relative") {
          return element.className += " chardinjs-relative-position";
        }
      };

      chardinJs.prototype._get_offset = function(element) {
        var element_position, _x, _y;
        element_position = {
          width: element.offsetWidth,
          height: element.offsetHeight
        };
        _x = 0;
        _y = 0;
        while (element && !isNaN(element.offsetLeft) && !isNaN(element.offsetTop)) {
          _x += element.offsetLeft;
          _y += element.offsetTop;
          element = element.offsetParent;
        }
        element_position.top = _y;
        element_position.left = _x;
        return element_position;
      };

      return chardinJs;

    })();
    return $.fn.extend({
      chardinJs: function() {
        var $this, args, data, option;
        option = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        $this = $(this[0]);
        data = $this.data('chardinJs');
        if (!data) {
          $this.data('chardinJs', (data = new chardinJs(this, option)));
        }
        if (typeof option === 'string') {
          data[option].apply(data, args);
        }
        return data;
      }
    });
  })(window.jQuery, window);

}).call(this);;
// Make it safe to do console.log() always.
(function (con) {
  var method;
  var dummy = function() {};
  var methods = ('assert,count,debug,dir,dirxml,error,exception,group,' +
     'groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,' + 
     'time,timeEnd,trace,warn').split(',');
  while (method = methods.pop()) {
    con[method] = con[method] || dummy;
  }
})(window.console = window.console || {});
;
/*!
 * iScroll v4.2 ~ Copyright (c) 2012 Matteo Spinelli, http://cubiq.org
 * Released under MIT license, http://cubiq.org/license
 */
(function(window, doc){
var m = Math,
	dummyStyle = doc.createElement('div').style,
	vendor = (function () {
		var vendors = 't,webkitT,MozT,msT,OT'.split(','),
			t,
			i = 0,
			l = vendors.length;

		for ( ; i < l; i++ ) {
			t = vendors[i] + 'ransform';
			if ( t in dummyStyle ) {
				return vendors[i].substr(0, vendors[i].length - 1);
			}
		}

		return false;
	})(),
	cssVendor = vendor ? '-' + vendor.toLowerCase() + '-' : '',

	// Style properties
	transform = prefixStyle('transform'),
	transitionProperty = prefixStyle('transitionProperty'),
	transitionDuration = prefixStyle('transitionDuration'),
	transformOrigin = prefixStyle('transformOrigin'),
	transitionTimingFunction = prefixStyle('transitionTimingFunction'),
	transitionDelay = prefixStyle('transitionDelay'),

    // Browser capabilities
	isAndroid = (/android/gi).test(navigator.appVersion),
	isIDevice = (/iphone|ipad/gi).test(navigator.appVersion),
	isTouchPad = (/hp-tablet/gi).test(navigator.appVersion),

    has3d = prefixStyle('perspective') in dummyStyle,
    hasTouch = 'ontouchstart' in window && !isTouchPad,
    hasTransform = !!vendor,
    hasTransitionEnd = prefixStyle('transition') in dummyStyle,

	RESIZE_EV = 'onorientationchange' in window ? 'orientationchange' : 'resize',
	START_EV = hasTouch ? 'touchstart' : 'mousedown',
	MOVE_EV = hasTouch ? 'touchmove' : 'mousemove',
	END_EV = hasTouch ? 'touchend' : 'mouseup',
	CANCEL_EV = hasTouch ? 'touchcancel' : 'mouseup',
	WHEEL_EV = vendor == 'Moz' ? 'DOMMouseScroll' : 'mousewheel',
	TRNEND_EV = (function () {
		if ( vendor === false ) return false;

		var transitionEnd = {
				''			: 'transitionend',
				'webkit'	: 'webkitTransitionEnd',
				'Moz'		: 'transitionend',
				'O'			: 'oTransitionEnd',
				'ms'		: 'MSTransitionEnd'
			};

		return transitionEnd[vendor];
	})(),

	nextFrame = (function() {
		return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function(callback) { return setTimeout(callback, 1); };
	})(),
	cancelFrame = (function () {
		return window.cancelRequestAnimationFrame ||
			window.webkitCancelAnimationFrame ||
			window.webkitCancelRequestAnimationFrame ||
			window.mozCancelRequestAnimationFrame ||
			window.oCancelRequestAnimationFrame ||
			window.msCancelRequestAnimationFrame ||
			clearTimeout;
	})(),

	// Helpers
	translateZ = has3d ? ' translateZ(0)' : '',

	// Constructor
	iScroll = function (el, options) {
		var that = this,
			i;

		that.wrapper = typeof el == 'object' ? el : doc.getElementById(el);
		that.wrapper.style.overflow = 'hidden';
		that.scroller = that.wrapper.children[0];

		// Default options
		that.options = {
			hScroll: true,
			vScroll: true,
			x: 0,
			y: 0,
			bounce: true,
			bounceLock: false,
			momentum: true,
			lockDirection: true,
			useTransform: true,
			useTransition: false,
			topOffset: 0,
			checkDOMChanges: false,		// Experimental
			handleClick: true,

			// Scrollbar
			hScrollbar: true,
			vScrollbar: true,
			fixedScrollbar: isAndroid,
			hideScrollbar: isIDevice,
			fadeScrollbar: isIDevice && has3d,
			scrollbarClass: '',

			// Zoom
			zoom: false,
			zoomMin: 1,
			zoomMax: 4,
			doubleTapZoom: 2,
			wheelAction: 'scroll',

			// Snap
			snap: false,
			snapThreshold: 1,

			// Events
			onRefresh: null,
			onBeforeScrollStart: function (e) { 
				if ((e.target.tagName != "SELECT") && (e.target.tagName != "INPUT")) {
					e.preventDefault(); 
				}
			},
			onScrollStart: null,
			onBeforeScrollMove: null,
			onScrollMove: null,
			onBeforeScrollEnd: null,
			onScrollEnd: null,
			onTouchEnd: null,
			onDestroy: null,
			onZoomStart: null,
			onZoom: null,
			onZoomEnd: null
		};

		// User defined options
		for (i in options) that.options[i] = options[i];
		
		// Set starting position
		that.x = that.options.x;
		that.y = that.options.y;

		// Normalize options
		that.options.useTransform = hasTransform && that.options.useTransform;
		that.options.hScrollbar = that.options.hScroll && that.options.hScrollbar;
		that.options.vScrollbar = that.options.vScroll && that.options.vScrollbar;
		that.options.zoom = that.options.useTransform && that.options.zoom;
		that.options.useTransition = hasTransitionEnd && that.options.useTransition;

		// Helpers FIX ANDROID BUG!
		// translate3d and scale doesn't work together!
		// Ignoring 3d ONLY WHEN YOU SET that.options.zoom
		if ( that.options.zoom && isAndroid ){
			translateZ = '';
		}
		
		// Set some default styles
		that.scroller.style[transitionProperty] = that.options.useTransform ? cssVendor + 'transform' : 'top left';
		that.scroller.style[transitionDuration] = '0';
		that.scroller.style[transformOrigin] = '0 0';
		if (that.options.useTransition) that.scroller.style[transitionTimingFunction] = 'cubic-bezier(0.33,0.66,0.66,1)';
		
		if (that.options.useTransform) that.scroller.style[transform] = 'translate(' + that.x + 'px,' + that.y + 'px)' + translateZ;
		else that.scroller.style.cssText += ';position:absolute;top:' + that.y + 'px;left:' + that.x + 'px';

		if (that.options.useTransition) that.options.fixedScrollbar = true;

		that.refresh();

		that._bind(RESIZE_EV, window);
		that._bind(START_EV);
		if (!hasTouch) {
			that._bind('mouseout', that.wrapper);
			if (that.options.wheelAction != 'none')
				that._bind(WHEEL_EV);
		}

		if (that.options.checkDOMChanges) that.checkDOMTime = setInterval(function () {
			that._checkDOMChanges();
		}, 500);
	};

// Prototype
iScroll.prototype = {
	enabled: true,
	x: 0,
	y: 0,
	steps: [],
	scale: 1,
	currPageX: 0, currPageY: 0,
	pagesX: [], pagesY: [],
	aniTime: null,
	wheelZoomCount: 0,
	
	handleEvent: function (e) {
		var that = this;
		switch(e.type) {
			case START_EV:
				if (!hasTouch && e.button !== 0) return;
				that._start(e);
				break;
			case MOVE_EV: that._move(e); break;
			case END_EV:
			case CANCEL_EV: that._end(e); break;
			case RESIZE_EV: that._resize(); break;
			case WHEEL_EV: that._wheel(e); break;
			case 'mouseout': that._mouseout(e); break;
			case TRNEND_EV: that._transitionEnd(e); break;
		}
	},
	
	_checkDOMChanges: function () {
		if (this.moved || this.zoomed || this.animating ||
			(this.scrollerW == this.scroller.offsetWidth * this.scale && this.scrollerH == this.scroller.offsetHeight * this.scale)) return;

		this.refresh();
	},
	
	_scrollbar: function (dir) {
		var that = this,
			bar;

		if (!that[dir + 'Scrollbar']) {
			if (that[dir + 'ScrollbarWrapper']) {
				if (hasTransform) that[dir + 'ScrollbarIndicator'].style[transform] = '';
				that[dir + 'ScrollbarWrapper'].parentNode.removeChild(that[dir + 'ScrollbarWrapper']);
				that[dir + 'ScrollbarWrapper'] = null;
				that[dir + 'ScrollbarIndicator'] = null;
			}

			return;
		}

		if (!that[dir + 'ScrollbarWrapper']) {
			// Create the scrollbar wrapper
			bar = doc.createElement('div');

			if (that.options.scrollbarClass) bar.className = that.options.scrollbarClass + dir.toUpperCase();
			else bar.style.cssText = 'position:absolute;z-index:100;' + (dir == 'h' ? 'height:7px;bottom:1px;left:2px;right:' + (that.vScrollbar ? '7' : '2') + 'px' : 'width:7px;bottom:' + (that.hScrollbar ? '7' : '2') + 'px;top:2px;right:1px');

			bar.style.cssText += ';pointer-events:none;' + cssVendor + 'transition-property:opacity;' + cssVendor + 'transition-duration:' + (that.options.fadeScrollbar ? '350ms' : '0') + ';overflow:hidden;opacity:' + (that.options.hideScrollbar ? '0' : '1');

			that.wrapper.appendChild(bar);
			that[dir + 'ScrollbarWrapper'] = bar;

			// Create the scrollbar indicator
			bar = doc.createElement('div');
			if (!that.options.scrollbarClass) {
				bar.style.cssText = 'position:absolute;z-index:100;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.9);' + cssVendor + 'background-clip:padding-box;' + cssVendor + 'box-sizing:border-box;' + (dir == 'h' ? 'height:100%' : 'width:100%') + ';' + cssVendor + 'border-radius:3px;border-radius:3px';
			}
			bar.style.cssText += ';pointer-events:none;' + cssVendor + 'transition-property:' + cssVendor + 'transform;' + cssVendor + 'transition-timing-function:cubic-bezier(0.33,0.66,0.66,1);' + cssVendor + 'transition-duration:0;' + cssVendor + 'transform: translate(0,0)' + translateZ;
			if (that.options.useTransition) bar.style.cssText += ';' + cssVendor + 'transition-timing-function:cubic-bezier(0.33,0.66,0.66,1)';

			that[dir + 'ScrollbarWrapper'].appendChild(bar);
			that[dir + 'ScrollbarIndicator'] = bar;
		}

		if (dir == 'h') {
			that.hScrollbarSize = that.hScrollbarWrapper.clientWidth;
			that.hScrollbarIndicatorSize = m.max(m.round(that.hScrollbarSize * that.hScrollbarSize / that.scrollerW), 8);
			that.hScrollbarIndicator.style.width = that.hScrollbarIndicatorSize + 'px';
			that.hScrollbarMaxScroll = that.hScrollbarSize - that.hScrollbarIndicatorSize;
			that.hScrollbarProp = that.hScrollbarMaxScroll / that.maxScrollX;
		} else {
			that.vScrollbarSize = that.vScrollbarWrapper.clientHeight;
			that.vScrollbarIndicatorSize = m.max(m.round(that.vScrollbarSize * that.vScrollbarSize / that.scrollerH), 8);
			that.vScrollbarIndicator.style.height = that.vScrollbarIndicatorSize + 'px';
			that.vScrollbarMaxScroll = that.vScrollbarSize - that.vScrollbarIndicatorSize;
			that.vScrollbarProp = that.vScrollbarMaxScroll / that.maxScrollY;
		}

		// Reset position
		that._scrollbarPos(dir, true);
	},
	
	_resize: function () {
		var that = this;
		setTimeout(function () { that.refresh(); }, isAndroid ? 200 : 0);
	},
	
	_pos: function (x, y) {
		if (this.zoomed) return;

		x = this.hScroll ? x : 0;
		y = this.vScroll ? y : 0;

		if (this.options.useTransform) {
			this.scroller.style[transform] = 'translate(' + x + 'px,' + y + 'px) scale(' + this.scale + ')' + translateZ;
		} else {
			x = m.round(x);
			y = m.round(y);
			this.scroller.style.left = x + 'px';
			this.scroller.style.top = y + 'px';
		}

		this.x = x;
		this.y = y;

		this._scrollbarPos('h');
		this._scrollbarPos('v');
	},

	_scrollbarPos: function (dir, hidden) {
		var that = this,
			pos = dir == 'h' ? that.x : that.y,
			size;

		if (!that[dir + 'Scrollbar']) return;

		pos = that[dir + 'ScrollbarProp'] * pos;

		if (pos < 0) {
			if (!that.options.fixedScrollbar) {
				size = that[dir + 'ScrollbarIndicatorSize'] + m.round(pos * 3);
				if (size < 8) size = 8;
				that[dir + 'ScrollbarIndicator'].style[dir == 'h' ? 'width' : 'height'] = size + 'px';
			}
			pos = 0;
		} else if (pos > that[dir + 'ScrollbarMaxScroll']) {
			if (!that.options.fixedScrollbar) {
				size = that[dir + 'ScrollbarIndicatorSize'] - m.round((pos - that[dir + 'ScrollbarMaxScroll']) * 3);
				if (size < 8) size = 8;
				that[dir + 'ScrollbarIndicator'].style[dir == 'h' ? 'width' : 'height'] = size + 'px';
				pos = that[dir + 'ScrollbarMaxScroll'] + (that[dir + 'ScrollbarIndicatorSize'] - size);
			} else {
				pos = that[dir + 'ScrollbarMaxScroll'];
			}
		}

		that[dir + 'ScrollbarWrapper'].style[transitionDelay] = '0';
		that[dir + 'ScrollbarWrapper'].style.opacity = hidden && that.options.hideScrollbar ? '0' : '1';
		that[dir + 'ScrollbarIndicator'].style[transform] = 'translate(' + (dir == 'h' ? pos + 'px,0)' : '0,' + pos + 'px)') + translateZ;
	},
	
	_start: function (e) {
		var that = this,
			point = hasTouch ? e.touches[0] : e,
			matrix, x, y,
			c1, c2;

		if (!that.enabled) return;

		if (that.options.onBeforeScrollStart) that.options.onBeforeScrollStart.call(that, e);

		if (that.options.useTransition || that.options.zoom) that._transitionTime(0);

		that.moved = false;
		that.animating = false;
		that.zoomed = false;
		that.distX = 0;
		that.distY = 0;
		that.absDistX = 0;
		that.absDistY = 0;
		that.dirX = 0;
		that.dirY = 0;
				
		if (   e.target.tagName == "SELECT" || e.target.tagName == "INPUT"
            || e.target.tagName == "BUTTON" || e.target.tagName == "TEXTAREA") {
            return true;
        }

		// Gesture start
		if (that.options.zoom && hasTouch && e.touches.length > 1) {
			c1 = m.abs(e.touches[0].pageX-e.touches[1].pageX);
			c2 = m.abs(e.touches[0].pageY-e.touches[1].pageY);
			that.touchesDistStart = m.sqrt(c1 * c1 + c2 * c2);

			that.originX = m.abs(e.touches[0].pageX + e.touches[1].pageX - that.wrapperOffsetLeft * 2) / 2 - that.x;
			that.originY = m.abs(e.touches[0].pageY + e.touches[1].pageY - that.wrapperOffsetTop * 2) / 2 - that.y;

			if (that.options.onZoomStart) that.options.onZoomStart.call(that, e);
		}

		if (that.options.momentum) {
			if (that.options.useTransform) {
				// Very lame general purpose alternative to CSSMatrix
				matrix = getComputedStyle(that.scroller, null)[transform].replace(/[^0-9\-.,]/g, '').split(',');
				x = matrix[4] * 1;
				y = matrix[5] * 1;
			} else {
				x = getComputedStyle(that.scroller, null).left.replace(/[^0-9-]/g, '') * 1;
				y = getComputedStyle(that.scroller, null).top.replace(/[^0-9-]/g, '') * 1;
			}
			
			if (x != that.x || y != that.y) {
				if (that.options.useTransition) that._unbind(TRNEND_EV);
				else cancelFrame(that.aniTime);
				that.steps = [];
				that._pos(x, y);
			}
		}

		that.absStartX = that.x;	// Needed by snap threshold
		that.absStartY = that.y;

		that.startX = that.x;
		that.startY = that.y;
		that.pointX = point.pageX;
		that.pointY = point.pageY;

		that.startTime = e.timeStamp || Date.now();

		if (that.options.onScrollStart) that.options.onScrollStart.call(that, e);

		that._bind(MOVE_EV);
		that._bind(END_EV);
		that._bind(CANCEL_EV);
	},
	
	_move: function (e) {
		var that = this,
			point = hasTouch ? e.touches[0] : e,
			deltaX = point.pageX - that.pointX,
			deltaY = point.pageY - that.pointY,
			newX = that.x + deltaX,
			newY = that.y + deltaY,
			c1, c2, scale,
			timestamp = e.timeStamp || Date.now();

		if (that.options.onBeforeScrollMove) that.options.onBeforeScrollMove.call(that, e);

		// Zoom
		if (that.options.zoom && hasTouch && e.touches.length > 1) {
			c1 = m.abs(e.touches[0].pageX - e.touches[1].pageX);
			c2 = m.abs(e.touches[0].pageY - e.touches[1].pageY);
			that.touchesDist = m.sqrt(c1*c1+c2*c2);

			that.zoomed = true;

			scale = 1 / that.touchesDistStart * that.touchesDist * this.scale;

			if (scale < that.options.zoomMin) scale = 0.5 * that.options.zoomMin * Math.pow(2.0, scale / that.options.zoomMin);
			else if (scale > that.options.zoomMax) scale = 2.0 * that.options.zoomMax * Math.pow(0.5, that.options.zoomMax / scale);

			that.lastScale = scale / this.scale;

			newX = this.originX - this.originX * that.lastScale + this.x,
			newY = this.originY - this.originY * that.lastScale + this.y;

			this.scroller.style[transform] = 'translate(' + newX + 'px,' + newY + 'px) scale(' + scale + ')' + translateZ;

			if (that.options.onZoom) that.options.onZoom.call(that, e);
			return;
		}

		that.pointX = point.pageX;
		that.pointY = point.pageY;

		// Slow down if outside of the boundaries
		if (newX > 0 || newX < that.maxScrollX) {
			newX = that.options.bounce ? that.x + (deltaX / 2) : newX >= 0 || that.maxScrollX >= 0 ? 0 : that.maxScrollX;
		}
		if (newY > that.minScrollY || newY < that.maxScrollY) {
			newY = that.options.bounce ? that.y + (deltaY / 2) : newY >= that.minScrollY || that.maxScrollY >= 0 ? that.minScrollY : that.maxScrollY;
		}

		that.distX += deltaX;
		that.distY += deltaY;
		that.absDistX = m.abs(that.distX);
		that.absDistY = m.abs(that.distY);

		if (that.absDistX < 6 && that.absDistY < 6) {
			return;
		}

		// Lock direction
		if (that.options.lockDirection) {
			if (that.absDistX > that.absDistY + 5) {
				newY = that.y;
				deltaY = 0;
			} else if (that.absDistY > that.absDistX + 5) {
				newX = that.x;
				deltaX = 0;
			}
		}

		that.moved = true;
		that._pos(newX, newY);
		that.dirX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
		that.dirY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

		if (timestamp - that.startTime > 300) {
			that.startTime = timestamp;
			that.startX = that.x;
			that.startY = that.y;
		}
		
		if (that.options.onScrollMove) that.options.onScrollMove.call(that, e);
	},
	
	_end: function (e) {
		if (hasTouch && e.touches.length !== 0) return;

		var that = this,
			point = hasTouch ? e.changedTouches[0] : e,
			target, ev,
			momentumX = { dist:0, time:0 },
			momentumY = { dist:0, time:0 },
			duration = (e.timeStamp || Date.now()) - that.startTime,
			newPosX = that.x,
			newPosY = that.y,
			distX, distY,
			newDuration,
			snap,
			scale;

		that._unbind(MOVE_EV);
		that._unbind(END_EV);
		that._unbind(CANCEL_EV);

		if (that.options.onBeforeScrollEnd) that.options.onBeforeScrollEnd.call(that, e);

		if (that.zoomed) {
			scale = that.scale * that.lastScale;
			scale = Math.max(that.options.zoomMin, scale);
			scale = Math.min(that.options.zoomMax, scale);
			that.lastScale = scale / that.scale;
			that.scale = scale;

			that.x = that.originX - that.originX * that.lastScale + that.x;
			that.y = that.originY - that.originY * that.lastScale + that.y;
			
			that.scroller.style[transitionDuration] = '200ms';
			that.scroller.style[transform] = 'translate(' + that.x + 'px,' + that.y + 'px) scale(' + that.scale + ')' + translateZ;
			
			that.zoomed = false;
			that.refresh();

			if (that.options.onZoomEnd) that.options.onZoomEnd.call(that, e);
			return;
		}

		if (!that.moved) {
			if (hasTouch) {
				if (that.doubleTapTimer && that.options.zoom) {
					// Double tapped
					clearTimeout(that.doubleTapTimer);
					that.doubleTapTimer = null;
					if (that.options.onZoomStart) that.options.onZoomStart.call(that, e);
					that.zoom(that.pointX, that.pointY, that.scale == 1 ? that.options.doubleTapZoom : 1);
					if (that.options.onZoomEnd) {
						setTimeout(function() {
							that.options.onZoomEnd.call(that, e);
						}, 200); // 200 is default zoom duration
					}
				} else if (this.options.handleClick) {
					that.doubleTapTimer = setTimeout(function () {
						that.doubleTapTimer = null;

						// Find the last touched element
						target = point.target;
						while (target.nodeType != 1) target = target.parentNode;

						if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA') {
							ev = doc.createEvent('MouseEvents');
							ev.initMouseEvent('click', true, true, e.view, 1,
								point.screenX, point.screenY, point.clientX, point.clientY,
								e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
								0, null);
							ev._fake = true;
							target.dispatchEvent(ev);
						}
					}, that.options.zoom ? 250 : 0);
				}
			}

			that._resetPos(200);

			if (that.options.onTouchEnd) that.options.onTouchEnd.call(that, e);
			return;
		}

		if (duration < 300 && that.options.momentum) {
			momentumX = newPosX ? that._momentum(newPosX - that.startX, duration, -that.x, that.scrollerW - that.wrapperW + that.x, that.options.bounce ? that.wrapperW : 0) : momentumX;
			momentumY = newPosY ? that._momentum(newPosY - that.startY, duration, -that.y, (that.maxScrollY < 0 ? that.scrollerH - that.wrapperH + that.y - that.minScrollY : 0), that.options.bounce ? that.wrapperH : 0) : momentumY;

			newPosX = that.x + momentumX.dist;
			newPosY = that.y + momentumY.dist;

			if ((that.x > 0 && newPosX > 0) || (that.x < that.maxScrollX && newPosX < that.maxScrollX)) momentumX = { dist:0, time:0 };
			if ((that.y > that.minScrollY && newPosY > that.minScrollY) || (that.y < that.maxScrollY && newPosY < that.maxScrollY)) momentumY = { dist:0, time:0 };
		}

		if (momentumX.dist || momentumY.dist) {
			newDuration = m.max(m.max(momentumX.time, momentumY.time), 10);

			// Do we need to snap?
			if (that.options.snap) {
				distX = newPosX - that.absStartX;
				distY = newPosY - that.absStartY;
				if (m.abs(distX) < that.options.snapThreshold && m.abs(distY) < that.options.snapThreshold) { that.scrollTo(that.absStartX, that.absStartY, 200); }
				else {
					snap = that._snap(newPosX, newPosY);
					newPosX = snap.x;
					newPosY = snap.y;
					newDuration = m.max(snap.time, newDuration);
				}
			}

			that.scrollTo(m.round(newPosX), m.round(newPosY), newDuration);

			if (that.options.onTouchEnd) that.options.onTouchEnd.call(that, e);
			return;
		}

		// Do we need to snap?
		if (that.options.snap) {
			distX = newPosX - that.absStartX;
			distY = newPosY - that.absStartY;
			if (m.abs(distX) < that.options.snapThreshold && m.abs(distY) < that.options.snapThreshold) that.scrollTo(that.absStartX, that.absStartY, 200);
			else {
				snap = that._snap(that.x, that.y);
				if (snap.x != that.x || snap.y != that.y) that.scrollTo(snap.x, snap.y, snap.time);
			}

			if (that.options.onTouchEnd) that.options.onTouchEnd.call(that, e);
			return;
		}

		that._resetPos(200);
		if (that.options.onTouchEnd) that.options.onTouchEnd.call(that, e);
	},
	
	_resetPos: function (time) {
		var that = this,
			resetX = that.x >= 0 ? 0 : that.x < that.maxScrollX ? that.maxScrollX : that.x,
			resetY = that.y >= that.minScrollY || that.maxScrollY > 0 ? that.minScrollY : that.y < that.maxScrollY ? that.maxScrollY : that.y;

		if (resetX == that.x && resetY == that.y) {
			if (that.moved) {
				that.moved = false;
				if (that.options.onScrollEnd) that.options.onScrollEnd.call(that);		// Execute custom code on scroll end
			}

			if (that.hScrollbar && that.options.hideScrollbar) {
				if (vendor == 'webkit') that.hScrollbarWrapper.style[transitionDelay] = '300ms';
				that.hScrollbarWrapper.style.opacity = '0';
			}
			if (that.vScrollbar && that.options.hideScrollbar) {
				if (vendor == 'webkit') that.vScrollbarWrapper.style[transitionDelay] = '300ms';
				that.vScrollbarWrapper.style.opacity = '0';
			}

			return;
		}

		that.scrollTo(resetX, resetY, time || 0);
	},

	_wheel: function (e) {
		var that = this,
			wheelDeltaX, wheelDeltaY,
			deltaX, deltaY,
			deltaScale;

		if ('wheelDeltaX' in e) {
			wheelDeltaX = e.wheelDeltaX / 12;
			wheelDeltaY = e.wheelDeltaY / 12;
		} else if('wheelDelta' in e) {
			wheelDeltaX = wheelDeltaY = e.wheelDelta / 12;
		} else if ('detail' in e) {
			wheelDeltaX = wheelDeltaY = -e.detail * 3;
		} else {
			return;
		}
		
		if (that.options.wheelAction == 'zoom') {
			deltaScale = that.scale * Math.pow(2, 1/3 * (wheelDeltaY ? wheelDeltaY / Math.abs(wheelDeltaY) : 0));
			if (deltaScale < that.options.zoomMin) deltaScale = that.options.zoomMin;
			if (deltaScale > that.options.zoomMax) deltaScale = that.options.zoomMax;
			
			if (deltaScale != that.scale) {
				if (!that.wheelZoomCount && that.options.onZoomStart) that.options.onZoomStart.call(that, e);
				that.wheelZoomCount++;
				
				that.zoom(e.pageX, e.pageY, deltaScale, 400);
				
				setTimeout(function() {
					that.wheelZoomCount--;
					if (!that.wheelZoomCount && that.options.onZoomEnd) that.options.onZoomEnd.call(that, e);
				}, 400);
			}
			
			return;
		}
		
		deltaX = that.x + wheelDeltaX;
		deltaY = that.y + wheelDeltaY;

		if (deltaX > 0) deltaX = 0;
		else if (deltaX < that.maxScrollX) deltaX = that.maxScrollX;

		if (deltaY > that.minScrollY) deltaY = that.minScrollY;
		else if (deltaY < that.maxScrollY) deltaY = that.maxScrollY;
    
		if (that.maxScrollY < 0) {
			that.scrollTo(deltaX, deltaY, 0);
		}
	},
	
	_mouseout: function (e) {
		var t = e.relatedTarget;

		if (!t) {
			this._end(e);
			return;
		}

		while (t = t.parentNode) if (t == this.wrapper) return;
		
		this._end(e);
	},

	_transitionEnd: function (e) {
		var that = this;

		if (e.target != that.scroller) return;

		that._unbind(TRNEND_EV);
		
		that._startAni();
	},


	/**
	*
	* Utilities
	*
	*/
	_startAni: function () {
		var that = this,
			startX = that.x, startY = that.y,
			startTime = Date.now(),
			step, easeOut,
			animate;

		if (that.animating) return;
		
		if (!that.steps.length) {
			that._resetPos(400);
			return;
		}
		
		step = that.steps.shift();
		
		if (step.x == startX && step.y == startY) step.time = 0;

		that.animating = true;
		that.moved = true;
		
		if (that.options.useTransition) {
			that._transitionTime(step.time);
			that._pos(step.x, step.y);
			that.animating = false;
			if (step.time) that._bind(TRNEND_EV);
			else that._resetPos(0);
			return;
		}

		animate = function () {
			var now = Date.now(),
				newX, newY;

			if (now >= startTime + step.time) {
				that._pos(step.x, step.y);
				that.animating = false;
				if (that.options.onAnimationEnd) that.options.onAnimationEnd.call(that);			// Execute custom code on animation end
				that._startAni();
				return;
			}

			now = (now - startTime) / step.time - 1;
			easeOut = m.sqrt(1 - now * now);
			newX = (step.x - startX) * easeOut + startX;
			newY = (step.y - startY) * easeOut + startY;
			that._pos(newX, newY);
			if (that.animating) that.aniTime = nextFrame(animate);
		};

		animate();
	},

	_transitionTime: function (time) {
		time += 'ms';
		this.scroller.style[transitionDuration] = time;
		if (this.hScrollbar) this.hScrollbarIndicator.style[transitionDuration] = time;
		if (this.vScrollbar) this.vScrollbarIndicator.style[transitionDuration] = time;
	},

	_momentum: function (dist, time, maxDistUpper, maxDistLower, size) {
		var deceleration = 0.0006,
			speed = m.abs(dist) / time,
			newDist = (speed * speed) / (2 * deceleration),
			newTime = 0, outsideDist = 0;

		// Proportinally reduce speed if we are outside of the boundaries
		if (dist > 0 && newDist > maxDistUpper) {
			outsideDist = size / (6 / (newDist / speed * deceleration));
			maxDistUpper = maxDistUpper + outsideDist;
			speed = speed * maxDistUpper / newDist;
			newDist = maxDistUpper;
		} else if (dist < 0 && newDist > maxDistLower) {
			outsideDist = size / (6 / (newDist / speed * deceleration));
			maxDistLower = maxDistLower + outsideDist;
			speed = speed * maxDistLower / newDist;
			newDist = maxDistLower;
		}

		newDist = newDist * (dist < 0 ? -1 : 1);
		newTime = speed / deceleration;

		return { dist: newDist, time: m.round(newTime) };
	},

	_offset: function (el) {
		var left = -el.offsetLeft,
			top = -el.offsetTop;
			
		while (el = el.offsetParent) {
			left -= el.offsetLeft;
			top -= el.offsetTop;
		}
		
		if (el != this.wrapper) {
			left *= this.scale;
			top *= this.scale;
		}

		return { left: left, top: top };
	},

	_snap: function (x, y) {
		var that = this,
			i, l,
			page, time,
			sizeX, sizeY;

		// Check page X
		page = that.pagesX.length - 1;
		for (i=0, l=that.pagesX.length; i<l; i++) {
			if (x >= that.pagesX[i]) {
				page = i;
				break;
			}
		}
		if (page == that.currPageX && page > 0 && that.dirX < 0) page--;
		x = that.pagesX[page];
		sizeX = m.abs(x - that.pagesX[that.currPageX]);
		sizeX = sizeX ? m.abs(that.x - x) / sizeX * 500 : 0;
		that.currPageX = page;

		// Check page Y
		page = that.pagesY.length-1;
		for (i=0; i<page; i++) {
			if (y >= that.pagesY[i]) {
				page = i;
				break;
			}
		}
		if (page == that.currPageY && page > 0 && that.dirY < 0) page--;
		y = that.pagesY[page];
		sizeY = m.abs(y - that.pagesY[that.currPageY]);
		sizeY = sizeY ? m.abs(that.y - y) / sizeY * 500 : 0;
		that.currPageY = page;

		// Snap with constant speed (proportional duration)
		time = m.round(m.max(sizeX, sizeY)) || 200;

		return { x: x, y: y, time: time };
	},

	_bind: function (type, el, bubble) {
		(el || this.scroller).addEventListener(type, this, !!bubble);
	},

	_unbind: function (type, el, bubble) {
		(el || this.scroller).removeEventListener(type, this, !!bubble);
	},


	/**
	*
	* Public methods
	*
	*/
	destroy: function () {
		var that = this;

		that.scroller.style[transform] = '';

		// Remove the scrollbars
		that.hScrollbar = false;
		that.vScrollbar = false;
		that._scrollbar('h');
		that._scrollbar('v');

		// Remove the event listeners
		that._unbind(RESIZE_EV, window);
		that._unbind(START_EV);
		that._unbind(MOVE_EV);
		that._unbind(END_EV);
		that._unbind(CANCEL_EV);
		
		if (!that.options.hasTouch) {
			that._unbind('mouseout', that.wrapper);
			that._unbind(WHEEL_EV);
		}
		
		if (that.options.useTransition) that._unbind(TRNEND_EV);
		
		if (that.options.checkDOMChanges) clearInterval(that.checkDOMTime);
		
		if (that.options.onDestroy) that.options.onDestroy.call(that);
	},

	refresh: function () {
		var that = this,
			offset,
			i, l,
			els,
			pos = 0,
			page = 0;

		if (that.scale < that.options.zoomMin) that.scale = that.options.zoomMin;
		that.wrapperW = that.wrapper.clientWidth || 1;
		that.wrapperH = that.wrapper.clientHeight || 1;

		that.minScrollY = -that.options.topOffset || 0;
		that.scrollerW = m.round(that.scroller.offsetWidth * that.scale);
		that.scrollerH = m.round((that.scroller.offsetHeight + that.minScrollY) * that.scale);
		that.maxScrollX = that.wrapperW - that.scrollerW;
		that.maxScrollY = that.wrapperH - that.scrollerH + that.minScrollY;
		that.dirX = 0;
		that.dirY = 0;

		if (that.options.onRefresh) that.options.onRefresh.call(that);

		that.hScroll = that.options.hScroll && that.maxScrollX < 0;
		that.vScroll = that.options.vScroll && (!that.options.bounceLock && !that.hScroll || that.scrollerH > that.wrapperH);

		that.hScrollbar = that.hScroll && that.options.hScrollbar;
		that.vScrollbar = that.vScroll && that.options.vScrollbar && that.scrollerH > that.wrapperH;

		offset = that._offset(that.wrapper);
		that.wrapperOffsetLeft = -offset.left;
		that.wrapperOffsetTop = -offset.top;

		// Prepare snap
		if (typeof that.options.snap == 'string') {
			that.pagesX = [];
			that.pagesY = [];
			els = that.scroller.querySelectorAll(that.options.snap);
			for (i=0, l=els.length; i<l; i++) {
				pos = that._offset(els[i]);
				pos.left += that.wrapperOffsetLeft;
				pos.top += that.wrapperOffsetTop;
				that.pagesX[i] = pos.left < that.maxScrollX ? that.maxScrollX : pos.left * that.scale;
				that.pagesY[i] = pos.top < that.maxScrollY ? that.maxScrollY : pos.top * that.scale;
			}
		} else if (that.options.snap) {
			that.pagesX = [];
			while (pos >= that.maxScrollX) {
				that.pagesX[page] = pos;
				pos = pos - that.wrapperW;
				page++;
			}
			if (that.maxScrollX%that.wrapperW) that.pagesX[that.pagesX.length] = that.maxScrollX - that.pagesX[that.pagesX.length-1] + that.pagesX[that.pagesX.length-1];

			pos = 0;
			page = 0;
			that.pagesY = [];
			while (pos >= that.maxScrollY) {
				that.pagesY[page] = pos;
				pos = pos - that.wrapperH;
				page++;
			}
			if (that.maxScrollY%that.wrapperH) that.pagesY[that.pagesY.length] = that.maxScrollY - that.pagesY[that.pagesY.length-1] + that.pagesY[that.pagesY.length-1];
		}

		// Prepare the scrollbars
		that._scrollbar('h');
		that._scrollbar('v');

		if (!that.zoomed) {
			that.scroller.style[transitionDuration] = '0';
			that._resetPos(200);
		}
	},

	scrollTo: function (x, y, time, relative) {
		var that = this,
			step = x,
			i, l;

		that.stop();

		if (!step.length) step = [{ x: x, y: y, time: time, relative: relative }];
		
		for (i=0, l=step.length; i<l; i++) {
			if (step[i].relative) { step[i].x = that.x - step[i].x; step[i].y = that.y - step[i].y; }
			that.steps.push({ x: step[i].x, y: step[i].y, time: step[i].time || 0 });
		}

		that._startAni();
	},

	scrollToElement: function (el, time) {
		var that = this, pos;
		el = el.nodeType ? el : that.scroller.querySelector(el);
		if (!el) return;

		pos = that._offset(el);
		pos.left += that.wrapperOffsetLeft;
		pos.top += that.wrapperOffsetTop;

		pos.left = pos.left > 0 ? 0 : pos.left < that.maxScrollX ? that.maxScrollX : pos.left;
		pos.top = pos.top > that.minScrollY ? that.minScrollY : pos.top < that.maxScrollY ? that.maxScrollY : pos.top;
		time = time === undefined ? m.max(m.abs(pos.left)*2, m.abs(pos.top)*2) : time;

		that.scrollTo(pos.left, pos.top, time);
	},

	scrollToPage: function (pageX, pageY, time) {
		var that = this, x, y;
		
		time = time === undefined ? 400 : time;

		if (that.options.onScrollStart) that.options.onScrollStart.call(that);

		if (that.options.snap) {
			pageX = pageX == 'next' ? that.currPageX+1 : pageX == 'prev' ? that.currPageX-1 : pageX;
			pageY = pageY == 'next' ? that.currPageY+1 : pageY == 'prev' ? that.currPageY-1 : pageY;

			pageX = pageX < 0 ? 0 : pageX > that.pagesX.length-1 ? that.pagesX.length-1 : pageX;
			pageY = pageY < 0 ? 0 : pageY > that.pagesY.length-1 ? that.pagesY.length-1 : pageY;

			that.currPageX = pageX;
			that.currPageY = pageY;
			x = that.pagesX[pageX];
			y = that.pagesY[pageY];
		} else {
			x = -that.wrapperW * pageX;
			y = -that.wrapperH * pageY;
			if (x < that.maxScrollX) x = that.maxScrollX;
			if (y < that.maxScrollY) y = that.maxScrollY;
		}

		that.scrollTo(x, y, time);
	},

	disable: function () {
		this.stop();
		this._resetPos(0);
		this.enabled = false;

		// If disabled after touchstart we make sure that there are no left over events
		this._unbind(MOVE_EV);
		this._unbind(END_EV);
		this._unbind(CANCEL_EV);
	},
	
	enable: function () {
		this.enabled = true;
	},
	
	stop: function () {
		if (this.options.useTransition) this._unbind(TRNEND_EV);
		else cancelFrame(this.aniTime);
		this.steps = [];
		this.moved = false;
		this.animating = false;
	},
	
	zoom: function (x, y, scale, time) {
		var that = this,
			relScale = scale / that.scale;

		if (!that.options.useTransform) return;

		that.zoomed = true;
		time = time === undefined ? 200 : time;
		x = x - that.wrapperOffsetLeft - that.x;
		y = y - that.wrapperOffsetTop - that.y;
		that.x = x - x * relScale + that.x;
		that.y = y - y * relScale + that.y;

		that.scale = scale;
		that.refresh();

		that.x = that.x > 0 ? 0 : that.x < that.maxScrollX ? that.maxScrollX : that.x;
		that.y = that.y > that.minScrollY ? that.minScrollY : that.y < that.maxScrollY ? that.maxScrollY : that.y;

		that.scroller.style[transitionDuration] = time + 'ms';
		that.scroller.style[transform] = 'translate(' + that.x + 'px,' + that.y + 'px) scale(' + scale + ')' + translateZ;
		that.zoomed = false;
	},
	
	isReady: function () {
		return !this.moved && !this.zoomed && !this.animating;
	}
};

function prefixStyle (style) {
	if ( vendor === '' ) return style;

	style = style.charAt(0).toUpperCase() + style.substr(1);
	return vendor + style;
}

dummyStyle = null;	// for the sake of it

if (typeof exports !== 'undefined') exports.iScroll = iScroll;
else window.iScroll = iScroll;

})(window, document);;
$(document).bind("mobileinit", function () {
    $.mobile.ajaxEnabled = false;
    $.mobile.linkBindingEnabled = false;
    $.mobile.hashListeningEnabled = false;
    $.mobile.pushStateEnabled = false;

    // Remove page from DOM when it's being replaced
    $('div[data-role="page"]').live('pagehide', function (event, ui) {
        $(event.currentTarget).remove();
    });
});;
/*
 * Author: cargomedia.ch
 *
 * Binds 'touchstart' when binding $.on('click')
 * and triggers 'click' when 'touchend' happens without 'touchmove' inbetween.
 */
(function($) {
	if (!("ontouchstart" in window)) {
		return;
	}

	var clickbuster = {
		isLocked: false,
		delayedUnlock: null,
		onClick: function(event) {
			if (this.isLocked || !window.tapReady) {
				event.stopPropagation();
				event.preventDefault();
			}
		},
		lock: function() {
			this.isLocked = true;
			var clickbuster = this;
			this.delayedUnlock = setTimeout(function() {
				clickbuster.unlock();
			}, 2000);
		},
		unlock: function() {
			this.isLocked = false;
			if (this.delayedUnlock) {
				window.clearTimeout(this.delayedUnlock);
			}
		}
	};
	document.addEventListener('click', function(e) {
		clickbuster.onClick(e);
	}, true);





	$.event.special.click = {
		delegateType: "click",
		bindType: "click",
		setup: function(data, namespaces, eventHandle) {
			var element = this;
			var touchHandler = {
				moveThreshold: 20,  // in pixels
				handleEvent: function(e) {
					switch(e.type) {
						case 'touchstart': this.onTouchStart(e); break;
						case 'touchmove': this.onTouchMove(e); break;
						case 'touchend': this.onTouchEnd(e); break;
					}
				},
				onTouchStart: function(e) {
					e.stopPropagation();
					this.moved = false;
					this.startX = e.touches[0].clientX;
					this.startY = e.touches[0].clientY;
					element.addEventListener('touchmove', this, false);
					element.addEventListener('touchend', this, false);
				},
				onTouchMove: function(e) {
					if (Math.abs(e.touches[0].clientX - this.startX) > this.moveThreshold ||
							Math.abs(e.touches[0].clientY - this.startY) > this.moveThreshold) {
						this.moved = true;
					}
				},
				onTouchEnd: function(e) {
					element.removeEventListener('touchmove', this, false);
					element.removeEventListener('touchend', this, false);

					if (!this.moved) {
						clickbuster.unlock();

						var theEvent = document.createEvent('MouseEvents');
						theEvent.initEvent('click', true, true);
						e.target.dispatchEvent(theEvent);

						clickbuster.lock();

						e.stopPropagation();
					}
				}
			};

			element.addEventListener('touchstart', touchHandler, false);

			$(element).data('touchToClick-handler', touchHandler);

			return false;
		},
		teardown: function(namespaces) {
			var element = this;
			var touchHandler = $(element).data('touchToClick-handler');
			element.removeEventListener('touchstart', touchHandler, false);

			return false;
		}
	};
})(jQuery);
;
