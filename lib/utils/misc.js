"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const os_1 = require("os");
const github_action_helper_1 = require("@technote-space/github-action-helper");
const core_1 = require("@actions/core");
const doctoc_1 = require("./doctoc");
const constant_1 = require("../constant");
exports.replaceDirectory = (message) => {
    const workDir = path_1.resolve(github_action_helper_1.Utils.getWorkspace());
    return [
        { key: ` -C ${workDir}`, value: '' },
        { key: workDir, value: '[Working Directory]' },
    ].reduce((value, target) => github_action_helper_1.Utils.replaceAll(value, target.key, target.value), message);
};
const getTargetPaths = () => github_action_helper_1.Utils.getArrayInput('TARGET_PATHS', true).filter(target => target && !target.startsWith('/') && !target.includes('..'));
const getTocTitle = () => core_1.getInput('TOC_TITLE');
exports.isNoTitle = (title) => '' === title;
exports.isFolding = (title) => !exports.isNoTitle(title) && github_action_helper_1.Utils.getBoolValue(core_1.getInput('FOLDING'));
exports.wrapTitle = (title) => exports.isFolding(title) ? `<summary>${title.replace(/^([*_]*)(.+)\1$/, '$2')}</summary>` : title;
exports.wrapToc = (toc, title) => exports.isFolding(title) ? `<details>\n${toc}\n</details>` : toc;
exports.getMaxHeaderLevel = () => /^\d+$/.test(core_1.getInput('MAX_HEADER_LEVEL')) ? Number.parseInt(core_1.getInput('MAX_HEADER_LEVEL')) : undefined;
exports.getEntryPrefix = () => core_1.getInput('ENTRY_PREFIX');
const getExecuteCommands = (logger) => {
    const paths = getTargetPaths();
    if (!paths.length) {
        logger.warn('There is no valid target. Please check if [TARGET_PATHS] is set correctly.');
        return [];
    }
    const title = getTocTitle().replace('\'', '\\\'').replace('"', '\\"');
    return [doctoc_1.doctoc(paths, title, logger)];
};
exports.getRunnerArguments = () => {
    const logger = new github_action_helper_1.Logger(exports.replaceDirectory);
    return {
        rootDir: path_1.resolve(__dirname, '../..'),
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
        includeLabels: github_action_helper_1.Utils.getArrayInput('INCLUDE_LABELS'),
        targetEvents: constant_1.TARGET_EVENTS,
    };
};
// eslint-disable-next-line no-magic-numbers
exports.homeExpanded = (path) => path.indexOf('~') === 0 ? path_1.join(os_1.homedir(), path.substr(1)) : path_1.resolve(github_action_helper_1.Utils.getWorkspace(), path);
exports.cleanPath = (path) => exports.homeExpanded(path).replace(/\s/g, '\\ ');
// to avoid removing space
const getRawInput = (name) => String(process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`]);
exports.getArrayInput = (name) => github_action_helper_1.Utils.uniqueArray(getRawInput(name).split(/\r?\n/).filter(item => item));
