import fs from 'fs';
import path from 'path';
import { Utils, Logger } from '@technote-space/github-action-pr-helper';
import { MainArguments } from '@technote-space/github-action-pr-helper/dist/types';
import { getInput } from '@actions/core' ;
import { ACTION_NAME, ACTION_OWNER, ACTION_REPO } from '../constant';
import { TARGET_EVENTS, DEFAULT_TARGET_PATHS } from '../constant';

const {getWorkspace, getArrayInput, replaceAll, split} = Utils;

export const replaceDirectory = (message: string): string => {
	const workDir = path.resolve(getWorkspace());
	return [
		{key: ` -C ${workDir}/.work`, value: ''},
		{key: ` -C ${workDir}`, value: ''},
		{key: `${workDir}/.work`, value: '[Working Directory]'},
		{key: workDir, value: '[Working Directory]'},
	].reduce((value, target) => replaceAll(value, target.key, target.value), message);
};

export const isCloned = (): boolean => fs.existsSync(path.resolve(getWorkspace(), '.git'));

export const getWorkDir = (): string => isCloned() ? path.resolve(getWorkspace()) : path.resolve(getWorkspace(), '.work');

const getTargetPaths = (): string[] => {
	const paths = getArrayInput('TARGET_PATHS');
	if (!paths.length) {
		return [DEFAULT_TARGET_PATHS];
	}
	return paths.filter(target => target && !target.startsWith('/') && !target.includes('..'));
};

const getTocTitle = (): string => getInput('TOC_TITLE') || '';

export const getDocTocArgs = (): string | false => {
	const paths = getTargetPaths();
	if (!paths.length) {
		return false;
	}

	const workDir = getWorkDir();
	const title   = getTocTitle().replace('\'', '\\\'').replace('"', '\\"');
	return getTargetPaths().map(item => path.resolve(workDir, item)).join(' ') + (title ? ` --title '${title}'` : ' --notitle');
};

const getExecuteCommands = (logger: Logger): string[] => {
	const args = getDocTocArgs();
	if (false === args) {
		logger.warn('There is no valid target. Please check if [TARGET_PATHS] is set correctly.');
		return [];
	}

	return [
		`doctoc ${args} --github`,
	];
};

export const getRunnerArguments = (): MainArguments => {
	const logger = new Logger(replaceDirectory);
	return {
		rootDir: path.resolve(__dirname, '../..'),
		logger: logger,
		actionName: ACTION_NAME,
		actionOwner: ACTION_OWNER,
		actionRepo: ACTION_REPO,
		globalInstallPackages: ['doctoc'],
		executeCommands: getExecuteCommands(logger),
		commitMessage: getInput('COMMIT_MESSAGE'),
		commitName: getInput('COMMIT_NAME'),
		commitEmail: getInput('COMMIT_EMAIL'),
		prBranchPrefix: getInput('PR_BRANCH_PREFIX'),
		prBranchName: getInput('PR_BRANCH_NAME'),
		prTitle: getInput('PR_TITLE'),
		prBody: getInput('PR_BODY'),
		prCloseMessage: getInput('PR_CLOSE_MESSAGE'),
		filterGitStatus: 'M',
		filterExtensions: ['md'],
		targetBranchPrefix: getInput('TARGET_BRANCH_PREFIX'),
		includeLabels: getArrayInput('INCLUDE_LABELS'),
		targetEvents: TARGET_EVENTS,
	};
};
