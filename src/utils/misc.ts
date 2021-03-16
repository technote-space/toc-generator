import {resolve, join} from 'path';
import {homedir} from 'os';
import {Utils} from '@technote-space/github-action-helper';
import {Logger} from '@technote-space/github-action-log-helper';
import {ExecuteTask, MainArguments} from '@technote-space/github-action-pr-helper/dist/types';
import {getInput} from '@actions/core' ;
import {doctoc} from './doctoc';
import {ACTION_NAME, ACTION_OWNER, ACTION_REPO, TARGET_EVENTS} from '../constant';

export const replaceDirectory = (message: string): string => {
  const workDir = resolve(Utils.getWorkspace());
  return [
    {key: ` -C ${workDir}`, value: ''},
    {key: workDir, value: '[Working Directory]'},
  ].reduce((value, target) => Utils.replaceAll(value, target.key, target.value), message);
};

const getTargetPaths = (): Array<string> => Utils.getArrayInput('TARGET_PATHS', true).filter(target => target && !target.startsWith('/') && !target.includes('..'));
const getTocTitle    = (): string => getInput('TOC_TITLE');

export const isNoTitle         = (title: string): boolean => '' === title;
export const isFolding         = (): boolean => Utils.getBoolValue(getInput('FOLDING'));
export const getMaxHeaderLevel = (): number | undefined => /^\d+$/.test(getInput('MAX_HEADER_LEVEL')) ? Number.parseInt(getInput('MAX_HEADER_LEVEL')) : undefined;
export const getEntryPrefix    = (): string => getInput('ENTRY_PREFIX');

const getExecuteCommands = (logger: Logger): Array<ExecuteTask> => {
  const paths = getTargetPaths();
  if (!paths.length) {
    logger.warn('There is no valid target. Please check if [TARGET_PATHS] is set correctly.');
    return [];
  }

  const title = getTocTitle().replace('\'', '\\\'').replace('"', '\\"');

  return [doctoc(paths, title, logger)];
};

export const getRunnerArguments = (): MainArguments => {
  const logger = new Logger(replaceDirectory);
  return {
    rootDir: resolve(__dirname, '../..'),
    logger,
    actionName: ACTION_NAME,
    actionOwner: ACTION_OWNER,
    actionRepo: ACTION_REPO,
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
    filterExtensions: ['md', 'markdown'],
    targetBranchPrefix: getInput('TARGET_BRANCH_PREFIX'),
    includeLabels: Utils.getArrayInput('INCLUDE_LABELS'),
    targetEvents: TARGET_EVENTS,
    notCreatePr: !Utils.getBoolValue(getInput('CREATE_PR')),
    checkOnlyDefaultBranch: Utils.getBoolValue(getInput('CHECK_ONLY_DEFAULT_BRANCH')),
  };
};

// eslint-disable-next-line no-magic-numbers
export const homeExpanded = (path: string): string => path.indexOf('~') === 0 ? join(homedir(), path.substr(1)) : resolve(Utils.getWorkspace(), path);
export const cleanPath    = (path: string): string => homeExpanded(path).replace(/\s/g, '\\ ');

// to avoid removing space
const getRawInput          = (name: string): string => String(process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`]);
export const getArrayInput = (name: string): Array<string> => Utils.uniqueArray(getRawInput(name).split(/\r?\n/).filter(item => item));
