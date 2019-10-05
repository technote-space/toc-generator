/* eslint-disable no-magic-numbers */
import path from 'path';
import {
	getContext,
	testEnv,
	testFs,
	spyOnExec,
	execCalledWith,
	spyOnStdout,
	stdoutCalledWith,
	setChildProcessParams,
	testChildProcess,
} from '@technote-space/github-action-test-helper';
import { Logger } from '@technote-space/github-action-helper';
import {
	replaceDirectory,
	clone,
	runDocToc,
	commit,
	getDiff,
	getChangedFiles,
} from '../../src/utils/command';

const setExists = testFs();
beforeEach(() => {
	Logger.resetForTesting();
});

describe('replaceDirectory', () => {
	testEnv();

	it('should replace working directory', () => {
		process.env.GITHUB_WORKSPACE = 'test-dir';
		const workDir = path.resolve('test-dir/.work');

		expect(replaceDirectory(`git -C ${workDir} fetch`)).toBe('git fetch');
	});
});

describe('clone', () => {
	testEnv();
	testChildProcess();

	it('should run clone command', async() => {
		process.env.INPUT_GITHUB_TOKEN = 'test-token';
		process.env.GITHUB_WORKSPACE = 'test-dir';
		setChildProcessParams({stdout: 'test-branch'});
		const mockExec = spyOnExec();
		const mockStdout = spyOnStdout();

		await clone(getContext({
			ref: 'refs/heads/test-branch',
		}));

		const dir = path.resolve('test-dir', '.work');
		execCalledWith(mockExec, [
			`git -C ${dir} clone --branch=test-branch --depth=3 https://octocat:test-token@github.com//.git . > /dev/null 2>&1 || :`,
		]);
		stdoutCalledWith(mockStdout, [
			'::group::Cloning from the remote repo...',
			'[command]git clone --branch=test-branch --depth=3',
		]);
	});
});

describe('runDocToc', () => {
	testEnv();

	it('should do nothing', async() => {
		process.env.INPUT_TARGET_PATHS = '../test.md';
		const mockStdout = spyOnStdout();

		expect(await runDocToc()).toBe(false);

		stdoutCalledWith(mockStdout, [
			'::warning::There is no valid target. Please check if [TARGET_PATHS] is set correctly.',
		]);
	});

	it('should run doctoc', async() => {
		process.env.GITHUB_WORKSPACE = 'test-dir';
		setChildProcessParams({stdout: ''});
		const mockExec = spyOnExec();
		const mockStdout = spyOnStdout();

		expect(await runDocToc()).toBe(true);

		const dir = path.resolve('test-dir/.work');
		execCalledWith(mockExec, [
			'rm -f package.json',
			'rm -f package-lock.json',
			'rm -f yarn.lock',
			'yarn add doctoc',
			`node_modules/.bin/doctoc ${dir}/README.md --notitle --github`,
		]);
		stdoutCalledWith(mockStdout, [
			'::group::Running Doctoc...',
			'[command]rm -f package.json',
			'[command]rm -f package-lock.json',
			'[command]rm -f yarn.lock',
			'[command]yarn add doctoc',
			'[command]node_modules/.bin/doctoc <Working Directory>/README.md --notitle --github',
		]);
	});
});

describe('commit', () => {
	testEnv();

	it('should run git commit', async() => {
		process.env.GITHUB_WORKSPACE = 'test-dir';
		const mockExec = spyOnExec();

		await commit();

		execCalledWith(mockExec, [
			'git add --all',
		]);
	});
});

describe('getDiff', () => {
	testEnv();
	testChildProcess();

	it('should get diff', async() => {
		process.env.GITHUB_WORKSPACE = 'test-dir';
		setChildProcessParams({stdout: 'M  test1.txt\nM  test2.md\nA  test3.md'});
		const mockExec = spyOnExec();

		expect(await getDiff()).toEqual(['test2.md']);

		const dir = path.resolve('test-dir/.work');
		execCalledWith(mockExec, [
			`git -C ${dir} status --short -uno`,
		]);
	});
});

describe('getChangedFiles', () => {
	testEnv();
	testChildProcess();

	it('should return false', async() => {
		process.env.INPUT_GITHUB_TOKEN = 'test-token';
		process.env.GITHUB_WORKSPACE = 'test-dir';
		process.env.INPUT_TARGET_PATHS = '../test.md';
		setChildProcessParams({stdout: 'test'});
		setExists([false, false, false, true]);

		expect(await getChangedFiles(getContext({
			ref: 'refs/heads/test',
		}))).toBe(false);
	});

	it('should get changed files', async() => {
		process.env.INPUT_GITHUB_TOKEN = 'test-token';
		process.env.GITHUB_WORKSPACE = 'test-dir';
		setChildProcessParams({stdout: 'test'});
		setExists(true);

		expect(await getChangedFiles(getContext({
			ref: 'refs/heads/test',
		}))).toEqual([]);
	});
});
