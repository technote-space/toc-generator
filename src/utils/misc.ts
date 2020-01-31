import path from 'path';
import { Utils, Logger } from '@technote-space/github-action-pr-helper';
import { MainArguments } from '@technote-space/github-action-pr-helper/dist/types';
import { getInput } from '@actions/core' ;
import { ACTION_NAME, ACTION_OWNER, ACTION_REPO } from '../constant';
import { TARGET_EVENTS } from '../constant';

const {getWorkspace, getArrayInput, replaceAll} = Utils;

export const replaceDirectory = (message: string): string => {
	const workDir = path.resolve(getWorkspace());
	return [
		{key: ` -C ${workDir}`, value: ''},
		{key: workDir, value: '[Working Directory]'},
	].reduce((value, target) => replaceAll(value, target.key, target.value), message);
};

const getTargetPaths = (): string[] => getArrayInput('TARGET_PATHS', true).filter(target => target && !target.startsWith('/') && !target.includes('..'));

const getTocTitle = (): string => getInput('TOC_TITLE');

export const getDocTocArgs = (): string | false => {
	const paths = getTargetPaths();
	if (!paths.length) {
		return false;
	}

	const workDir = getWorkspace();
	const title   = getTocTitle().replace('\'', '\\\'').replace('"', '\\"');
	return paths.map(item => path.resolve(workDir, item)).join(' ') + (title ? ` --title '${title}'` : ' --notitle');
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
		prBranchPrefixForDefaultBranch: getInput('PR_DEFAULT_BRANCH_PREFIX'),
		prBranchNameForDefaultBranch: getInput('PR_DEFAULT_BRANCH_NAME'),
		prTitleForDefaultBranch: getInput('PR_DEFAULT_BRANCH_TITLE'),
		prBodyForDefaultBranch: getInput('PR_DEFAULT_BRANCH_BODY'),
		prBodyForComment: getInput('PR_COMMENT_BODY'),
		prCloseMessage: getInput('PR_CLOSE_MESSAGE'),
		filterGitStatus: 'M',
		filterExtensions: ['md'],
		targetBranchPrefix: getInput('TARGET_BRANCH_PREFIX'),
		includeLabels: getArrayInput('INCLUDE_LABELS'),
		targetEvents: TARGET_EVENTS,
	};
};
