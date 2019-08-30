"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const core_1 = require("@actions/core");
const constant_1 = require("../constant");
exports.isTargetEvent = (context) => isTargetRef(context) &&
    context.eventName in constant_1.TARGET_EVENTS &&
    (('string' === typeof context.payload.action && constant_1.TARGET_EVENTS[context.eventName] === context.payload.action) ||
        '*' === constant_1.TARGET_EVENTS[context.eventName]);
exports.getBuildVersion = (filepath) => {
    if (!fs_1.default.existsSync(filepath)) {
        return false;
    }
    const json = JSON.parse(fs_1.default.readFileSync(filepath, 'utf8'));
    if (json && 'tagName' in json) {
        return json['tagName'];
    }
    return false;
};
const getTargetPaths = () => [...new Set((core_1.getInput('TARGET_PATHS') || constant_1.DEFAULT_TARGET_PATHS).split(',').map(target => target.trim()).filter(target => target && !target.startsWith('/') && !target.includes('..')))];
exports.getDocTocArgs = () => {
    const workDir = exports.getWorkDir();
    return getTargetPaths().map(item => path_1.default.resolve(workDir, item)).join(' ');
};
const getWorkspace = () => process.env.GITHUB_WORKSPACE || '';
exports.getWorkDir = () => path_1.default.resolve(getWorkspace(), '.work');
exports.getGitUrl = (context) => `https://github.com/${context.repo.owner}/${context.repo.repo}.git`;
exports.getRef = (context) => context.ref;
exports.getRefForUpdate = (context) => exports.getRef(context).replace(/^refs\//, '');
const isTargetRef = (context) => /^refs\/heads\//.test(exports.getRef(context));
exports.getBranch = (context) => exports.getRef(context).replace(/^refs\/heads\//, '');
exports.getCommitMessage = () => core_1.getInput('COMMIT_MESSAGE') || constant_1.DEFAULT_COMMIT_MESSAGE;
