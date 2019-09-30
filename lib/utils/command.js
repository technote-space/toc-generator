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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const github_action_helper_1 = require("@technote-space/github-action-helper");
const misc_1 = require("./misc");
const { getBranch, getWorkspace } = github_action_helper_1.Utils;
exports.replaceDirectory = (message) => {
    const workDir = path_1.default.resolve(getWorkspace());
    return message
        .replace(` -C ${workDir}/.work`, '')
        .replace(` -C ${workDir}`, '')
        .replace(`${workDir}/.work`, '<Working Directory>')
        .replace(workDir, '<Working Directory>');
};
const logger = new github_action_helper_1.Logger(exports.replaceDirectory);
const { startProcess, warn } = logger;
const helper = new github_action_helper_1.GitHelper(logger, { filter: (line) => /^M\s+/.test(line) && /\.md$/i.test(line) });
exports.clone = (context) => __awaiter(void 0, void 0, void 0, function* () {
    const branch = getBranch(context);
    const workDir = misc_1.getWorkDir();
    startProcess('Cloning the branch %s from the remote repo...', branch);
    yield helper.clone(workDir, branch, context);
    if ((yield helper.getCurrentBranchName(workDir)) !== branch) {
        warn('remote branch [%s] not found', branch);
        return false;
    }
    return true;
});
exports.runDocToc = () => __awaiter(void 0, void 0, void 0, function* () {
    const args = misc_1.getDocTocArgs();
    if (false === args) {
        warn('There is no valid target. Please check if [TARGET_PATHS] is set correctly.');
        return false;
    }
    startProcess('Running Doctoc...');
    yield helper.runCommand(misc_1.getWorkDir(), [
        'rm -f package.json',
        'rm -f package-lock.json',
        'rm -f yarn.lock',
        'yarn add doctoc',
        `node_modules/.bin/doctoc ${args} --github`,
    ]);
    return true;
});
exports.commit = () => __awaiter(void 0, void 0, void 0, function* () {
    startProcess('Committing...');
    yield helper.runCommand(misc_1.getWorkDir(), [
        'git add --all',
    ]);
});
exports.getDiff = () => __awaiter(void 0, void 0, void 0, function* () {
    startProcess('Checking diff...');
    return yield helper.getDiff(misc_1.getWorkDir());
});
exports.getChangedFiles = (context) => __awaiter(void 0, void 0, void 0, function* () {
    startProcess('Running DocToc and getting changed files');
    const workDir = misc_1.getWorkDir();
    fs_1.default.mkdirSync(workDir, { recursive: true });
    if (!misc_1.isCloned()) {
        if (!(yield exports.clone(context))) {
            return false;
        }
    }
    if (!(yield exports.runDocToc())) {
        return false;
    }
    yield exports.commit();
    return exports.getDiff();
});
