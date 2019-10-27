/* eslint-disable no-magic-numbers */
import { Context } from '@actions/github/lib/context';
import nock from 'nock';
import path from 'path';
import {
	generateContext,
	testEnv,
	testFs,
	disableNetConnect,
	spyOnStdout,
	stdoutCalledWith,
	stdoutContains,
	getApiFixture,
	setChildProcessParams,
	testChildProcess,
} from '@technote-space/github-action-test-helper';
import { Logger } from '@technote-space/github-action-helper';
import { execute } from '../../src/utils/process';

const rootDir = path.resolve(__dirname, '..', 'fixtures');
const setExists = testFs();
beforeEach(() => {
	Logger.resetForTesting();
});

const context = (action: string, event = 'pull_request'): Context => generateContext({
	owner: 'hello',
	repo: 'world',
	event,
	action,
	ref: 'heads/test',
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
		},
	},
});

describe('execute', () => {
	disableNetConnect(nock);
	testEnv();
	testChildProcess();

	it('should close pull request', async() => {
		process.env.INPUT_GITHUB_TOKEN = 'test-token';
		process.env.INPUT_PR_BRANCH_NAME = 'create/test';
		const mockStdout = spyOnStdout();

		nock('https://api.github.com')
			.persist()
			.get('/repos/hello/world/pulls?head=hello%3Acreate%2Ftest')
			.reply(200, () => getApiFixture(rootDir, 'pulls.list'))
			.patch('/repos/hello/world/pulls/1347')
			.reply(200, () => getApiFixture(rootDir, 'pulls.update'));

		await execute(new Logger(), context('closed'));

		stdoutCalledWith(mockStdout, [
			'::group::Closing PullRequest... [create/test]',
			'::endgroup::',
		]);
	});

	it('should do nothing', async() => {
		process.env.INPUT_GITHUB_TOKEN = 'test-token';
		process.env.INPUT_TARGET_PATHS = '/test';
		const mockStdout = spyOnStdout();
		setExists(true);

		await execute(new Logger(), context('synchronize'));

		stdoutCalledWith(mockStdout, [
			'::group::Running DocToc and getting changed files',
			'::warning::There is no valid target. Please check if [TARGET_PATHS] is set correctly.',
		]);
	});

	it('should create pull request', async() => {
		process.env.INPUT_GITHUB_TOKEN = 'test-token';
		process.env.INPUT_PR_BRANCH_NAME = 'create/test';
		const mockStdout = spyOnStdout();
		setChildProcessParams({stdout: 'M  __tests__/fixtures/test.md'});
		setExists(true);

		nock('https://api.github.com')
			.persist()
			.post('/repos/hello/world/git/blobs')
			.reply(201, () => {
				return getApiFixture(rootDir, 'repos.git.blobs');
			})
			.get('/repos/hello/world/git/commits/7638417db6d59f3c431d3e1f261cc637155684cd')
			.reply(200, () => getApiFixture(rootDir, 'repos.git.commits.get'))
			.post('/repos/hello/world/git/trees')
			.reply(201, () => getApiFixture(rootDir, 'repos.git.trees'))
			.post('/repos/hello/world/git/commits')
			.reply(201, () => getApiFixture(rootDir, 'repos.git.commits'))
			.post('/repos/hello/world/git/refs')
			.reply(201, () => getApiFixture(rootDir, 'repos.git.refs.create'))
			.get('/repos/hello/world/pulls?head=hello%3Acreate%2Ftest')
			.reply(200, () => getApiFixture(rootDir, 'pulls.list'))
			.patch('/repos/hello/world/pulls/1347')
			.reply(200, () => getApiFixture(rootDir, 'pulls.update'));

		await execute(new Logger(), context('synchronize'));

		stdoutContains(mockStdout, [
			'::group::Creating reference... [refs/heads/create/test] [7638417db6d59f3c431d3e1f261cc637155684cd]',
			'::group::Updating PullRequest... [create/test] -> [heads/test]',
		]);
	});

	it('should create commit', async() => {
		process.env.INPUT_GITHUB_TOKEN = 'test-token';
		const mockStdout = spyOnStdout();
		setChildProcessParams({stdout: 'M  __tests__/fixtures/test.md'});
		setExists(true);

		nock('https://api.github.com')
			.persist()
			.post('/repos/hello/world/git/blobs')
			.reply(201, () => {
				return getApiFixture(rootDir, 'repos.git.blobs');
			})
			.get('/repos/hello/world/git/commits/7638417db6d59f3c431d3e1f261cc637155684cd')
			.reply(200, () => getApiFixture(rootDir, 'repos.git.commits.get'))
			.post('/repos/hello/world/git/trees')
			.reply(201, () => getApiFixture(rootDir, 'repos.git.trees'))
			.post('/repos/hello/world/git/commits')
			.reply(201, () => getApiFixture(rootDir, 'repos.git.commits'))
			.patch('/repos/hello/world/git/refs/' + encodeURIComponent('heads/test'))
			.reply(200, () => getApiFixture(rootDir, 'repos.git.refs.update'));

		await execute(new Logger(), context('', 'push'));

		stdoutContains(mockStdout, [
			'::group::Creating commit... [cd8274d15fa3ae2ab983129fb037999f264ba9a7]',
			'::group::Updating ref... [heads%2Ftest] [7638417db6d59f3c431d3e1f261cc637155684cd]',
		]);
	});
});
