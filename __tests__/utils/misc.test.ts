/* eslint-disable no-magic-numbers */
import fs from 'fs';
import path from 'path';
import { isTargetEvent } from '@technote-space/filter-github-action';
import { testEnv, getContext } from '@technote-space/github-action-test-helper';
import {
	getDocTocArgs,
	getWorkDir,
	getCommitMessage,
} from '../../src/utils/misc';
import { DEFAULT_COMMIT_MESSAGE, TARGET_EVENTS } from '../../src/constant';

describe('isTargetEvent', () => {
	it('should return true 1', () => {
		expect(isTargetEvent(TARGET_EVENTS, getContext({
			ref: 'refs/heads/test',
			eventName: 'push',
		}))).toBeTruthy();
	});

	it('should return true 2', () => {
		expect(isTargetEvent(TARGET_EVENTS, getContext({
			ref: 'refs/heads/test',
			payload: {
				action: undefined,
			},
			eventName: 'push',
		}))).toBeTruthy();
	});

	it('should return false 1', () => {
		expect(isTargetEvent(TARGET_EVENTS, getContext({
			ref: 'refs/heads/test',
			payload: {
				action: 'opened',
			},
			eventName: 'pull_request',
		}))).toBeFalsy();
	});

	it('should return false 2', () => {
		expect(isTargetEvent(TARGET_EVENTS, getContext({
			ref: 'refs/tags/test',
			eventName: 'push',
		}))).toBeFalsy();
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
