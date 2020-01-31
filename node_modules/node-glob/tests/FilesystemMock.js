/*jshint node:true*//*globals*/
"use strict";
var Buffer = require("buffer").Buffer;

module.exports = function FilesystemMock() {
  var self = this;

  this._readFileResults = null;
  this.readFile = function (path, callback) {
    setImmediate(function () {
      if (self._readFileResults && self._readFileResults[path] !== undefined) {
        return callback(null, new Buffer(self._readFileResults[path], "utf8"));
      }
      return callback(new Error("Mock 'readFile' not configured for '" + path + "'"));
    });
  };

  this.$readdir = null;
  this.readdir = function (path, callback) {
    (self.readdir.args = (self.readdir.args || [])).push(arguments);
    (function (args) {
      return setImmediate(function () {
        if (self.$readdir) {
          return self.$readdir.apply(self, args);
        }
        return callback(new Error("Mock 'readdir' not configured"));
      });
    }(arguments));
  };

  this.$stat = null;
  this.stat = function (path, callback) {
    (self.stat.args = (self.stat.args || [])).push(arguments);
    (function (args) {
      return setImmediate(function () {
        if (self.$stat) {
          return self.$stat.apply(self, args);
        }
        return callback(new Error("Mock 'stat' is not configured"));
      });
    }(arguments));
  };

  this.$lstat = null;
  this.lstat = function (path, callback) {
    (self.lstat.args = (self.lstat.args || [])).push(arguments);
    (function (args) {
      return setImmediate(function () {
        if (self.$lstat) {
          return self.$lstat.apply(self, args);
        }
        return callback(new Error("Mock 'lstat' is not configured"));
      });
    }(arguments));
  };
  
};
