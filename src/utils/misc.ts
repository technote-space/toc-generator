import fs from 'fs';
import path from 'path';
import {getInput} from '@actions/core' ;
import {Context} from '@actions/github/lib/context';
import {DEFAULT_COMMIT_MESSAGE, DEFAULT_TARGET_PATHS, TARGET_EVENTS} from '../constant';

export const isTargetEvent = (context: Context): boolean =>
    isTargetRef(context) &&
    context.eventName in TARGET_EVENTS &&
    (
        ('string' === typeof context.payload.action && TARGET_EVENTS[context.eventName] === context.payload.action) ||
        '*' === TARGET_EVENTS[context.eventName]
    );

export const getBuildVersion = (filepath: string): string | boolean => {
    if (!fs.existsSync(filepath)) {
        return false;
    }

    const json = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    if (json && 'tagName' in json) {
        return json['tagName'];
    }

    return false;
};

const getTargetPaths = (): string[] => [...new Set<string>((getInput('TARGET_PATHS') || DEFAULT_TARGET_PATHS).split(',').map(target => target.trim()).filter(target => target && !target.startsWith('/') && !target.includes('..')))];

export const getDocTocArgs = (): string | false => {
    const workDir = getWorkDir();
    const title = getTocTitle().replace('\'', '\\\'').replace('"', '\\"');
    const paths = getTargetPaths();
    if (!paths.length) {
        return false;
    }
    return getTargetPaths().map(item => path.resolve(workDir, item)).join(' ') + (title ? ` --title '${title}'` : ' --notitle');
};

const getTocTitle = (): string => getInput('TOC_TITLE') || '';

const getWorkspace = (): string => process.env.GITHUB_WORKSPACE || '';

export const isCloned = (): boolean => fs.existsSync(path.resolve(getWorkspace(), '.git'));

export const getWorkDir = (): string => isCloned() ? path.resolve(getWorkspace()) : path.resolve(getWorkspace(), '.work');

export const getGitUrl = (context: Context): string => `https://github.com/${context.repo.owner}/${context.repo.repo}.git`;

export const getRef = (context: Context): string => context.ref;

export const getRefForUpdate = (context: Context): string => encodeURIComponent(getRef(context).replace(/^refs\//, ''));

const isTargetRef = (context: Context): boolean => /^refs\/heads\//.test(getRef(context));

export const getBranch = (context: Context): string => getRef(context).replace(/^refs\/heads\//, '');

export const getCommitMessage = (): string => getInput('COMMIT_MESSAGE') || DEFAULT_COMMIT_MESSAGE;
