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
const github_action_helper_1 = require("@technote-space/github-action-helper");
const fs_1 = require("fs");
const glob_1 = require("glob");
const file_1 = __importDefault(require("doctoc/lib/file"));
const misc_1 = require("./misc");
const transform_1 = require("./transform");
exports.transformAndSave = (files, title, logger) => {
    const transformed = files.map(file => transform_1.transformWithWrap(file.path, title));
    const changed = transformed.filter(item => item.transformed);
    const unchanged = transformed.filter(item => !item.transformed);
    unchanged.forEach(item => logger.info('"%s" is up to date', item.path));
    changed.forEach(item => {
        logger.info('"%s" will be updated', item.path);
        fs_1.writeFileSync(item.path, item.data, 'utf8');
    });
    return { changed, unchanged };
};
const parsePaths = (paths) => {
    console.log(paths);
    github_action_helper_1.Utils.uniqueArray(paths.reduce((acc, path) => {
        console.log(path);
        console.log(misc_1.cleanPath(path));
        console.log(process.cwd());
        return acc.concat(glob_1.sync(misc_1.cleanPath(path), { baseNameMatch: true })); 
    }, []));
}
exports.executeDoctoc = (paths, title, logger) => parsePaths(paths).map(path => {
    console.log(title);
    console.log(paths);
    console.log(path);
    const stat = fs_1.statSync(path);
    if (stat.isDirectory()) {
        logger.startProcess('DocToccing "%s" and its sub directories for github.com.', path);
        return exports.transformAndSave(file_1.default.findMarkdownFiles(path), title, logger);
    }
    logger.startProcess('DocToccing single file "%s" for github.com.', path);
    return exports.transformAndSave([{ path }], title, logger);
}).reduce((acc, value) => ({
    changed: acc.changed.concat(value.changed.map(item => item.path)),
    unchanged: acc.unchanged.concat(value.unchanged.map(item => item.path)),
}), {
    changed: [],
    unchanged: [],
});
exports.doctoc = (paths, title, logger) => {
    console.log(paths);
    return () => __awaiter(void 0, void 0, void 0, function* () {
        const results = exports.executeDoctoc(paths, title, logger);
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
