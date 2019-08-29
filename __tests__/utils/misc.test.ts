import path from 'path';
import {getContext} from '../util';
import {
    isTargetEvent,
    getBuildVersion,
} from '../../src/utils/misc';

describe('isTargetEvent', () => {
    it('should return true', () => {
        expect(isTargetEvent(getContext({
            payload: {
                action: 'opened',
            },
            eventName: 'pull_request',
        }))).toBeTruthy();
    });

    it('should return false 1', () => {
        expect(isTargetEvent(getContext({
            payload: {
                action: 'opened',
            },
            eventName: 'push',
        }))).toBeFalsy();
    });

    it('should return false 2', () => {
        expect(isTargetEvent(getContext({
            payload: {
                action: 'closed',
            },
            eventName: 'pull_request',
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
