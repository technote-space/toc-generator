/* eslint-disable no-magic-numbers */
import { Context } from '@actions/github/lib/context';
import nock from 'nock';
import { resolve } from 'path';
import {
	generateContext,
	testEnv,
	testFs,
	disableNetConnect,
	spyOnStdout,
	stdoutCalledWith,
	getApiFixture,
	setChildProcessParams,
	testChildProcess,
} from '@technote-space/github-action-test-helper';
import { main, Logger } from '@technote-space/github-action-pr-helper';
import { MainArguments } from '@technote-space/github-action-pr-helper/dist/types';
import { clearCache } from '@technote-space/github-action-pr-helper/dist/utils/command';
import { getRunnerArguments } from '../../src/utils/misc';

const rootDir     = resolve(__dirname, '..', '..');
const fixturesDir = resolve(__dirname, '..', 'fixtures');
const setExists   = testFs();
beforeEach(() => {
	Logger.resetForTesting();
	clearCache();
});

const context     = (action: string, event = 'pull_request', ref = 'heads/test'): Context => generateContext({
	owner: 'hello',
	repo: 'world',
	event,
	action,
	ref,
	sha: '7638417db6d59f3c431d3e1f261cc637155684cd',
}, {
	payload: {
		'pull_request': {
			number: 11,
			id: 21031067,
			head: {
				ref: 'change',
			},
			base: {
				ref: 'master',
			},
			labels: [],
		},
	},
});
const getMainArgs = (override?: object): MainArguments => Object.assign({}, getRunnerArguments(), override ?? {});

