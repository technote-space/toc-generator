import fs from 'fs';
import path from 'path';
import { Utils } from '@technote-space/github-action-helper';
import { getInput } from '@actions/core' ;
import { Context } from '@actions/github/lib/context';
import { DEFAULT_COMMIT_MESSAGE, DEFAULT_TARGET_PATHS } from '../constant';

const {getWorkspace, getArrayInput} = Utils;

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
	const workDir = getWorkDir();
	const title = getTocTitle().replace('\'', '\\\'').replace('"', '\\"');
	const paths = getTargetPaths();
	if (!paths.length) {
		return false;
	}
	return getTargetPaths().map(item => path.resolve(workDir, item)).join(' ') + (title ? ` --title '${title}'` : ' --notitle');
};

export const getRefForUpdate = (context: Context): string => encodeURIComponent(context.ref.replace(/^refs\//, ''));

export const getBranch = (context: Context): string => context.ref.replace(/^refs\/heads\//, '');

export const getCommitMessage = (): string => getInput('COMMIT_MESSAGE') || DEFAULT_COMMIT_MESSAGE;
