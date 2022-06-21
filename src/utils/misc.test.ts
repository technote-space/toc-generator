/* eslint-disable no-magic-numbers */
import os from 'os';
import path from 'path';
import { testEnv } from '@technote-space/github-action-test-helper';
import { describe, expect, it, vi } from 'vitest';
import { TARGET_EVENTS } from '../constant';
import {
  replaceDirectory,
  getRunnerArguments,
  isNoTitle,
  isFolding,
  getMaxHeaderLevel,
  getEntryPrefix,
  homeExpanded,
  cleanPath,
  getArrayInput,
} from './misc';

const rootDir = path.resolve(__dirname, '../..');

describe('replaceDirectory', () => {
  testEnv(rootDir);

  it('should replace working directory', () => {
    process.env.GITHUB_WORKSPACE = 'test-dir';
    const workDir                = path.resolve('test-dir');

    expect(replaceDirectory(`git -C ${workDir} fetch`)).toBe('git fetch');
    expect(replaceDirectory(`ls ${workDir}`)).toBe('ls [Working Directory]');
  });
});

describe('getRunnerArguments', () => {
  testEnv(rootDir);

  it('should return args', () => {
    const args = getRunnerArguments();
    delete args.logger;
    expect(args).toHaveProperty('executeCommands');
    delete args.executeCommands;
    expect(args).toEqual({
      rootDir: rootDir,
      actionName: 'TOC Generator',
      actionOwner: 'technote-space',
      actionRepo: 'toc-generator',
      checkOnlyDefaultBranch: false,
      commitMessage: 'chore(docs): update TOC',
      commitName: '',
      commitEmail: '',
      filterExtensions: [
        'md',
        'markdown',
      ],
      filterGitStatus: 'M',
      includeLabels: [],
      notCreatePr: true,
      prBody: [
        '## Base PullRequest',
        '',
        '${PR_TITLE} (${PR_NUMBER_REF})',
        '',
        '## Command results',
        '<details>',
        '  <summary>Details: </summary>',
        '',
        '  ${COMMANDS_OUTPUT}',
        '',
        '</details>',
        '',
        '## Changed files',
        '<details>',
        '  <summary>${FILES_SUMMARY}: </summary>',
        '',
        '  ${FILES}',
        '',
        '</details>',
        '',
        '<hr>',
        '',
        '[:octocat: Repo](${ACTION_URL}) | [:memo: Issues](${ACTION_URL}/issues) | [:department_store: Marketplace](${ACTION_MARKETPLACE_URL})',
      ].join('\n'),
      prBodyForDefaultBranch: '',
      prBodyForComment: [
        '## Command results',
        '<details>',
        '  <summary>Details: </summary>',
        '',
        '  ${COMMANDS_OUTPUT}',
        '',
        '</details>',
        '',
        '## Changed files',
        '<details>',
        '  <summary>${FILES_SUMMARY}: </summary>',
        '',
        '  ${FILES}',
        '',
        '</details>',
        '',
        '<hr>',
        '',
        '[:octocat: Repo](${ACTION_URL}) | [:memo: Issues](${ACTION_URL}/issues) | [:department_store: Marketplace](${ACTION_MARKETPLACE_URL})',
      ].join('\n'),
      prBranchName: 'update-toc-${PR_ID}',
      prBranchNameForDefaultBranch: '',
      prBranchPrefix: 'toc-generator/',
      prBranchPrefixForDefaultBranch: '',
      prCloseMessage: 'This PR has been closed because it is no longer needed.',
      prTitle: 'chore(docs): update TOC (${PR_MERGE_REF})',
      prTitleForDefaultBranch: '',
      targetBranchPrefix: '',
      targetEvents: TARGET_EVENTS,
    });
  });

  it('should return args', () => {
    process.env.INPUT_COMMIT_NAME               = 'test name';
    process.env.INPUT_COMMIT_EMAIL              = 'test email';
    process.env.INPUT_COMMIT_MESSAGE            = 'test message';
    process.env.INPUT_PR_BRANCH_PREFIX          = 'prefix/';
    process.env.INPUT_PR_BRANCH_NAME            = 'test-branch-${PR_ID}';
    process.env.INPUT_PR_TITLE                  = 'test: create pull request (${PR_NUMBER})';
    process.env.INPUT_PR_BODY                   = 'pull request body';
    process.env.INPUT_PR_DEFAULT_BRANCH_PREFIX  = 'prefix-default-branch/';
    process.env.INPUT_PR_DEFAULT_BRANCH_NAME    = 'test-default-branch-branch-${PR_ID}';
    process.env.INPUT_PR_DEFAULT_BRANCH_TITLE   = 'test-default-branch: create pull request (${PR_NUMBER})';
    process.env.INPUT_PR_DEFAULT_BRANCH_BODY    = 'pull request body (default-branch)';
    process.env.INPUT_PR_COMMENT_BODY           = 'pull request body (comment)';
    process.env.INPUT_PR_CLOSE_MESSAGE          = 'close message';
    process.env.INPUT_PR_DATE_FORMAT1           = 'YYYY-MM-DD HH:mm:ss';
    process.env.INPUT_PR_DATE_FORMAT2           = 'YYYY-MM-DD';
    process.env.INPUT_TARGET_BRANCH_PREFIX      = 'feature/';
    process.env.INPUT_DELETE_PACKAGE            = '1';
    process.env.INPUT_INCLUDE_LABELS            = 'label1, label2\nlabel3';
    process.env.INPUT_TARGET_PATHS              = '/';
    process.env.INPUT_CREATE_PR                 = 'false';
    process.env.INPUT_CHECK_ONLY_DEFAULT_BRANCH = 'true';

    const args = getRunnerArguments();
    delete args.logger;
    expect(args).toEqual({
      rootDir: rootDir,
      actionName: 'TOC Generator',
      actionOwner: 'technote-space',
      actionRepo: 'toc-generator',
      checkOnlyDefaultBranch: true,
      commitName: 'test name',
      commitEmail: 'test email',
      commitMessage: 'test message',
      executeCommands: [],
      filterExtensions: [
        'md',
        'markdown',
      ],
      filterGitStatus: 'M',
      notCreatePr: true,
      includeLabels: [
        'label1',
        'label2',
        'label3',
      ],
      prBody: 'pull request body',
      prBodyForDefaultBranch: 'pull request body (default-branch)',
      prBodyForComment: 'pull request body (comment)',
      prBranchName: 'test-branch-${PR_ID}',
      prBranchNameForDefaultBranch: 'test-default-branch-branch-${PR_ID}',
      prBranchPrefix: 'prefix/',
      prBranchPrefixForDefaultBranch: 'prefix-default-branch/',
      prCloseMessage: 'close message',
      prTitle: 'test: create pull request (${PR_NUMBER})',
      prTitleForDefaultBranch: 'test-default-branch: create pull request (${PR_NUMBER})',
      targetBranchPrefix: 'feature/',
      targetEvents: TARGET_EVENTS,
    });
  });
});

