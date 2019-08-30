import path from 'path';
import {getContext, getApiFixture, disableNetConnect, testEnv} from '../util';
import {
    isTargetEvent,
    getBuildVersion,
    getDocTocArgs,
    getWorkDir,
    getGitUrl,
    getRef,
    getBranch,
    getCommitMessage,
} from '../../src/utils/misc';
import {DEFAULT_COMMIT_MESSAGE} from '../../src/constant';

describe('isTargetEvent', () => {
    it('should return true', () => {
        expect(isTargetEvent(getContext({
            ref: 'refs/heads/test',
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

    it('should get default DocToc args', () => {
        expect(getDocTocArgs()).toBe('.');
    });

    it('should get DocToc args', () => {
        process.env.INPUT_TARGET_PATHS = 'README.md,.github/CONTRIBUTING.md';
        expect(getDocTocArgs()).toBe('README.md .github/CONTRIBUTING.md');
    });
});

describe('getWorkDir', () => {
    testEnv();

    it('should get working dir', () => {
        process.env.GITHUB_WORKSPACE = '/tmp/workspace';
        expect(getWorkDir()).toBe('/tmp/workspace/.work');
    });

    it('should get working dir', () => {
        expect(getWorkDir()).toBe(path.resolve('.work'));
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