describe('main', () => {
	disableNetConnect(nock);
	testEnv(rootDir);
	testChildProcess();

	it('should do nothing if tag push', async() => {
		process.env.INPUT_GITHUB_TOKEN = 'test-token';
		const mockStdout               = spyOnStdout();

		nock('https://api.github.com')
			.persist()
			.get('/repos/hello/world')
			.reply(200, () => getApiFixture(fixturesDir, 'repos.get'));

		await main(getMainArgs({
			rootDir: undefined,
			context: context('', 'push', 'tags/v1.2.3'),
		}));

		stdoutCalledWith(mockStdout, [
			'> This is not target event.',
		]);
	});

	it('should do nothing if it is not target branch', async() => {
		process.env.INPUT_GITHUB_TOKEN         = 'test-token';
		process.env.INPUT_TARGET_BRANCH_PREFIX = 'prefix/';
		const mockStdout                       = spyOnStdout();

		nock('https://api.github.com')
			.persist()
			.get('/repos/hello/world')
			.reply(200, () => getApiFixture(fixturesDir, 'repos.get'));

		await main(getMainArgs({
			rootDir: undefined,
			context: context('opened', 'pull_request', 'test/change'),
		}));

		stdoutCalledWith(mockStdout, [
			'> This is not target event.',
		]);
	});

	it('should close pull request', async() => {
		process.env.GITHUB_WORKSPACE     = resolve('test');
		process.env.INPUT_GITHUB_TOKEN   = 'test-token';
		process.env.INPUT_PR_BRANCH_NAME = 'close/test';
		const mockStdout                 = spyOnStdout();

		nock('https://api.github.com')
			.persist()
			.get('/repos/hello/world')
			.reply(200, () => getApiFixture(fixturesDir, 'repos.get'))
			.get('/repos/hello/world/pulls?sort=created&direction=asc&base=change&per_page=100&page=1')
			.reply(200, () => getApiFixture(fixturesDir, 'pulls.list'))
			.get('/repos/hello/world/pulls?sort=created&direction=asc&base=change&per_page=100&page=2')
			.reply(200, () => [])
			.get('/repos/hello/world/pulls?sort=created&direction=asc&head=hello%3Amaster&per_page=100&page=1')
			.reply(200, () => [])
			.get('/repos/octocat/Hello-World/pulls?head=octocat%3Atoc-generator%2Fclose%2Ftest')
			.reply(200, () => getApiFixture(fixturesDir, 'pulls.list'))
			.post('/repos/octocat/Hello-World/issues/1347/comments')
			.reply(201, () => getApiFixture(fixturesDir, 'issues.comment.create'))
			.patch('/repos/octocat/Hello-World/pulls/1347')
			.reply(200, () => getApiFixture(fixturesDir, 'pulls.update'))
			.delete('/repos/octocat/Hello-World/git/refs/heads/toc-generator/close/test')
			.reply(204, () => getApiFixture(fixturesDir, 'pulls.update'));

		await main(getMainArgs({
			rootDir: undefined,
			context: context('closed'),
		}));

		stdoutCalledWith(mockStdout, [
			'::group::Target PullRequest Ref [new-topic]',
			'> Initializing working directory...',
			'[command]rm -rdf ./* ./.[!.]*',
			'  >> stdout',
			'> Cloning [toc-generator/close/test] branch from the remote repo...',
			'[command]git clone --branch=toc-generator/close/test',
			'> remote branch [toc-generator/close/test] not found.',
			'> now branch: ',
			'> Cloning [new-topic] from the remote repo...',
			'[command]git clone --branch=new-topic',
			'[command]git checkout -b "toc-generator/close/test"',
			'  >> stdout',
			'[command]ls -la',
			'  >> stdout',
			'> Running commands...',
			'[command]sudo npm install -g doctoc',
			'  >> stdout',
			'[command]doctoc [Working Directory]/README*.md --title \'**Table of Contents**\' --github',
			'  >> stdout',
			'> Checking diff...',
			'[command]git add --all',
			'  >> stdout',
			'[command]git status --short -uno',
			'> There is no diff.',
			'> Checking references diff...',
			'[command]git fetch --prune --no-recurse-submodules origin +refs/heads/new-topic:refs/remotes/origin/new-topic',
			'[command]git diff HEAD..origin/new-topic --name-only --diff-filter=M',
			'> Closing PullRequest... [toc-generator/close/test]',
			'> Deleting reference... [refs/heads/toc-generator/close/test]',
			'::endgroup::',
			'::group::Total:1  Succeeded:1  Failed:0  Skipped:0',
			'> \x1b[32;40;0m✔\x1b[0m\t[new-topic] There is no reference diff',
			'::endgroup::',
		]);
	});

	it('should create commit', async() => {
		process.env.GITHUB_WORKSPACE   = resolve('test');
		process.env.INPUT_GITHUB_TOKEN = 'test-token';
		const mockStdout               = spyOnStdout();
		setChildProcessParams({
			stdout: (command: string): string => {
				if (command.endsWith('status --short -uno')) {
					return 'M  __tests__/fixtures/test.md';
				}
				if (command.includes(' branch -a ')) {
					return 'test';
				}
				return '';
			},
		});
		setExists(true);

		nock('https://api.github.com')
			.persist()
			.get('/repos/hello/world')
			.reply(200, () => getApiFixture(fixturesDir, 'repos.get'));

		await main(getMainArgs({
			rootDir: undefined,
			context: context('', 'push'),
		}));

		stdoutCalledWith(mockStdout, [
			'::group::Initializing working directory...',
			'[command]rm -rdf ./* ./.[!.]*',
			'::endgroup::',
			'::group::Cloning [test] branch from the remote repo...',
			'[command]git clone --branch=test',
			'[command]git branch -a | grep -E \'^\\*\' | cut -b 3-',
			'  >> test',
			'[command]ls -la',
			'::endgroup::',
			'::group::Running commands...',
			'[command]sudo npm install -g doctoc',
			'[command]doctoc [Working Directory]/README*.md --title \'**Table of Contents**\' --github',
			'::endgroup::',
			'::group::Checking diff...',
			'[command]git add --all',
			'[command]git status --short -uno',
			'::endgroup::',
			'::group::Configuring git committer to be github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>',
			'[command]git config user.name "github-actions[bot]"',
			'[command]git config user.email "41898282+github-actions[bot]@users.noreply.github.com"',
			'::endgroup::',
			'::group::Committing...',
			'[command]git commit -qm "docs: Update TOC"',
			'[command]git show --stat-count=10 HEAD',
			'::endgroup::',
			'::group::Pushing to hello/world@test...',
			'[command]git push origin "test":"refs/heads/test"',
			'::endgroup::',
		]);
	});

	it('should create pull request', async() => {
		process.env.GITHUB_WORKSPACE   = resolve('test');
		process.env.INPUT_GITHUB_TOKEN = 'test-token';
		const mockStdout               = spyOnStdout();
		setChildProcessParams({
			stdout: (command: string): string => {
				if (command.endsWith('status --short -uno')) {
					return 'M  __tests__/fixtures/test.md';
				}
				if (command.includes(' diff ')) {
					return '__tests__/fixtures/test.md';
				}
				if (command.includes(' branch -a ')) {
					return 'test';
				}
				return '';
			},
		});
		setExists(true);

		nock('https://api.github.com')
			.persist()
			.get('/repos/hello/world')
			.reply(200, () => getApiFixture(fixturesDir, 'repos.get'))
			.get('/repos/hello/world/pulls?head=hello%3Atoc-generator%2Fupdate-toc-21031067')
			.reply(200, () => getApiFixture(fixturesDir, 'pulls.list'))
			.post('/repos/hello/world/issues/1347/comments')
			.reply(201)
			.get('/repos/hello/world/pulls/1347')
			.reply(200, () => getApiFixture(fixturesDir, 'pulls.get'));

		await main(getMainArgs({
			rootDir: undefined,
			context: context('synchronize'),
		}));

		stdoutCalledWith(mockStdout, [
			'::group::Initializing working directory...',
			'[command]rm -rdf ./* ./.[!.]*',
			'::endgroup::',
			'::group::Cloning [toc-generator/update-toc-21031067] branch from the remote repo...',
			'[command]git clone --branch=toc-generator/update-toc-21031067',
			'[command]git branch -a | grep -E \'^\\*\' | cut -b 3-',
			'  >> test',
			'> remote branch [toc-generator/update-toc-21031067] not found.',
			'> now branch: test',
			'::endgroup::',
			'::group::Cloning [change] from the remote repo...',
			'[command]git clone --branch=change',
			'[command]git checkout -b "toc-generator/update-toc-21031067"',
			'[command]ls -la',
			'::endgroup::',
			'::group::Running commands...',
			'[command]sudo npm install -g doctoc',
			'[command]doctoc [Working Directory]/README*.md --title \'**Table of Contents**\' --github',
			'::endgroup::',
			'::group::Checking diff...',
			'[command]git add --all',
			'[command]git status --short -uno',
			'::endgroup::',
			'::group::Configuring git committer to be github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>',
			'[command]git config user.name "github-actions[bot]"',
			'[command]git config user.email "41898282+github-actions[bot]@users.noreply.github.com"',
			'::endgroup::',
			'::group::Committing...',
			'[command]git commit -qm "docs: Update TOC"',
			'[command]git show --stat-count=10 HEAD',
			'::endgroup::',
			'::group::Checking references diff...',
			'[command]git fetch --prune --no-recurse-submodules origin +refs/heads/change:refs/remotes/origin/change',
			'[command]git diff HEAD..origin/change --name-only --diff-filter=M',
			'::endgroup::',
			'::group::Pushing to hello/world@toc-generator/update-toc-21031067...',
			'[command]git push origin "toc-generator/update-toc-21031067":"refs/heads/toc-generator/update-toc-21031067"',
			'::endgroup::',
			'::group::Creating comment to PullRequest... [toc-generator/update-toc-21031067] -> [heads/test]',
			'::endgroup::',
			'> \x1b[32;40;0m✔\x1b[0m\t[change] updated',
		]);
	});
});
