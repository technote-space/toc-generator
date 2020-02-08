/* eslint-disable no-magic-numbers */
import { Context } from '@actions/github/lib/context';
import fs from 'fs';
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
import { Logger } from '@technote-space/github-action-helper';
import { main } from '@technote-space/github-action-pr-helper';
import { MainArguments } from '@technote-space/github-action-pr-helper/dist/types';
import { getRunnerArguments } from '../../src/utils/misc';

const rootDir     = resolve(__dirname, '../..');
const doctocDir   = resolve(__dirname, '../fixtures/doctoc');
const fixturesDir = resolve(__dirname, '..', 'fixtures');
const title       = '**test title**';
const setExists   = testFs();
beforeEach(() => {
	Logger.resetForTesting();
});
jest.spyOn(fs, 'writeFileSync').mockImplementation(jest.fn());

const context     = (action: string, event = 'pull_request', ref = 'pull/55/merge'): Context => generateContext({
	owner: 'hello',
	repo: 'world',
	event,
	action,
	ref,
	sha: '7638417db6d59f3c431d3e1f261cc637155684cd',
}, {
	actor: 'test-actor',
	payload: {
		number: 11,
		'pull_request': {
			number: 11,
			id: 21031067,
			head: {
				ref: 'feature/new-feature',
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
			context: context('', 'push', 'refs/tags/v1.2.3'),
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
			context: context('opened', 'pull_request'),
		}));

		stdoutCalledWith(mockStdout, [
			'> This is not target event.',
		]);
	});

	it('should close pull request', async() => {
		process.env.GITHUB_WORKSPACE     = doctocDir;
		process.env.INPUT_GITHUB_TOKEN   = 'test-token';
		process.env.INPUT_PR_BRANCH_NAME = 'close/test';
		process.env.INPUT_TOC_TITLE      = title;
		const mockStdout                 = spyOnStdout();

		nock('https://api.github.com')
			.persist()
			.get('/repos/hello/world')
			.reply(200, () => getApiFixture(fixturesDir, 'repos.get'))
			.get('/repos/hello/world/pulls?sort=created&direction=asc&per_page=100&page=1')
			.reply(200, () => getApiFixture(fixturesDir, 'pulls.list'))
			.get('/repos/hello/world/pulls?sort=created&direction=asc&per_page=100&page=2')
			.reply(200, () => [])
			.get('/repos/hello/world/pulls?sort=created&direction=asc&head=hello%3Amaster&per_page=100&page=1')
			.reply(200, () => [])
			.get('/repos/octocat/Hello-World')
			.reply(200, () => getApiFixture(fixturesDir, 'repos.get'))
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
			'> Fetching...',
			'[command]git init \'.\'',
			'  >> stdout',
			'[command]git remote add origin',
			'[command]git fetch origin',
			'  >> stdout',
			'> Switching branch to [toc-generator/close/test]...',
			'[command]git checkout -b toc-generator/close/test origin/toc-generator/close/test',
			'  >> stdout',
			'> remote branch [toc-generator/close/test] not found.',
			'> now branch: ',
			'> Cloning [new-topic] from the remote repo...',
			'[command]git checkout -b new-topic origin/new-topic',
			'  >> stdout',
			'[command]git checkout -b toc-generator/close/test',
			'  >> stdout',
			'[command]ls -la',
			'  >> stdout',
			'> Running commands...',
			'[command]DocToccing single file "[Working Directory]/README.create1.md".',
			'[command]DocToccing single file "[Working Directory]/README.create2.md".',
			'[command]DocToccing single file "[Working Directory]/README.not.update.md".',
			'[command]DocToccing single file "[Working Directory]/README.update.md".',
			'[command]Run doctoc',
			'  >> changed:',
			'  >>   - [Working Directory]/README.create1.md',
			'  >>   - [Working Directory]/README.create2.md',
			'  >>   - [Working Directory]/README.update.md',
			'  >> unchanged:',
			'  >>   - [Working Directory]/README.not.update.md',
			'> Checking diff...',
			'[command]git add --all',
			'  >> stdout',
			'[command]git status --short -uno',
			'> There is no diff.',
			'> Checking references diff...',
			'[command]git fetch --prune --no-recurse-submodules origin +refs/heads/new-topic:refs/remotes/origin/new-topic',
			'[command]git diff \'HEAD..origin/new-topic\' --name-only \'--diff-filter=M\'',
			'> Closing PullRequest... [toc-generator/close/test]',
			'> Deleting reference... [refs/heads/toc-generator/close/test]',
			'::endgroup::',
			'::group::Total:2  Succeeded:1  Failed:0  Skipped:1',
			'> \x1b[32;40;0m✔\x1b[0m\t[new-topic] has been closed because there is no reference diff',
			'> \x1b[33;40;0m→\x1b[0m\t[master] duplicated (toc-generator/close/test)',
			'::endgroup::',
		]);
	});

	it('should create commit', async() => {
		process.env.GITHUB_WORKSPACE   = doctocDir;
		process.env.INPUT_GITHUB_TOKEN = 'test-token';
		process.env.INPUT_TOC_TITLE    = title;
		const mockStdout               = spyOnStdout();
		setChildProcessParams({
			stdout: (command: string): string => {
				if (command.endsWith('status --short -uno')) {
					return 'M  __tests__/fixtures/test.md';
				}
				if (command.includes(' rev-parse')) {
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
			context: context('', 'push', 'refs/heads/test'),
		}));

		stdoutCalledWith(mockStdout, [
			'::group::Fetching...',
			'[command]rm -rdf [Working Directory]',
			'[command]git init \'.\'',
			'[command]git remote add origin',
			'[command]git fetch origin',
			'::endgroup::',
			'::group::Switching branch to [test]...',
			'[command]git checkout -b test origin/test',
			'[command]git rev-parse --abbrev-ref HEAD',
			'  >> test',
			'[command]ls -la',
			'::endgroup::',
			'::group::Running commands...',
			'[command]DocToccing single file "[Working Directory]/README.create1.md".',
			'[command]DocToccing single file "[Working Directory]/README.create2.md".',
			'[command]DocToccing single file "[Working Directory]/README.not.update.md".',
			'[command]DocToccing single file "[Working Directory]/README.update.md".',
			'[command]Run doctoc',
			'  >> changed:',
			'  >>   - [Working Directory]/README.create1.md',
			'  >>   - [Working Directory]/README.create2.md',
			'  >>   - [Working Directory]/README.update.md',
			'  >> unchanged:',
			'  >>   - [Working Directory]/README.not.update.md',
			'::endgroup::',
			'::group::Checking diff...',
			'[command]git add --all',
			'[command]git status --short -uno',
			'::endgroup::',
			'::group::Configuring git committer to be test-actor <test-actor@users.noreply.github.com>',
			'[command]git config \'user.name\' test-actor',
			'[command]git config \'user.email\' \'test-actor@users.noreply.github.com\'',
			'::endgroup::',
			'::group::Committing...',
			'[command]git commit -qm \'docs: Update TOC\'',
			'[command]git show \'--stat-count=10\' HEAD',
			'::endgroup::',
			'::group::Pushing to hello/world@test...',
			'[command]git push origin test:refs/heads/test',
			'::endgroup::',
			'> \x1b[32;40;0m✔\x1b[0m\t[feature/new-feature] updated',
		]);
	});

	it('should create pull request', async() => {
		process.env.GITHUB_WORKSPACE       = doctocDir;
		process.env.INPUT_GITHUB_TOKEN     = 'test-token';
		process.env.INPUT_TOC_TITLE        = title;
		process.env.INPUT_TARGET_PATHS     = 'README.update.md';
		process.env.INPUT_FOLDING          = 'true';
		process.env.INPUT_MAX_HEADER_LEVEL = '1';
		process.env.INPUT_ENTRY_PREFIX     = '☆';
		const mockStdout                   = spyOnStdout();
		setChildProcessParams({
			stdout: (command: string): string => {
				if (command.endsWith('status --short -uno')) {
					return 'M  __tests__/fixtures/test.md';
				}
				if (command.includes(' diff ')) {
					return '__tests__/fixtures/test.md';
				}
				if (command.includes(' rev-parse')) {
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
			.get('/repos/hello/world/pulls?head=hello%3Atest')
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
			'::group::Fetching...',
			'[command]rm -rdf [Working Directory]',
			'[command]git init \'.\'',
			'[command]git remote add origin',
			'[command]git fetch origin',
			'::endgroup::',
			'::group::Switching branch to [toc-generator/update-toc-21031067]...',
			'[command]git checkout -b toc-generator/update-toc-21031067 origin/toc-generator/update-toc-21031067',
			'[command]git rev-parse --abbrev-ref HEAD',
			'  >> test',
			'> remote branch [toc-generator/update-toc-21031067] not found.',
			'> now branch: test',
			'::endgroup::',
			'::group::Cloning [feature/new-feature] from the remote repo...',
			'[command]git checkout -b feature/new-feature origin/feature/new-feature',
			'[command]git checkout -b toc-generator/update-toc-21031067',
			'[command]ls -la',
			'::endgroup::',
			'::group::Running commands...',
			'[command]DocToccing single file "[Working Directory]/README.update.md".',
			'[command]Run doctoc',
			'  >> changed:',
			'  >>   - [Working Directory]/README.update.md',
			'  >> unchanged:',
			'::endgroup::',
			'::group::Checking diff...',
			'[command]git add --all',
			'[command]git status --short -uno',
			'::endgroup::',
			'::group::Configuring git committer to be test-actor <test-actor@users.noreply.github.com>',
			'[command]git config \'user.name\' test-actor',
			'[command]git config \'user.email\' \'test-actor@users.noreply.github.com\'',
			'::endgroup::',
			'::group::Committing...',
			'[command]git commit -qm \'docs: Update TOC\'',
			'[command]git show \'--stat-count=10\' HEAD',
			'::endgroup::',
			'::group::Checking references diff...',
			'[command]git fetch --prune --no-recurse-submodules origin +refs/heads/feature/new-feature:refs/remotes/origin/feature/new-feature',
			'[command]git diff \'HEAD..origin/feature/new-feature\' --name-only \'--diff-filter=M\'',
			'::endgroup::',
			'::group::Pushing to hello/world@toc-generator/update-toc-21031067...',
			'[command]git push origin toc-generator/update-toc-21031067:refs/heads/toc-generator/update-toc-21031067',
			'::endgroup::',
			'::group::Creating comment to PullRequest...',
			'::endgroup::',
			'> \x1b[32;40;0m✔\x1b[0m\t[feature/new-feature] updated',
		]);
	});
});
