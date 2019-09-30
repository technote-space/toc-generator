import path from 'path';
import {
	getContext,
	testEnv,
	testFs,
	testChildProcess,
	spyOnExec,
	execCalledWith,
	spyOnStdout,
	stdoutCalledWith,
	setChildProcessParams,
} from '@technote-space/github-action-test-helper';
import { Logger } from '@technote-space/github-action-helper';
import {
	replaceDirectory,
	getCurrentBranchName,
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

describe('getCurrentBranchName', () => {
	testEnv();
	testChildProcess();

	it('should return empty', async() => {
		const mockExec = spyOnExec();

		expect(await getCurrentBranchName()).toBe('');

		execCalledWith(mockExec, []);
	});

	it('should return stdout', async() => {
		process.env.GITHUB_WORKSPACE = 'test-dir';
		setExists(true);
		const mockExec = spyOnExec();

		expect(await getCurrentBranchName()).toBe('stdout');

		const dir = path.resolve('test-dir');
		execCalledWith(mockExec, [
			`git -C ${dir} branch -a | grep -E '^\\*' | cut -b 3-`,
		]);
	});
});

describe('clone', () => {
	testEnv();

	it('should return false', async() => {
		process.env.GITHUB_WORKSPACE = 'test-dir';
		const mockExec = spyOnExec();
		const mockStdout = spyOnStdout();

		expect(await clone(getContext({
			ref: 'refs/heads/test',
		}))).toBeFalsy();

		const dir = path.resolve('test-dir/.work');
		execCalledWith(mockExec, [
			`git -C ${dir} clone --quiet --branch=test --depth=3 https://github.com//.git . || :`,
		]);
		stdoutCalledWith(mockStdout, [
			'::group::Cloning the branch test from the remote repo',
			'[command]git clone --quiet --branch=test --depth=3 https://github.com//.git .',
			'  >> stdout',
			'::warning::remote branch [test] not found',
		]);
	});

	it('should return true', async() => {
		process.env.GITHUB_WORKSPACE = 'test-dir';
		setExists(true);
		setChildProcessParams({stdout: 'test-branch'});
		const mockExec = spyOnExec();
		const mockStdout = spyOnStdout();

		expect(await clone(getContext({
			ref: 'refs/heads/test-branch',
		}))).toBeTruthy();

		const dir = path.resolve('test-dir');
		execCalledWith(mockExec, [
			`git -C ${dir} clone --quiet --branch=test-branch --depth=3 https://github.com//.git . || :`,
			`git -C ${dir} branch -a | grep -E '^\\*' | cut -b 3-`,
		]);
		stdoutCalledWith(mockStdout, [
			'::group::Cloning the branch test-branch from the remote repo',
			'[command]git clone --quiet --branch=test-branch --depth=3 https://github.com//.git .',
			'  >> test-branch',
			'[command]git branch -a | grep -E \'^\\*\' | cut -b 3-',
			'  >> test-branch',
		]);
	});
});

describe('runDocToc', () => {
	testEnv();

	it('should do nothing', async() => {
		process.env.INPUT_TARGET_PATHS = '../test.md';
		const mockStdout = spyOnStdout();

		expect(await runDocToc()).toBeFalsy();

		stdoutCalledWith(mockStdout, [
			'::warning::There is no valid target. Please check if [TARGET_PATHS] is set correctly.',
		]);
	});

	it('should run doctoc', async() => {
		process.env.GITHUB_WORKSPACE = 'test-dir';
		const mockExec = spyOnExec();
		const mockStdout = spyOnStdout();

		expect(await runDocToc()).toBeTruthy();

		const dir = path.resolve('test-dir/.work');
		execCalledWith(mockExec, [
			`yarn --cwd ${dir} add doctoc`,
			`${dir}/node_modules/.bin/doctoc ${dir}/README.md --notitle --github`,
		]);
		stdoutCalledWith(mockStdout, [
			'::group::Running Doctoc',
			'[command]yarn --cwd <Working Directory> add doctoc',
			`[command]<Working Directory>/node_modules/.bin/doctoc ${dir}/README.md --notitle --github`,
			'  >> test-branch',
		]);
	});
});

describe('commit', () => {
	testEnv();

	it('should run git commit', async() => {
		process.env.GITHUB_WORKSPACE = 'test-dir';
		const mockExec = spyOnExec();

		await commit();

		const dir = path.resolve('test-dir/.work');
		execCalledWith(mockExec, [
			`git -C ${dir} add --all`,
		]);
	});
});

describe('getDiff', () => {
	testEnv();

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

	it('should return false 1', async() => {
		process.env.GITHUB_WORKSPACE = 'test-dir';

		expect(await getChangedFiles(getContext({
			ref: 'refs/heads/test',
		}))).toBeFalsy();
	});

	it('should return false 2', async() => {
		process.env.GITHUB_WORKSPACE = 'test-dir';
		process.env.INPUT_TARGET_PATHS = '../test.md';
		setChildProcessParams({stdout: 'test'});
		setExists([false, false, false, true]);

		expect(await getChangedFiles(getContext({
			ref: 'refs/heads/test',
		}))).toBeFalsy();
	});

	it('should get changed files', async() => {
		process.env.GITHUB_WORKSPACE = 'test-dir';
		setChildProcessParams({stdout: 'test'});
		setExists(true);

		expect(await getChangedFiles(getContext({
			ref: 'refs/heads/test',
		}))).toEqual([]);
	});
});
