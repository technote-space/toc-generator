"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const github_action_pr_helper_1 = require("@technote-space/github-action-pr-helper");
const core_1 = require("@actions/core");
const constant_1 = require("../constant");
const constant_2 = require("../constant");
const { getWorkspace, getArrayInput, replaceAll } = github_action_pr_helper_1.Utils;
exports.replaceDirectory = (message) => {
    const workDir = path_1.default.resolve(getWorkspace());
    return [
        { key: ` -C ${workDir}`, value: '' },
        { key: workDir, value: '[Working Directory]' },
    ].reduce((value, target) => replaceAll(value, target.key, target.value), message);
};
const getTargetPaths = () => getArrayInput('TARGET_PATHS', true).filter(target => target && !target.startsWith('/') && !target.includes('..'));
const getTocTitle = () => core_1.getInput('TOC_TITLE');
exports.getDocTocArgs = () => {
    const paths = getTargetPaths();
    if (!paths.length) {
        return false;
    }
    const workDir = getWorkspace();
    const title = getTocTitle().replace('\'', '\\\'').replace('"', '\\"');
    return getTargetPaths().map(item => path_1.default.resolve(workDir, item)).join(' ') + (title ? ` --title '${title}'` : ' --notitle');
};
const getExecuteCommands = (logger) => {
    const args = exports.getDocTocArgs();
    if (false === args) {
        logger.warn('There is no valid target. Please check if [TARGET_PATHS] is set correctly.');
        return [];
    }
    return [
        `npx doctoc ${args} --github`,
    ];
};
exports.getRunnerArguments = () => {
    const logger = new github_action_pr_helper_1.Logger(exports.replaceDirectory);
    return {
        rootDir: path_1.default.resolve(__dirname, '../..'),
        logger: logger,
        actionName: constant_1.ACTION_NAME,
        actionOwner: constant_1.ACTION_OWNER,
        actionRepo: constant_1.ACTION_REPO,
        executeCommands: getExecuteCommands(logger),
        commitMessage: core_1.getInput('COMMIT_MESSAGE'),
        commitName: core_1.getInput('COMMIT_NAME'),
        commitEmail: core_1.getInput('COMMIT_EMAIL'),
        prBranchPrefix: core_1.getInput('PR_BRANCH_PREFIX'),
        prBranchName: core_1.getInput('PR_BRANCH_NAME'),
        prTitle: core_1.getInput('PR_TITLE'),
        prBody: core_1.getInput('PR_BODY'),
        prBranchPrefixForDefaultBranch: core_1.getInput('PR_DEFAULT_BRANCH_PREFIX'),
        prBranchNameForDefaultBranch: core_1.getInput('PR_DEFAULT_BRANCH_NAME'),
        prTitleForDefaultBranch: core_1.getInput('PR_DEFAULT_BRANCH_TITLE'),
        prBodyForDefaultBranch: core_1.getInput('PR_DEFAULT_BRANCH_BODY'),
        prBodyForComment: core_1.getInput('PR_COMMENT_BODY'),
        prCloseMessage: core_1.getInput('PR_CLOSE_MESSAGE'),
        filterGitStatus: 'M',
        filterExtensions: ['md'],
        targetBranchPrefix: core_1.getInput('TARGET_BRANCH_PREFIX'),
        includeLabels: getArrayInput('INCLUDE_LABELS'),
        targetEvents: constant_2.TARGET_EVENTS,
    };
};
