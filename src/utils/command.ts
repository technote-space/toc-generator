import fs from 'fs';
import path from 'path';
import { Logger, GitHelper, Utils } from '@technote-space/github-action-helper';
import { Context } from '@actions/github/lib/context';
import { getDocTocArgs, isCloned, getWorkDir } from './misc';

const {getBranch, getWorkspace} = Utils;

export const replaceDirectory = (message: string): string => {
	const workDir = path.resolve(getWorkspace());
	return message
		.replace(` -C ${workDir}/.work`, '')
		.replace(` -C ${workDir}`, '')
		.replace(`${workDir}/.work`, '<Working Directory>')
		.replace(workDir, '<Working Directory>');
};

const logger = new Logger(replaceDirectory);
const {startProcess, warn} = logger;
const helper = new GitHelper(logger, {filter: (line: string): boolean => /^M\s+/.test(line) && /\.md$/i.test(line)});

export const clone = async(context: Context): Promise<boolean> => {
	const branch = getBranch(context);
	const workDir = getWorkDir();
	startProcess('Cloning the branch %s from the remote repo...', branch);

	await helper.clone(workDir, branch, context);

	if (await helper.getCurrentBranchName(workDir) !== branch) {
		warn('remote branch [%s] not found', branch);
		return false;
	}

	return true;
};

export const runDocToc = async(): Promise<boolean> => {
	const args = getDocTocArgs();
	if (false === args) {
		warn('There is no valid target. Please check if [TARGET_PATHS] is set correctly.');
		return false;
	}

	startProcess('Running Doctoc...');
	await helper.runCommand(getWorkDir(), [
		'rm -f package.json',
		'rm -f package-lock.json',
		'rm -f yarn.lock',
		'yarn add doctoc',
		`node_modules/.bin/doctoc ${args} --github`,
	]);
	return true;
};

export const commit = async(): Promise<void> => {
	startProcess('Committing...');

	await helper.runCommand(getWorkDir(), [
		'git add --all',
	]);
};

export const getDiff = async(): Promise<string[]> => {
	startProcess('Checking diff...');

	return await helper.getDiff(getWorkDir());
};

export const getChangedFiles = async(context: Context): Promise<string[] | false> => {
	startProcess('Running DocToc and getting changed files');

	const workDir = getWorkDir();
	fs.mkdirSync(workDir, {recursive: true});
	if (!isCloned()) {
		if (!await clone(context)) {
			return false;
		}
	}
	if (!await runDocToc()) {
		return false;
	}
	await commit();

	return getDiff();
};
