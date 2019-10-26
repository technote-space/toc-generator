/* eslint-disable no-magic-numbers */
import fs from 'fs';
import path from 'path';
import { testEnv, getContext, generateContext } from '@technote-space/github-action-test-helper';
import {
	getDocTocArgs,
	getWorkDir,
	getCommitMessage,
	getPrBranchName,
	getPrTitle,
	getPrLink,
	getPrBody,
	isDisabledDeletePackage,
	isTargetContext,
	isCreatePR,
} from '../../src/utils/misc';
import { DEFAULT_COMMIT_MESSAGE, DEFAULT_PR_TITLE } from '../../src/constant';

describe('isTargetContext', () => {
	testEnv();

	it('should return true 1', () => {
		expect(isTargetContext(generateContext({
			ref: 'heads/test',
			event: 'push',
		}))).toBe(true);
	});

	it('should return true 2', () => {
		expect(isTargetContext(generateContext({
			ref: 'heads/test',
			event: 'push',
		}))).toBe(true);
	});

	it('should return true 3', () => {
		expect(isTargetContext(generateContext({
			event: 'pull_request',
			action: 'opened',
		}, {
			payload: {
				'pull_request': {
					labels: [],
				},
			},
		}))).toBe(true);
	});

	it('should return true 4', () => {
		process.env.INPUT_INCLUDE_LABELS = 'label2';
		expect(isTargetContext(generateContext({
			event: 'pull_request',
			action: 'synchronize',
		}, {
			payload: {
				'pull_request': {
					labels: [{name: 'label1'}, {name: 'label2'}],
				},
			},
		}))).toBe(true);
	});

	it('should return true 5', () => {
		process.env.INPUT_INCLUDE_LABELS = 'label1,label2\nlabel3';
		expect(isTargetContext(generateContext({
			event: 'pull_request',
			action: 'synchronize',
		}, {
			payload: {
				'pull_request': {
					labels: [{name: 'label2'}],
				},
			},
		}))).toBe(true);
	});

	it('should return true 6', () => {
		process.env.INPUT_BRANCH_PREFIX = 'master';
		expect(isTargetContext(generateContext({
			ref: 'heads/master',
			event: 'push',
		}))).toBe(true);
	});

	it('should return true 7', () => {
		process.env.INPUT_BRANCH_PREFIX = 'master';
		process.env.INPUT_INCLUDE_LABELS = 'label';
		expect(isTargetContext(generateContext({
			ref: 'heads/master',
			event: 'push',
		}))).toBe(true);
	});

	it('should return true 8', () => {
		process.env.INPUT_PR_BRANCH_NAME = 'toc/test';
		expect(isTargetContext(generateContext({
			event: 'pull_request',
			action: 'opened',
		}, {
			payload: {
				'pull_request': {
					labels: [],
				},
			},
		}))).toBe(true);
	});

	it('should return true 9', () => {
		process.env.INPUT_PR_BRANCH_NAME = 'toc/test';
		expect(isTargetContext(generateContext({
			event: 'pull_request',
			action: 'closed',
		}))).toBe(true);
	});

	it('should return false 1', () => {
		expect(isTargetContext(generateContext({
			ref: 'tags/test',
			event: 'push',
		}))).toBe(false);
	});

	it('should return false 2', () => {
		process.env.INPUT_INCLUDE_LABELS = 'test2';
		expect(isTargetContext(generateContext({
			event: 'pull_request',
			action: 'opened',
		}, {
			payload: {
				'pull_request': {
					labels: [{name: 'label1'}],
				},
			},
		}))).toBe(false);
	});

	it('should return false 3', () => {
		process.env.INPUT_BRANCH_PREFIX = 'master';
		expect(isTargetContext(generateContext({
			ref: 'heads/test',
			event: 'push',
		}))).toBe(false);
	});

	it('should return false 4', () => {
		process.env.INPUT_BRANCH_PREFIX = 'master';
		process.env.INPUT_INCLUDE_LABELS = 'label1';
		expect(isTargetContext(generateContext({
			ref: 'heads/master',
			event: 'pull_request',
			action: 'synchronize',
		}, {
			payload: {
				'pull_request': {
					labels: [{name: 'label2'}],
				},
			},
		}))).toBe(false);
	});

	it('should return false 5', () => {
		process.env.INPUT_BRANCH_PREFIX = 'master';
		process.env.INPUT_INCLUDE_LABELS = 'label1';
		expect(isTargetContext(generateContext({
			ref: 'heads/feature/test',
			event: 'push',
		}))).toBe(false);
	});

	it('should return false 6', () => {
		process.env.INPUT_PR_BRANCH_NAME = 'toc/test';
		expect(isTargetContext(generateContext({
			ref: 'heads/master',
			event: 'push',
		}))).toBe(false);
	});

	it('should return false 7', () => {
		expect(isTargetContext(generateContext({
			event: 'pull_request',
			action: 'closed',
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

describe('getPrBranchName', () => {
	testEnv();
	const context = getContext({
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

	it('should get branch name', () => {
		process.env.INPUT_PR_BRANCH_NAME = '${PR_NUMBER}-${PR_ID}-${PR_HEAD_REF}-${PR_BASE_REF}';
		expect(getPrBranchName(context)).toBe('11-21031067-change-master');
	});

	it('should get empty', () => {
		expect(getPrBranchName(context)).toBeFalsy();
	});

	it('should throw error', () => {
		expect(() => getPrBranchName(getContext({}))).toThrow();
	});
});

describe('getPrTitle', () => {
	testEnv();
	const context = getContext({
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

	it('should get PR title', () => {
		process.env.INPUT_PR_TITLE = '${PR_NUMBER}-${PR_ID}-${PR_HEAD_REF}-${PR_BASE_REF}';
		expect(getPrTitle(context)).toBe('11-21031067-change-master');
	});

	it('should get default PR title', () => {
		expect(getPrTitle(context)).toBe(DEFAULT_PR_TITLE);
	});

	it('should throw error', () => {
		process.env.INPUT_PR_TITLE = '${PR_NUMBER}-${PR_ID}-${PR_HEAD_REF}-${PR_BASE_REF}';
		expect(() => getPrTitle(getContext({}))).toThrow();
	});
});

describe('getPrLink', () => {
	it('should get pr link', () => {
		expect(getPrLink(generateContext({
			ref: 'heads/test',
			event: 'push',
		}, {
			payload: {
				'pull_request': {
					title: 'test title',
					'html_url': 'http://example.com',
				},
			},
		}))).toEqual(['[test title](http://example.com)', '']);
	});

	it('should get empty', () => {
		expect(getPrLink(getContext({}))).toEqual([]);
	});
});

describe('getPrBody', () => {
	const context = getContext({
		ref: 'refs/heads/test',
		eventName: 'push',
		payload: {
			'pull_request': {
				title: 'test title',
				'html_url': 'http://example.com',
			},
		},
	});

	it('should get PR Body', () => {
		expect(getPrBody(context, ['README.md', 'CHANGELOG.md'])).toBe([
			'## Updated TOC',
			'',
			'[test title](http://example.com)',
			'',
			'<details>',
			'',
			'<summary>Changed files</summary>',
			'',
			'- README.md',
			'- CHANGELOG.md',
			'',
			'</details>',
		].join('\n'));
	});

	it('should get PR Body', () => {
		expect(getPrBody(context, ['README.md'])).toBe([
			'## Updated TOC',
			'',
			'[test title](http://example.com)',
			'',
			'<details>',
			'',
			'<summary>Changed file</summary>',
			'',
			'- README.md',
			'',
			'</details>',
		].join('\n'));
	});
});

describe('isDisabledDeletePackage', () => {
	testEnv();

	it('should be false 1', () => {
		process.env.INPUT_DELETE_PACKAGE = '1';
		expect(isDisabledDeletePackage()).toBe(false);
	});

	it('should be false 2', () => {
		process.env.INPUT_DELETE_PACKAGE = 'true';
		expect(isDisabledDeletePackage()).toBe(false);
	});

	it('should be false 3', () => {
		process.env.INPUT_DELETE_PACKAGE = 'abc';
		expect(isDisabledDeletePackage()).toBe(false);
	});

	it('should be true 1', () => {
		process.env.INPUT_DELETE_PACKAGE = '0';
		expect(isDisabledDeletePackage()).toBe(true);
	});

	it('should be true 2', () => {
		process.env.INPUT_DELETE_PACKAGE = 'false';
		expect(isDisabledDeletePackage()).toBe(true);
	});

	it('should be true 3', () => {
		process.env.INPUT_DELETE_PACKAGE = '';
		expect(isDisabledDeletePackage()).toBe(true);
	});
});

describe('isCreatePR', () => {
	testEnv();
	it('should return true', () => {
		process.env.INPUT_PR_BRANCH_NAME = 'test';
		expect(isCreatePR(getContext({
			eventName: 'pull_request',
		}))).toBe(true);
	});

	it('should return false 1', () => {
		process.env.INPUT_PR_BRANCH_NAME = 'test';
		expect(isCreatePR(getContext({
			eventName: 'push',
		}))).toBe(false);
	});

	it('should return false 2', () => {
		expect(isCreatePR(getContext({
			eventName: 'pull_request',
		}))).toBe(false);
	});
});
