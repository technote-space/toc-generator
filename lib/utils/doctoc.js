"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctoc = exports.executeDoctoc = exports.transformAndSave = void 0;
const github_action_helper_1 = require("@technote-space/github-action-helper");
const fs_1 = require("fs");
const fast_glob_1 = require("fast-glob");
const doctoc_1 = require("@technote-space/doctoc");
const misc_1 = require("./misc");
const transform_1 = require("./transform");
const transformAndSave = (files, title) => {
    const transformed = files.map(file => (0, transform_1.transformWithWrap)(file.path, title));
    const changed = transformed.filter(item => item.transformed);
    const unchanged = transformed.filter(item => !item.transformed);
    changed.forEach(item => {
        (0, fs_1.writeFileSync)(item.path, item.data, 'utf8');
    });
    return { changed, unchanged };
};
exports.transformAndSave = transformAndSave;
const parsePaths = (paths) => (0, fast_glob_1.sync)(paths.map(path => (0, misc_1.cleanPath)(path)), {
    onlyFiles: false,
    caseSensitiveMatch: false,
    cwd: github_action_helper_1.Utils.getWorkspace(),
});
const executeDoctoc = (paths, title, logger) => parsePaths(paths).map(path => {
    const stat = (0, fs_1.statSync)(path);
    if (stat.isDirectory()) {
        logger.displayCommand('DocToccing "%s" and its sub directories.', path);
        return (0, exports.transformAndSave)((0, doctoc_1.findMarkdownFiles)(path), title);
    }
    logger.displayCommand('DocToccing single file "%s".', path);
    return (0, exports.transformAndSave)([{ path }], title);
}).reduce((acc, value) => ({
    changed: acc.changed.concat(value.changed.map(item => item.path)),
    unchanged: acc.unchanged.concat(value.unchanged.map(item => item.path)),
}), {
    changed: [],
    unchanged: [],
});
exports.executeDoctoc = executeDoctoc;
const doctoc = (paths, title, logger) => {
    return async () => {
        // process.cwd is not available in Worker threads.
        const cwd = process.cwd;
        process.cwd = () => github_action_helper_1.Utils.getWorkspace();
        const results = (0, exports.executeDoctoc)(paths, title, logger);
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
    };
};
exports.doctoc = doctoc;
