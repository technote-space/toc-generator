/*jshint node:true*//*globals describe, it*/
"use strict";
var assert = require('chai').assert;
var FilesystemMock = require("./FilesystemMock");

describe("Finder", function () {

  var Finder = require("../index").Finder;

  it("must be instantiable", function () {
    var finder = new Finder();
    assert.instanceOf(finder, Finder, "Expected an instanceof Finder");
  });

  it("must throw errors when required arguments are missing", function () {
    var finder = new Finder();
    assert.throw(function () {
      finder.find();
    }, "Argument 'path' is required");
  });

  it("must be able to find all files using only a done callback", function (done) {
    var fs = new FilesystemMock();
    fs.$readdir = function (path, cb) { cb(null, ["a", "b", "c"]); };
    fs.$lstat = function (path, cb) { cb(null, { isFile: function () { return true; } }); };
    var finder = new Finder(fs);
    return finder.find("./test", function (err, results) {
      assert.ifError(err);
      assert.isNotNull(results, "Expected results when not having a found handler");
      assert.equal(results.length, 3, "Expected 3 results on done event");
      done();
    });
  });

  it("must be able to find all files using a found callback", function (done) {
    var fs = new FilesystemMock();
    fs.$readdir = function (path, cb) { cb(null, ["a", "b", "c"]); };
    fs.$lstat = function (path, cb) { cb(null, { isFile: function () { return true; } }); };
    var finder = new Finder(fs);
    var foundResults = [];
    return finder.find("./test", function (result) {
      assert.isNotNull(result, "Expected results when not having a found handler");
      assert.equal(result.path, "./test", "Expected a result with correct path");
      assert.equal(result.type, "file", "Expected a result with correct type");
      foundResults.push(result);
    }, function (err, results) {
      assert.ifError(err);
      assert.isNull(results, "Expected no results when having a found handler");
      assert.equal(foundResults.length, 3, "Expected 3 results");
      done();
    });
  });

  it("must be able to find all files using an event emitter", function (done) {
    var fs = new FilesystemMock();
    fs.$readdir = function (path, cb) { cb(null, ["a", "b", "c"]); };
    fs.$lstat = function (path, cb) { cb(null, { isFile: function () { return true; } }); };
    var finder = new Finder(fs);
    var foundResults = [];
    finder.find("./test")
      .on("found", function (obj, e) {
        foundResults.push(obj);
      })
      .on("error", function (err) {
        assert.ifError(err);
      })
      .on("done", function (results) {
        assert.isNull(results, "Didn't expect results having a found handler");
        //console.log("results", results, foundResults);
        assert.equal(foundResults.length, 3, "Expected 3 results");
        done();
      });
  });

  it("must be able to find all files in all directories using an event emitter", function (done) {
    var fs = new FilesystemMock();
    var finder = new Finder(fs);
    var foundResults = [];

    fs.$readdir = function (path, cb) { cb(null, path === "test" && ["a"] || ["c", "d", "e"]); };
    fs.$lstat = function (path, callback) {
      if (path === "test/a") {
        return callback(null, {
          isFile: function () { return false; },
          isDirectory: function () { return true; }
        });
      } else {
        return callback(null, {
          isFile: function () { return true; }
        });
      }
    };

    finder.find("./test")
      .on("found", function (obj, e) {
        foundResults.push(obj);
      })
      .on("error", function (err) {
        assert.ifError(err);
      })
      .on("done", function (results) {
        assert.isNull(results, "Didn't expect results having a found handler");
        assert.equal(foundResults.length, 3, "Expected 3 results");
        done();
      });
  });

  it("must be able to cancel finding using the found eventArgs", function (done) {
    var fs = new FilesystemMock();
    fs.$readdir = function (path, cb) { cb(null, ["a", "b", "c"]); };
    fs.$lstat = function (path, cb) { cb(null, { isFile: function () { return true; } }); };
    var finder = new Finder(fs);
    var foundResults = [];
    finder.find("./test")
      .on("found", function (obj, e) {
        foundResults.push(obj);
        e.cancel();
      })
      .on("error", function (err) {
        assert.ifError(err);
      })
      .on("done", function (results) {
        assert.isNull(results, "Didn't expect results having a found handler");
        assert.equal(foundResults.length, 1, "Expect only one file");
        done();
      });
  });

  it("must be able to find all files using an event emitter", function (done) {
    var fs = new FilesystemMock();
    fs.$readdir = function (path, cb) { cb(null, ["a", "b", "c"]); };
    fs.$lstat = function (path, cb) { cb(null, { isFile: function () { return true; } }); };
    var finder = new Finder(fs);
    finder.find("./test")
      .on("error", function (err) {
        assert.ifError(err);
      })
      .on("done", function (results) {
        assert.isNotNull(results, "Expected results when not having a found handler");
        assert.equal(results.length, 3, "Expected 3 results on done event");
        done();
      });
  });

  it("must be able to find all files matching a pattern", function (done) {
    var fs = new FilesystemMock();
    fs.$readdir =
      function (path, cb) { cb(null, ["module.json", "test.json", "module.test", "moduletest", "modulejson", "testmodule.json", "testmodule.jsontest", "module.jsontest"]); };
    fs.$lstat = function (path, cb) { cb(null, { isFile: function () { return true; } }); };

    var finder = new Finder(fs);
    finder.find("./test", "module.json")
      .on("error", function (err) {
        assert.ifError(err);
      })
      .on("done", function (results) {
        assert.isNotNull(results, "Expected results when not having a found handler");
        assert.equal(results.length, 1, "Expected 1 results on done event");
        assert.equal(results[0].name, "module.json", "Expected another filename");
        done();
      });
  });

  it("must be able to find all files matching a pattern even in subdirs using an event emitter", function (done) {
    var fs = new FilesystemMock();
    fs.$readdir =
      function (path, cb) {
        if (path === "./test") {
          return cb(null, ["module.json", "dir"]);
        } else if (path === "test/dir") {
          return cb(null, ["module.json"]);
        } else {
          throw new Error("Unknown path " + path);
        }
      };
    fs.$lstat = function (path, cb) {
      cb(null, {
        isFile: function () { return path !== "test/dir"; },
        isDirectory: function () { return path === "test/dir"; }
      });
    };

    var finder = new Finder(fs);
    finder.find("./test", "module.json")
      .on("error", function (err) {
        assert.ifError(err);
      })
      .on("done", function (results) {
        assert.isNotNull(results, "Expected results when not having a found handler");
        assert.equal(results.length, 2, "Expected 1 results on done event");
        assert.equal(results[0].name, "module.json", "Expected another filename");
        assert.equal(results[1].name, "module.json", "Expected another filename");
        done();
      });
  });

  it("must be able to find all files matching a pattern even in subdirs using a callback", function (done) {
    var fs = new FilesystemMock();
    fs.$readdir =
      function (path, cb) {
        if (path === "./test") {
          return cb(null, ["1.json", "dir"]);
        } else if (path === "test/dir") {
          return cb(null, ["2.json"]);
        } else {
          throw new Error("Unknown path " + path);
        }
      };
    fs.$lstat = function (path, cb) {
      cb(null, {
        isFile: function () { return path !== "test/dir"; },
        isDirectory: function () { return path === "test/dir"; }
      });
    };

    var finder = new Finder(fs);
    finder.find("./test", "*.json", function (err, results) {
      assert.ifError(err);
      assert.isNotNull(results, "Expected results when not having a found handler");
      assert.equal(results.length, 2, "Expected 1 results on done event");
      assert.equal(results[0].name, "1.json", "Expected another filename");
      assert.equal(results[1].name, "2.json", "Expected another filename");
      done();
    });
  });

  it("must be able to find a directory by name using a callback", function (done) {
    var fs = new FilesystemMock();
    fs.$readdir = function (path, cb) {
      if (path === ".") {
        return cb(null, ["1.json", "2.json", "dirs", "dir"]);
      } else if (path === "dir") {
        return cb(null, ["1.json", "2.json", "dirs", "dir"]);
      } else if (path === "dir/dir") {
        return cb(null, ["2.json"]);
      } else {
        throw new Error("Unknown path " + path);
      }
    };
    fs.$lstat = function (path, cb) {
      cb(null, {
        isFile: function () { return !path.match(/dir$/); },
        isDirectory: function () { return !!path.match(/dir$/); }
      });
    };

    var finder = new Finder(fs);
    finder.find(".", Finder.types.Directory, function (err, results) {
      assert.ifError(err);
      assert.isNotNull(results, "Expected results");
      assert.equal(results.length, 2, "Expected 1 result");
      assert.equal(results[0].name, "dir", "Expected another directory name");
      assert.equal(results[1].name, "dir", "Expected another directory name");
      assert.instanceOf(results[0], Finder.types.Directory, "Expected a directory");
      assert.instanceOf(results[1], Finder.types.Directory, "Expected a directory");
      done();
    });
  });

  it("must be able to find a directory by name using a event emitter", function (done) {
    var fs = new FilesystemMock();
    fs.$readdir = function (path, cb) {
      if (path === ".") {
        return cb(null, ["1.json", "2.json", "dirs", "dir"]);
      } else if (path === "dir") {
        return cb(null, ["1.json", "2.json", "dirs", "dir"]);
      } else if (path === "dir/dir") {
        return cb(null, ["2.json"]);
      } else {
        throw new Error("Unknown path " + path);
      }
    };
    fs.$lstat = function (path, cb) {
      cb(null, {
        isFile: function () { return !path.match(/dir$/); },
        isDirectory: function () { return !!path.match(/dir$/); }
      });
    };

    var finder = new Finder(fs);
    finder.find(".", Finder.types.Directory)
      .on("error", function (err) {
        assert.ifError(err);
      })
      .on("done", function (results) {
        assert.isNotNull(results, "Expected results");
        assert.equal(results.length, 2, "Expected 1 result");
        assert.equal(results[0].name, "dir", "Expected another directory name");
        assert.equal(results[1].name, "dir", "Expected another directory name");
        assert.instanceOf(results[0], Finder.types.Directory, "Expected a directory");
        assert.instanceOf(results[1], Finder.types.Directory, "Expected a directory");
        done();
      });
  });

  it("must be able to wait between found results and even cancel async", function (done) {
    var fs = new FilesystemMock();
    fs.$readdir = function (path, cb) {
      if (path === ".") {
        return cb(null, ["1.json", "2.json", "dirs", "dir"]);
      } else if (path === "dir") {
        return cb(null, ["1.json", "2.json", "dirs", "dir"]);
      } else if (path === "dir/dir") {
        return cb(null, ["2.json"]);
      } else {
        throw new Error("Unknown path " + path);
      }
    };
    fs.$lstat = function (path, cb) {
      cb(null, {
        isFile: function () { return !path.match(/dir$/); },
        isDirectory: function () { return !!path.match(/dir$/); }
      });
    };

    var finder = new Finder(fs);
    var itemsFound = 0;
    finder.find(".", Finder.types.Directory)
      .on("error", function (err) {
        assert.ifError(err);
      })
      .on("found", function (result, e) {
        itemsFound += 1;
        var done = e.wait();
        setTimeout(function () {
          assert.isNotNull(result, "Expected results");
          assert.equal(result.name, "dir", "Expected another directory name");
          e.cancel();
          return done();
        }, 500);
      })
      .on("done", function () {
        assert.equal(itemsFound, 1, "Expected only one item to be processed");
        done();
      });
  });

});

describe("Directory", function () {
  var Finder = require("../index").Finder;

  it("must be able to open a file", function (done) {
    var fs = new FilesystemMock();
    fs.$lstat = function (path, cb) {
      cb(null, {
        isFile: function () { return true; }
      });
    };
    var dir = new Finder.types.Directory(fs, "Test");
    dir.getFile("dummy.json", function (err, file) {
      assert.ifError(err);
      assert.isDefined(file, "Expected a file to be returned");
      assert.instanceOf(file, Finder.types.File, "Expected the file to be of type 'File'");
      done();
    });
  });

});
