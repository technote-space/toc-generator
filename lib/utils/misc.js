"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const github_action_helper_1 = require("@technote-space/github-action-helper");
const filter_github_action_1 = require("@technote-space/filter-github-action");
const core_1 = require("@actions/core");
const constant_1 = require("../constant");
const { getWorkspace, getArrayInput, escapeRegExp, getBranch, getBoolValue, isPr, isPush } = github_action_helper_1.Utils;
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
/**
 * @return {{string, Function}[]} replacer
 */
const contextVariables = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getPrParam = (context, extractor) => {
        if (!context.payload.pull_request) {
            throw new Error('Invalid context.');
        }
        return extractor(context.payload.pull_request);
    };
    return [
        { key: 'PR_NUMBER', replace: (context) => getPrParam(context, pr => pr.number) },
        { key: 'PR_ID', replace: (context) => getPrParam(context, pr => pr.id) },
        { key: 'PR_HEAD_REF', replace: (context) => getPrParam(context, pr => pr.head.ref) },
        { key: 'PR_BASE_REF', replace: (context) => getPrParam(context, pr => pr.base.ref) },
    ];
};
/**
 * @param {string} variable variable
 * @param {Context} context context
 * @return {string} replaced
 */
const replaceContextVariables = (variable, context) => contextVariables().reduce((acc, value) => acc.replace(`\${${value.key}}`, value.replace(context)), variable);
exports.getPrBranchName = (context) => replaceContextVariables(core_1.getInput('PR_BRANCH_NAME'), context) || '';
exports.getPrTitle = (context) => replaceContextVariables(core_1.getInput('PR_TITLE'), context) || constant_1.DEFAULT_PR_TITLE;
exports.getPrLink = (context) => context.payload.pull_request ? [
    `[${context.payload.pull_request.title}](${context.payload.pull_request.html_url})`,
    '',
] : [];
exports.getPrBody = (context, files) => [
    '## Updated TOC',
    '',
].concat(exports.getPrLink(context)).concat([
    '<details>',
    '',
    // eslint-disable-next-line no-magic-numbers
    '<summary>Changed ' + (files.length > 1 ? 'files' : 'file') + '</summary>',
    '',
]).concat(files.map(file => `- ${file}`)).concat([
    '',
    '</details>',
]).join('\n');
exports.isDisabledDeletePackage = () => !getBoolValue(core_1.getInput('DELETE_PACKAGE'));
const getBranchPrefix = () => core_1.getInput('BRANCH_PREFIX') || '';
const getBranchPrefixRegExp = () => new RegExp('^' + escapeRegExp(getBranchPrefix()));
exports.isValidBranch = (branch) => !getBranchPrefix() || getBranchPrefixRegExp().test(branch);
const isSetPrBranchName = () => !!core_1.getInput('PR_BRANCH_NAME');
exports.isCreatePR = (context) => isPr(context) && isSetPrBranchName();
exports.isClosePR = (context) => isPr(context) && context.action === 'closed';
exports.isTargetContext = (context) => {
    if (!filter_github_action_1.isTargetEvent(constant_1.TARGET_EVENTS, context)) {
        return false;
    }
    if (exports.isClosePR(context)) {
        return isSetPrBranchName();
    }
    if (isSetPrBranchName()) {
        if (!exports.isCreatePR(context)) {
            return false;
        }
    }
    if (isPush(context)) {
        return exports.isValidBranch(getBranch(context));
    }
    return filter_github_action_1.isTargetLabels(getArrayInput('INCLUDE_LABELS'), [], context);
};
