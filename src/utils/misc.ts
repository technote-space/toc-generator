import fs from 'fs';
import path from 'path';
import { Context } from '@actions/github/lib/context';
import { Utils } from '@technote-space/github-action-helper';
import { isTargetEvent, isTargetLabels } from '@technote-space/filter-github-action';
import { getInput } from '@actions/core' ;
import { TARGET_EVENTS, DEFAULT_COMMIT_MESSAGE, DEFAULT_TARGET_PATHS } from '../constant';

const {getWorkspace, getArrayInput, escapeRegExp, getBranch} = Utils;

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

const getBranchPrefix = (): string => getInput('BRANCH_PREFIX') || '';

const getBranchPrefixRegExp = (): RegExp => new RegExp('^' + escapeRegExp(getBranchPrefix()));

export const isValidBranch = (branch: string): boolean => !getBranchPrefix() || getBranchPrefixRegExp().test(branch);

export const isTargetContext = (context: Context): boolean =>
	isTargetEvent(TARGET_EVENTS, context) &&
	(context.eventName === 'push' || isTargetLabels(getArrayInput('INCLUDE_LABELS'), [], context)) &&
	(context.eventName !== 'push' || isValidBranch(getBranch(context)));
