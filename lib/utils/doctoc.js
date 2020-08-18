"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctoc = exports.executeDoctoc = exports.transformAndSave = void 0;
const github_action_helper_1 = require("@technote-space/github-action-helper");
const fs_1 = require("fs");
const fast_glob_1 = require("fast-glob");
const file_1 = __importDefault(require("doctoc/lib/file"));
const misc_1 = require("./misc");
const transform_1 = require("./transform");
exports.transformAndSave = (files, title) => {
    const transformed = files.map(file => transform_1.transformWithWrap(file.path, title));
    const changed = transformed.filter(item => item.transformed);
    const unchanged = transformed.filter(item => !item.transformed);
    changed.forEach(item => {
        fs_1.writeFileSync(item.path, item.data, 'utf8');
    });
    return { changed, unchanged };
};
const parsePaths = (paths) => fast_glob_1.sync(paths.map(path => misc_1.cleanPath(path)), {
    onlyFiles: false,
    caseSensitiveMatch: false,
    cwd: github_action_helper_1.Utils.getWorkspace(),
});
exports.executeDoctoc = (paths, title, logger) => parsePaths(paths).map(path => {
    const stat = fs_1.statSync(path);
    if (stat.isDirectory()) {
        logger.displayCommand('DocToccing "%s" and its sub directories.', path);
        return exports.transformAndSave(file_1.default.findMarkdownFiles(path), title);
    }
    logger.displayCommand('DocToccing single file "%s".', path);
    return exports.transformAndSave([{ path }], title);
}).reduce((acc, value) => ({
    changed: acc.changed.concat(value.changed.map(item => item.path)),
    unchanged: acc.unchanged.concat(value.unchanged.map(item => item.path)),
}), {
    changed: [],
    unchanged: [],
});
exports.doctoc = (paths, title, logger) => {
    return () => __awaiter(void 0, void 0, void 0, function* () {
        // process.cwd is not available in Worker threads.
        const cwd = process.cwd;
        process.cwd = () => github_action_helper_1.Utils.getWorkspace();
        const results = exports.executeDoctoc(paths, title, logger);
        process.cwd = cwd;
        return {
            command: 'Run doctoc',
            stdout: [
                'changed:',
                ...results.changed.map(item => `  - ${item}`),
                'unchanged:',
                ...results.unchanged.map(item => `  - ${item}`),
            ],
            stderr: [],
        };
    });
};
