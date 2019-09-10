import fs from 'fs';
import path from 'path';
import {getContext, testEnv} from '../util';
import {
    isTargetEvent,
    getBuildVersion,
    getDocTocArgs,
    getWorkDir,
    getGitUrl,
    getRef,
    getRefForUpdate,
    getBranch,
    getCommitMessage,
} from '../../src/utils/misc';
import {DEFAULT_COMMIT_MESSAGE} from '../../src/constant';

describe('isTargetEvent', () => {
    it('should return true 1', () => {
        expect(isTargetEvent(getContext({
            ref: 'refs/heads/test',
            eventName: 'push',
        }))).toBeTruthy();
    });

    it('should return true 2', () => {
        expect(isTargetEvent(getContext({
            ref: 'refs/heads/test',
            payload: {
                action: undefined,
            },
            eventName: 'push',
        }))).toBeTruthy();
    });

    it('should return false 1', () => {
        expect(isTargetEvent(getContext({
            ref: 'refs/heads/test',
            payload: {
                action: 'opened',
            },
            eventName: 'pull_request',
        }))).toBeFalsy();
    });

    it('should return false 2', () => {
        expect(isTargetEvent(getContext({
            ref: 'refs/tags/test',
            eventName: 'push',
        }))).toBeFalsy();
    });
});

describe('getBuildVersion', () => {
    it('should get build version', () => {
        expect(getBuildVersion(path.resolve(__dirname, '..', 'fixtures', 'build1.json'))).toBe('v1.2.3');
    });

    it('should return false 1', () => {
        expect(getBuildVersion(path.resolve(__dirname, '..', 'fixtures', 'build2.json'))).toBeFalsy();
    });

    it('should return false 2', () => {
        expect(getBuildVersion(path.resolve(__dirname, '..', 'fixtures', 'build.test.json'))).toBeFalsy();
    });
});

describe('getDocTocArgs', () => {
    testEnv();

    it('should get DocToc args', () => {
        process.env.GITHUB_WORKSPACE = '/tmp/workspace';
        process.env.INPUT_TARGET_PATHS = 'README.md,.github/CONTRIBUTING.md';
        process.env.INPUT_TOC_TITLE = '**Table of Contents**';
        expect(getDocTocArgs()).toBe('/tmp/workspace/.work/README.md /tmp/workspace/.work/.github/CONTRIBUTING.md --title \'**Table of Contents**\'');
    });

    it('should get default DocToc args', () => {
        process.env.GITHUB_WORKSPACE = '/tmp/workspace';
        expect(getDocTocArgs()).toBe('/tmp/workspace/.work/README.md --notitle');
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

describe('getGitUrl', () => {
    it('should get git url', () => {
        expect(getGitUrl(getContext({
            repo: {
                owner: 'Hello',
                repo: 'World',
            },
        }))).toBe('https://github.com/Hello/World.git');
    });
});

describe('getRef', () => {
    it('should get ref', () => {
        expect(getRef(getContext({
            ref: 'refs/heads/test',
        }))).toBe('refs/heads/test');
    });
});

describe('getRefForUpdate', () => {
    // https://github.com/octokit/rest.js/issues/1308#issuecomment-480532468
    it('should get ref for update', () => {
        expect(getRefForUpdate(getContext({
            ref: 'refs/heads/test',
        }))).toBe(encodeURIComponent('heads/test'));
    });
});

describe('getBranch', () => {
    it('should get branch', () => {
        expect(getBranch(getContext({
            ref: 'refs/heads/test',
        }))).toBe('test');
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
