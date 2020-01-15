/* eslint-disable no-magic-numbers */
import path from 'path';
import { testEnv } from '@technote-space/github-action-test-helper';
import {
	replaceDirectory,
	getDocTocArgs,
	getRunnerArguments,
} from '../../src/utils/misc';
import { TARGET_EVENTS } from '../../src/constant';

describe('replaceDirectory', () => {
	testEnv();

	it('should replace working directory', () => {
		process.env.GITHUB_WORKSPACE = 'test-dir';
		const workDir                = path.resolve('test-dir');

		expect(replaceDirectory(`git -C ${workDir} fetch`)).toBe('git fetch');
		expect(replaceDirectory(`ls ${workDir}`)).toBe('ls [Working Directory]');
	});
});

describe('getDocTocArgs', () => {
	testEnv();

	it('should get DocToc args', () => {
		process.env.GITHUB_WORKSPACE   = '/tmp/workspace';
		process.env.INPUT_TARGET_PATHS = 'README.md,.github/CONTRIBUTING.md,/test/README.md';
		process.env.INPUT_TOC_TITLE    = '**Table of Contents**';
		expect(getDocTocArgs()).toBe('/tmp/workspace/README.md /tmp/workspace/.github/CONTRIBUTING.md --title \'**Table of Contents**\'');
	});

	it('should get DocToc args (no title)', () => {
		process.env.GITHUB_WORKSPACE   = '/tmp/workspace';
		process.env.INPUT_TARGET_PATHS = 'README.md,.github/CONTRIBUTING.md,/test/README.md';
		expect(getDocTocArgs()).toBe('/tmp/workspace/README.md /tmp/workspace/.github/CONTRIBUTING.md --notitle');
	});

	it('should return false', () => {
		process.env.GITHUB_WORKSPACE   = '/tmp/workspace';
		process.env.INPUT_TARGET_PATHS = '..';
		expect(getDocTocArgs()).toBe(false);
	});

	it('should throw error', () => {
		process.env.GITHUB_WORKSPACE = '/tmp/workspace';
		expect(() => getDocTocArgs()).toThrow('Input required and not supplied: TARGET_PATHS');
	});
});

describe('getRunnerArguments', () => {
	const rootDir = path.resolve(__dirname, '../..');
	testEnv(rootDir);

	it('should return args', () => {
		const args = getRunnerArguments();
		delete args.logger;
		expect(args).toEqual({
			rootDir: rootDir,
			actionName: 'TOC Generator',
			actionOwner: 'technote-space',
			actionRepo: 'toc-generator',
			commitMessage: 'docs: Update TOC',
			commitName: '',
			commitEmail: '',
			executeCommands: [
				`doctoc ${rootDir}/README*.md --title '**Table of Contents**' --github`,
			],
			filterExtensions: [
				'md',
			],
			filterGitStatus: 'M',
			globalInstallPackages: [
				'doctoc',
			],
			includeLabels: [],
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
			prBranchName: 'update-toc-${PR_ID}',
			prBranchNameForDefaultBranch: '',
			prBranchPrefix: 'toc-generator/',
			prBranchPrefixForDefaultBranch: '',
			prCloseMessage: 'This PR is no longer needed because the package looks up-to-date.',
			prTitle: 'docs: Update TOC (${PR_MERGE_REF})',
			prTitleForDefaultBranch: '',
			targetBranchPrefix: '',
			targetEvents: TARGET_EVENTS,
		});
	});

	it('should return args', () => {
		process.env.INPUT_COMMIT_NAME              = 'test name';
		process.env.INPUT_COMMIT_EMAIL             = 'test email';
		process.env.INPUT_COMMIT_MESSAGE           = 'test message';
		process.env.INPUT_PR_BRANCH_PREFIX         = 'prefix/';
		process.env.INPUT_PR_BRANCH_NAME           = 'test-branch-${PR_ID}';
		process.env.INPUT_PR_TITLE                 = 'test: create pull request (${PR_NUMBER})';
		process.env.INPUT_PR_BODY                  = 'pull request body';
		process.env.INPUT_PR_DEFAULT_BRANCH_PREFIX = 'prefix-default-branch/';
		process.env.INPUT_PR_DEFAULT_BRANCH_NAME   = 'test-default-branch-branch-${PR_ID}';
		process.env.INPUT_PR_DEFAULT_BRANCH_TITLE  = 'test-default-branch: create pull request (${PR_NUMBER})';
		process.env.INPUT_PR_DEFAULT_BRANCH_BODY   = 'pull request body (default-branch)';
		process.env.INPUT_PR_CLOSE_MESSAGE         = 'close message';
		process.env.INPUT_PR_DATE_FORMAT1          = 'YYYY-MM-DD HH:mm:ss';
		process.env.INPUT_PR_DATE_FORMAT2          = 'YYYY-MM-DD';
		process.env.INPUT_TARGET_BRANCH_PREFIX     = 'feature/';
		process.env.INPUT_DELETE_PACKAGE           = '1';
		process.env.INPUT_INCLUDE_LABELS           = 'label1, label2\nlabel3';
		process.env.INPUT_TARGET_PATHS             = '/';

		const args = getRunnerArguments();
		delete args.logger;
		expect(args).toEqual({
			rootDir: rootDir,
			actionName: 'TOC Generator',
			actionOwner: 'technote-space',
			actionRepo: 'toc-generator',
			commitName: 'test name',
			commitEmail: 'test email',
			commitMessage: 'test message',
			executeCommands: [],
			filterExtensions: [
				'md',
			],
			filterGitStatus: 'M',
			globalInstallPackages: [
				'doctoc',
			],
			includeLabels: [
				'label1',
				'label2',
				'label3',
			],
			prBody: 'pull request body',
			prBodyForDefaultBranch: 'pull request body (default-branch)',
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
