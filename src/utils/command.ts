import fs from 'fs';
import path from 'path';
import { Logger, Command, Utils } from '@technote-space/github-action-helper';
import { Context } from '@actions/github/lib/context';
import { getBranch, getDocTocArgs, isCloned, getWorkDir } from './misc';

export const replaceDirectory = (message: string): string => {
	const workDir = getWorkDir();
	return message.replace(` -C ${workDir}`, '').replace(workDir, '<Working Directory>');
};

const {getGitUrl} = Utils;
const logger = new Logger(replaceDirectory);
const command = new Command(logger);
const {startProcess, warn} = logger;
const {execAsync} = command;

export const getCurrentBranchName = async(): Promise<string> => {
	const workDir = getWorkDir();
	if (!fs.existsSync(path.resolve(workDir, '.git'))) {
		return '';
	}
	return (await execAsync({command: `git -C ${workDir} branch -a | grep -E '^\\*' | cut -b 3-`})).trim();
};

export const clone = async(context: Context): Promise<boolean> => {
	const workDir = getWorkDir();
	const branch = getBranch(context);
	startProcess('Cloning the branch %s from the remote repo', branch);

	const url = getGitUrl(context, false);
	await execAsync({command: `git -C ${workDir} clone --quiet --branch=${branch} --depth=3 ${url} .`, suppressError: true});

	if (await getCurrentBranchName() !== branch) {
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

	startProcess('Running Doctoc');
	const workDir = getWorkDir();
	const doctoc = path.resolve(workDir, 'node_modules/.bin/doctoc');
	await execAsync({command: `yarn --cwd ${workDir} add doctoc`, suppressOutput: true});
	await execAsync({command: `${doctoc} ${args} --github`});
	return true;
};

export const commit = async(): Promise<void> => {
	startProcess('Committing');

	const workDir = getWorkDir();
	await execAsync({command: `git -C ${workDir} add --all`});
};

export const getDiff = async(): Promise<string[]> => {
	startProcess('Checking diff');

	const workDir = getWorkDir();
	return (await execAsync({command: `git -C ${workDir} status --short -uno`, suppressOutput: true}))
		.split(/\r\n|\n/)
		.filter(line => line.match(/^M\s+/) && line.match(/\.md$/i))
		.map(line => line.replace(/^M\s+/, ''));
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
