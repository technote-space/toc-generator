import fs from 'fs';
import path from 'path';
import { Logger, GitHelper, Utils } from '@technote-space/github-action-helper';
import { Context } from '@actions/github/lib/context';
import { getDocTocArgs, isCloned, getWorkDir, isDisabledDeletePackage } from './misc';

const {getWorkspace, replaceAll} = Utils;

export const replaceDirectory = (message: string): string => {
	const workDir = path.resolve(getWorkspace());
	return [
		{key: ` -C ${workDir}/.work`, value: ''},
		{key: ` -C ${workDir}`, value: ''},
		{key: `${workDir}/.work`, value: '<Working Directory>'},
		{key: workDir, value: '<Working Directory>'},
	].reduce((value, target) => replaceAll(value, target.key, target.value), message);
};

const logger               = new Logger(replaceDirectory);
const {startProcess, warn} = logger;
const helper               = new GitHelper(logger, {filter: (line: string): boolean => /^M\s+/.test(line) && /\.md$/i.test(line)});

export const clone = async(context: Context): Promise<void> => {
	const workDir = getWorkDir();
	startProcess('Cloning from the remote repo...');

	await helper.clone(workDir, context);
};

const clearPackage = async(): Promise<void> => {
	if (isDisabledDeletePackage()) {
		return;
	}
	await helper.runCommand(getWorkDir(), [
		'rm -f package.json',
		'rm -f package-lock.json',
		'rm -f yarn.lock',
	]);
};

const installDoctoc = async(): Promise<void> => {
	await helper.runCommand(getWorkDir(), [
		'yarn add doctoc',
	]);
};

export const runDocToc = async(): Promise<boolean> => {
	const args = getDocTocArgs();
	if (false === args) {
		warn('There is no valid target. Please check if [TARGET_PATHS] is set correctly.');
		return false;
	}

	startProcess('Running Doctoc...');
	await clearPackage();
	await installDoctoc();
	await helper.runCommand(getWorkDir(), [
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
		await clone(context);
	}
	if (!await runDocToc()) {
		return false;
	}
	await commit();

	return getDiff();
};
