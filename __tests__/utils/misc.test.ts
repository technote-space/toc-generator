/* eslint-disable no-magic-numbers */
import fs from 'fs';
import path from 'path';
import { testEnv, getContext } from '@technote-space/github-action-test-helper';
import {
	getDocTocArgs,
	getWorkDir,
	getCommitMessage,
	isTargetContext,
} from '../../src/utils/misc';
import { DEFAULT_COMMIT_MESSAGE } from '../../src/constant';

describe('isTargetContext', () => {
	testEnv();

	it('should return true 1', () => {
		expect(isTargetContext(getContext({
			ref: 'refs/heads/test',
			eventName: 'push',
		}))).toBe(true);
	});

	it('should return true 2', () => {
		expect(isTargetContext(getContext({
			ref: 'refs/heads/test',
			payload: {
				action: undefined,
			},
			eventName: 'push',
		}))).toBe(true);
	});

	it('should return true 3', () => {
		expect(isTargetContext(getContext({
			payload: {
				action: 'opened',
				'pull_request': {
					labels: [],
				},
			},
			eventName: 'pull_request',
		}))).toBe(true);
	});

	it('should return true 4', () => {
		process.env.INPUT_INCLUDE_LABELS = 'label2';
		expect(isTargetContext(getContext({
			payload: {
				action: 'synchronize',
				'pull_request': {
					labels: [{name: 'label1'}, {name: 'label2'}],
				},
			},
			eventName: 'pull_request',
		}))).toBe(true);
	});

	it('should return true 5', () => {
		process.env.INPUT_INCLUDE_LABELS = 'label1,label2\nlabel3';
		expect(isTargetContext(getContext({
			payload: {
				action: 'synchronize',
				'pull_request': {
					labels: [{name: 'label2'}],
				},
			},
			eventName: 'pull_request',
		}))).toBe(true);
	});

	it('should return true 6', () => {
		process.env.INPUT_BRANCH_PREFIX = 'master';
		expect(isTargetContext(getContext({
			ref: 'refs/heads/master',
			eventName: 'push',
		}))).toBe(true);
	});

	it('should return true 7', () => {
		process.env.INPUT_BRANCH_PREFIX = 'master';
		process.env.INPUT_INCLUDE_LABELS = 'label';
		expect(isTargetContext(getContext({
			ref: 'refs/heads/master',
			eventName: 'push',
		}))).toBe(true);
	});

	it('should return false 1', () => {
		expect(isTargetContext(getContext({
			ref: 'refs/tags/test',
			eventName: 'push',
		}))).toBe(false);
	});

	it('should return false 2', () => {
		process.env.INPUT_INCLUDE_LABELS = 'test2';
		expect(isTargetContext(getContext({
			payload: {
				action: 'opened',
				'pull_request': {
					labels: [{name: 'label1'}],
				},
			},
			eventName: 'pull_request',
		}))).toBe(false);
	});

	it('should return false 3', () => {
		process.env.INPUT_BRANCH_PREFIX = 'master';
		expect(isTargetContext(getContext({
			ref: 'refs/heads/test',
			payload: {
				action: undefined,
			},
			eventName: 'push',
		}))).toBe(false);
	});

	it('should return false 4', () => {
		process.env.INPUT_BRANCH_PREFIX = 'master';
		process.env.INPUT_INCLUDE_LABELS = 'label1';
		expect(isTargetContext(getContext({
			ref: 'refs/heads/master',
			action: 'synchronize',
			'pull_request': {
				labels: [{name: 'label2'}],
			},
			eventName: 'pull_request',
		}))).toBe(false);
	});

	it('should return false 5', () => {
		process.env.INPUT_BRANCH_PREFIX = 'master';
		process.env.INPUT_INCLUDE_LABELS = 'label1';
		expect(isTargetContext(getContext({
			ref: 'refs/heads/feature/test',
			action: 'synchronize',
			'pull_request': {
				labels: [{name: 'label1'}],
			},
			eventName: 'pull_request',
		}))).toBe(false);
	});
});

describe('getDocTocArgs', () => {
	testEnv();

	it('should get DocToc args', () => {
		process.env.GITHUB_WORKSPACE = '/tmp/workspace';
		process.env.INPUT_TARGET_PATHS = 'README.md,.github/CONTRIBUTING.md,/test/README.md';
		process.env.INPUT_TOC_TITLE = '**Table of Contents**';
		expect(getDocTocArgs()).toBe('/tmp/workspace/.work/README.md /tmp/workspace/.work/.github/CONTRIBUTING.md --title \'**Table of Contents**\'');
	});

	it('should get default DocToc args', () => {
		process.env.GITHUB_WORKSPACE = '/tmp/workspace';
		expect(getDocTocArgs()).toBe('/tmp/workspace/.work/README.md --notitle');
	});

	it('should return false', () => {
		process.env.GITHUB_WORKSPACE = '/tmp/workspace';
		process.env.INPUT_TARGET_PATHS = '..';
		expect(getDocTocArgs()).toBe(false);
	});
});

describe('getWorkDir', () => {
	testEnv();

	it('should get working dir', () => {
		process.env.GITHUB_WORKSPACE = '/tmp/workspace';
		expect(getWorkDir()).toBe('/tmp/workspace/.work');
	});

	it('should get working dir', () => {
		process.env.GITHUB_WORKSPACE = undefined;
		if (!fs.existsSync(path.resolve('.git'))) {
			fs.mkdirSync(path.resolve('.git'));
		}
		expect(getWorkDir()).toBe(path.resolve('.'));
	});
});

describe('getCommitMessage', () => {
	testEnv();

	it('should get commit message', () => {
		process.env.INPUT_COMMIT_MESSAGE = 'test';
		expect(getCommitMessage()).toBe('test');
	});

	it('should get default commit message', () => {
		expect(getCommitMessage()).toBe(DEFAULT_COMMIT_MESSAGE);
	});
});
