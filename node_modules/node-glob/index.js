/**!
 * Copyright (c) 2016, Crafity
 All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright notice, this
 list of conditions and the following disclaimer.

 * Redistributions in binary form must reproduce the above copyright notice,
 this list of conditions and the following disclaimer in the documentation
 and/or other materials provided with the distribution.

 * Neither the name of node-glob nor the names of its
 contributors may be used to endorse or promote products derived from
 this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/*jshint node:true*/
"use strict";

var EventEmitter = require("events").EventEmitter;
var fs = require("fs");
var pathUtil = require("path");
var globToRegExp = require("glob-to-regexp");
var async = require('async');

function Finder(fs) { this._fs = fs || this._fs; }
Finder.prototype.__proto__ = EventEmitter.prototype;
Finder.prototype._fs = fs;

Finder.prototype.find = function (path, pattern, type, foundCallback, doneCallback) {
  var self = this;

  if (!path) {
    throw new Error("Argument 'path' is required");
  }
  if (!doneCallback && !foundCallback && !type && (pattern instanceof Function && !pattern.isFoundObject)) {
    doneCallback = pattern;
    foundCallback = null;
    pattern = null;
  }
  if (!doneCallback && !foundCallback && !type && (pattern instanceof Function && pattern.isFoundObject)) {
    type = pattern;
    pattern = null;
  }
  if (!doneCallback && !foundCallback && (pattern instanceof Function && pattern.isFoundObject) && (type instanceof Function && !type.isFoundObject)) {
    doneCallback = type;
    type = pattern;
    pattern = null;
  }
  if (!doneCallback && !foundCallback && (type instanceof Function && !type.isFoundObject) && pattern instanceof Function) {
    doneCallback = type;
    foundCallback = pattern;
    pattern = null;
    type = null;
  }
  if (!doneCallback && foundCallback instanceof Function && (type instanceof Function && !type.isFoundObject) && typeof pattern === "string") {
    doneCallback = foundCallback;
    foundCallback = type;
    type = null;
  }
  if (!doneCallback && !foundCallback && (type instanceof Function && !type.isFoundObject) && typeof pattern === "string") {
    doneCallback = type;
    type = null;
  }
  if (!doneCallback && foundCallback instanceof Function && (type && type.isFoundObject) && typeof pattern === "string") {
    doneCallback = foundCallback;
    foundCallback = null;
  }
  var patternRegExp = null;
  if (pattern) {
    patternRegExp = globToRegExp(pattern);
  }

  //console.log("args", {
  //  path: path, pattern: pattern, type:type, foundCallback:foundCallback, doneCallback:doneCallback
  //});

  function ondone(modules) {
    self.removeListener("error", onerror);
    if (foundCallback) { self.removeListener("found", foundCallback); }
    return doneCallback(null, modules);
  }

  function onerror(err) {
    self.removeListener("done", ondone);
    if (foundCallback) { self.removeListener("found", foundCallback); }
    return doneCallback(err);
  }

  if (doneCallback) {
    self.once("done", ondone);
    self.once("error", onerror);
  }
  if (foundCallback) {
    self.on("found", foundCallback);
  }

  function createFilesystemObject(path, obj, callback) {
    self._fs.lstat(pathUtil.join(path, obj), function (err, stat) {
      if (err) {
        return callback(err);
      } else if (stat.isFile()) {
        return callback(null, new File(self._fs, path, obj));
      } else if (stat.isDirectory()) {
        return callback(null, new Directory(self._fs, path, obj));
      } else if (stat.isSymbolicLink()) {
        return callback(null, new Symlink(path, obj));
      } else {
        return callback(null, new Unknown(path, obj));
      }
    });
  }

  setImmediate(function () {
    var hasFoundHandler = self.listeners("found").length > 0;
    var results = [];

    (function find(path, callback) {
      try {
        self._fs.readdir(path, function (err, objects) {
          if (err) { return self.emit("error", err); }

          async.eachSeries(objects, function (obj, done) {
            createFilesystemObject(path, obj, function (err, filesystemObject) {
              if (err) { return done(err); }
              var cancelEventArgs = new CancelEventArgs();

              if (filesystemObject instanceof Directory) {
                if ((!patternRegExp || (patternRegExp && patternRegExp.test(obj))) &&
                  (!type || (type && filesystemObject instanceof type))) {

                  if (!hasFoundHandler) {
                    results.push(filesystemObject);
                  } else {
                    self.emit("found", filesystemObject, cancelEventArgs);
                    return cancelEventArgs.isReady(function () {
                      if (cancelEventArgs.isCanceled()) {
                        return done(new CancelError());
                      }
                      return find(pathUtil.join(path, filesystemObject.name), done);
                    });
                  }
                }
                return find(pathUtil.join(path, filesystemObject.name), done);
              } else {
                if ((patternRegExp && !patternRegExp.test(obj)) ||
                  (type && !(filesystemObject instanceof type))) {
                  return done();
                }
                if (!hasFoundHandler) {
                  results.push(filesystemObject);
                } else {
                  self.emit("found", filesystemObject, cancelEventArgs);
                  return cancelEventArgs.isReady(function () {
                    if (cancelEventArgs.isCanceled()) {
                      return done(new CancelError());
                    }
                    return done();
                  });
                }
                return done();
              }
            });
          }, function (err) {
            if (err instanceof CancelError) { return callback(); }
            if (err) { return callback(err); }
            return callback();
          });
        });
      } catch (err) {
        return callback(err);
      }
    }(path, function done(err) {
      if (err) { return self.emit("error", err); }
      return self.emit("done", !hasFoundHandler && results || null);
    }));
  });
  return self;
};
module.exports = Finder;
module.exports.Finder = Finder;