describe('isNoTitle', () => {
  it('should return false', () => {
    expect(isNoTitle('test title')).toBe(false);
  });

  it('should return true', () => {
    expect(isNoTitle('')).toBe(true);
  });
});

describe('isFolding', () => {
  testEnv(rootDir);

  it('should return false', () => {
    expect(isFolding()).toBe(false);
  });

  it('should return true', () => {
    process.env.INPUT_FOLDING = 'true';
    expect(isFolding()).toBe(true);
  });
});

describe('getMaxHeaderLevel', () => {
  testEnv(rootDir);

  it('should get max header level', () => {
    process.env.INPUT_MAX_HEADER_LEVEL = '3';
    expect(getMaxHeaderLevel()).toBe(3);
  });

  it('should not get max header level', () => {
    expect(getMaxHeaderLevel()).toBeUndefined();
  });
});

describe('getEntryPrefix', () => {
  testEnv(rootDir);

  it('should get entry prefix', () => {
    process.env.INPUT_ENTRY_PREFIX = '*';
    expect(getEntryPrefix()).toBe('*');
  });

  it('should not get entry prefix', () => {
    expect(getEntryPrefix()).toBe('');
  });
});

describe('homeExpanded', () => {
  testEnv(rootDir);

  it('should return home path', () => {
    const spy = vi.spyOn(os, 'homedir').mockImplementation(() => '/home/test');
    expect(homeExpanded('~/test.txt')).toBe('/home/test/test.txt');
    spy.mockRestore();
  });

  it('should return absolute path', () => {
    process.env.GITHUB_WORKSPACE = '/test-dir/';
    expect(homeExpanded('test.txt')).toBe('/test-dir/test.txt');
  });
});

describe('cleanPath', () => {
  testEnv(rootDir);

  it('should return clean path', () => {
    const spy = vi.spyOn(os, 'homedir').mockImplementation(() => '/home/test');
    expect(cleanPath('~/t e s t.txt')).toBe('/home/test/t\\ e\\ s\\ t.txt');
    spy.mockRestore();
  });
});

describe('getArrayInput', () => {
  testEnv(rootDir);

  it('should return array input', () => {
    expect(getArrayInput('OPENING_COMMENT')).toEqual([
      '<!-- toc ',
    ]);
  });
});
