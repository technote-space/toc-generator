"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const github_action_helper_1 = require("@technote-space/github-action-helper");
const core_1 = require("@actions/core");
const constant_1 = require("../constant");
const { getWorkspace, getArrayInput } = github_action_helper_1.Utils;
const getTargetPaths = () => {
    const paths = getArrayInput('TARGET_PATHS');
    if (!paths.length) {
        return [constant_1.DEFAULT_TARGET_PATHS];
    }
    return paths.filter(target => target && !target.startsWith('/') && !target.includes('..'));
};
exports.isCloned = () => fs_1.default.existsSync(path_1.default.resolve(getWorkspace(), '.git'));
exports.getWorkDir = () => exports.isCloned() ? path_1.default.resolve(getWorkspace()) : path_1.default.resolve(getWorkspace(), '.work');
const getTocTitle = () => core_1.getInput('TOC_TITLE') || '';
exports.getDocTocArgs = () => {
    const paths = getTargetPaths();
    if (!paths.length) {
        return false;
    }
    const workDir = exports.getWorkDir();
    const title = getTocTitle().replace('\'', '\\\'').replace('"', '\\"');
    return getTargetPaths().map(item => path_1.default.resolve(workDir, item)).join(' ') + (title ? ` --title '${title}'` : ' --notitle');
};
exports.getCommitMessage = () => core_1.getInput('COMMIT_MESSAGE') || constant_1.DEFAULT_COMMIT_MESSAGE;