function CancelEventArgs() {
  this._cancel = false;
  this._readyCallbacks = [];
  this._isWaiting = false;
}
CancelEventArgs.prototype.isCanceled = function () { return !!this._cancel; };
CancelEventArgs.prototype.cancel = function () { this._cancel = true; };
CancelEventArgs.prototype.isReady = function (callback) {
  if (!this._isWaiting) {
    setImmediate(callback);
  } else {
    this._readyCallbacks.push(callback);
  }
};
CancelEventArgs.prototype.wait = function () {
  var self = this;
  this._isWaiting = true;
  return function done() {
    self._isWaiting = false;
    var callback;
    while ((callback = self._readyCallbacks.shift())) {
      setImmediate(callback);
    }
  };
};
function CancelError() {}
CancelError.prototype = new Error();

function FoundObject() {
  this.args = function (path, name) {
    if (!path) {
      throw new Error("Argument 'path' is required");
    }
    if (!name) {
      this.name = pathUtil.basename(path);
      this.path = pathUtil.dirname(path);
    } else {
      this.name = name;
      this.path = path;
    }
    this.fullpath = pathUtil.join(this.path, this.name);
  };
  this.type = "unknown";
}
FoundObject.prototype.toString = function () {
  return this.name;
};

function Directory(fs, path, name) {
  if (fs && typeof fs === "string" && path && !name) {
    name = path;
    path = fs;
    fs = null;
  }
  if (fs && typeof fs === "string" && !path && !name) {
    path = fs;
    fs = null;
  }
  this.args(path, name);
  if (fs) { this._fs = fs; }
  this.type = "directory";
}
Directory.isFoundObject = true;
Directory.prototype = new FoundObject();
Directory.prototype.getFile = function (name, callback) {
  if (!name) {
    throw new Error("Argument 'name' is required");
  }
  if (!callback) {
    throw new Error("Argument 'callback' is required");
  }

  var self = this;
  var filepath = pathUtil.join(self.fullpath, name);
  this._fs.lstat(filepath, function (err, stat) {
    if (err) { return callback(err); }
    if (stat.isFile()) {
      return callback(null, new File(self._fs, filepath));
    } else {
      return callback("Object at '" + filepath + "' is not a file");
    }
  });
  setImmediate(function () {

  });
};

function File(fs, path, name) {
  if (fs && typeof fs === "string" && path && !name) {
    name = path;
    path = fs;
    fs = null;
  }
  if (fs && typeof fs === "string" && !path && !name) {
    path = fs;
    fs = null;
  }
  this.args(path, name);
  if (fs) { this._fs = fs; }
  this.type = "file";
}
File.isFoundObject = true;
File.prototype = new FoundObject();
File.prototype.read = function (callback) {
  var self = this;
  this._fs.readFile(self.fullpath, function (err, buffer) {
    if (err && callback) { return callback(err); }
    self.content = buffer;
    if (callback) { return callback(null, self.content); }
  });
};

File.prototype._fs = fs;

function Symlink(path, name) {
  this.args(path, name);
  this.type = "symlink";
}
Symlink.isFoundObject = true;
Symlink.prototype = new FoundObject();

function Unknown(path, name) {
  this.args(path, name);
  this.type = "unknown";
}
Unknown.isFoundObject = true;
Unknown.prototype = new FoundObject();

var types = {
  Unknown: Unknown,
  Directory: Directory,
  File: File,
  Symlink: Symlink
};
FoundObject.prototype.types = types;

module.exports.types = types;
module.exports.Finder.types = types;
