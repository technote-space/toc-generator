import fs from 'fs';
import path from 'path';
import { Context } from '@actions/github/lib/context';
import { Utils } from '@technote-space/github-action-helper';
import { isTargetEvent, isTargetLabels } from '@technote-space/filter-github-action';
import { getInput } from '@actions/core' ;
import { TARGET_EVENTS, DEFAULT_COMMIT_MESSAGE, DEFAULT_TARGET_PATHS, DEFAULT_PR_TITLE } from '../constant';

const {getWorkspace, getArrayInput, escapeRegExp, getBranch, getBoolValue, isPr, isPush} = Utils;

const getTargetPaths = (): string[] => {
	const paths = getArrayInput('TARGET_PATHS');
	if (!paths.length) {
		return [DEFAULT_TARGET_PATHS];
	}
	return paths.filter(target => target && !target.startsWith('/') && !target.includes('..'));
};

export const isCloned = (): boolean => fs.existsSync(path.resolve(getWorkspace(), '.git'));

export const getWorkDir = (): string => isCloned() ? path.resolve(getWorkspace()) : path.resolve(getWorkspace(), '.work');

const getTocTitle = (): string => getInput('TOC_TITLE') || '';

export const getDocTocArgs = (): string | false => {
	const paths = getTargetPaths();
	if (!paths.length) {
		return false;
	}

	const workDir = getWorkDir();
	const title = getTocTitle().replace('\'', '\\\'').replace('"', '\\"');
	return getTargetPaths().map(item => path.resolve(workDir, item)).join(' ') + (title ? ` --title '${title}'` : ' --notitle');
};

export const getCommitMessage = (): string => getInput('COMMIT_MESSAGE') || DEFAULT_COMMIT_MESSAGE;

/**
 * @return {{string, Function}[]} replacer
 */
const contextVariables = (): { key: string; replace: (Context) => string }[] => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const getPrParam = (context: Context, extractor: (pr: { [key: string]: any }) => string): string => {
		if (!context.payload.pull_request) {
			throw new Error('Invalid context.');
		}
		return extractor(context.payload.pull_request);
	};
	return [
		{key: 'PR_NUMBER', replace: (context: Context): string => getPrParam(context, pr => pr.number)},
		{key: 'PR_ID', replace: (context: Context): string => getPrParam(context, pr => pr.id)},
		{key: 'PR_HEAD_REF', replace: (context: Context): string => getPrParam(context, pr => pr.head.ref)},
		{key: 'PR_BASE_REF', replace: (context: Context): string => getPrParam(context, pr => pr.base.ref)},
	];
};

/**
 * @param {string} variable variable
 * @param {Context} context context
 * @return {string} replaced
 */
const replaceContextVariables = (variable: string, context: Context): string => contextVariables().reduce((acc, value) => acc.replace(`\${${value.key}}`, value.replace(context)), variable);

export const getPrBranchName = (context: Context): string => replaceContextVariables(getInput('PR_BRANCH_NAME'), context) || '';

export const getPrTitle = (context: Context): string => replaceContextVariables(getInput('PR_TITLE'), context) || DEFAULT_PR_TITLE;

export const getPrLink = (context: Context): string[] => context.payload.pull_request ? [
	`[${context.payload.pull_request.title}](${context.payload.pull_request.html_url})`,
	'',
] : [];

export const getPrBody = (context: Context, files: string[]): string => [
	'## Updated TOC',
	'',
].concat(getPrLink(context)).concat([
	'<details>',
	'',
	// eslint-disable-next-line no-magic-numbers
	'<summary>Changed ' + (files.length > 1 ? 'files' : 'file') + '</summary>',
	'',
]).concat(files.map(file => `- ${file}`)).concat([
	'',
	'</details>',
]).join('\n');

export const isDisabledDeletePackage = (): boolean => !getBoolValue(getInput('DELETE_PACKAGE'));

const getBranchPrefix = (): string => getInput('BRANCH_PREFIX') || '';

const getBranchPrefixRegExp = (): RegExp => new RegExp('^' + escapeRegExp(getBranchPrefix()));

export const isValidBranch = (branch: string): boolean => !getBranchPrefix() || getBranchPrefixRegExp().test(branch);

const isSetPrBranchName = (): boolean => !!getInput('PR_BRANCH_NAME');

export const isCreatePR = (context: Context): boolean => isPr(context) && isSetPrBranchName();

export const isClosedPR = (context: Context): boolean => isPr(context) && context.action === 'closed';

export const isTargetContext = (context: Context): boolean => {
	if (!isTargetEvent(TARGET_EVENTS, context)) {
		return false;
	}

	if (isClosedPR(context)) {
		return isSetPrBranchName();
	}

	if (isSetPrBranchName()) {
		if (!isCreatePR(context)) {
			return false;
		}
	}

	if (isPush(context)) {
		return isValidBranch(getBranch(context));
	}

	return isTargetLabels(getArrayInput('INCLUDE_LABELS'), [], context);
};
