import nock from 'nock';
import path from 'path';
import {GitHub} from '@actions/github' ;
import {push} from '../../src/utils/github';
import {disableNetConnect, getApiFixture, getContext, testEnv} from '../util';

describe('push', () => {
    disableNetConnect(nock);
    testEnv();

    it('should return false 1', async () => {
        expect(await push([], new GitHub(''), getContext({}))).toBeFalsy();
    });

    it('should return false 2', async () => {
        const fn = jest.fn();
        nock('https://api.github.com')
            .get('/repos/hello/world/branches/test/protection')
            .reply(200, () => {
                fn();
                return getApiFixture('repos.branches.protection');
            });
        expect(await push(['README.md'], new GitHub(''), getContext({
            ref: 'refs/heads/test',
            repo: {
                owner: 'hello',
                repo: 'world',
            },
        }))).toBeFalsy();

        expect(fn).toBeCalledTimes(1);
    });

    it('should update ref', async () => {
        process.env.GITHUB_WORKSPACE = path.resolve(__dirname, '..', 'fixtures');
        const fn1 = jest.fn();
        const fn2 = jest.fn();
        const fn3 = jest.fn();
        const fn4 = jest.fn();
        const fn5 = jest.fn();
        const fn6 = jest.fn();
        const fn7 = jest.fn();
        const fn8 = jest.fn();
        const fn9 = jest.fn();
        const fn10 = jest.fn();
        nock('https://api.github.com')
            .persist()
            .get('/repos/hello/world/branches/test/protection')
            .reply(404, (uri, body) => {
                fn1();
                return body;
            })
            .post('/repos/hello/world/git/blobs', body => {
                fn2();
                expect(body).toHaveProperty('content');
                expect(body).toHaveProperty('encoding');
                return body;
            })
            .reply(201, () => {
                fn3();
                return getApiFixture('repos.git.blobs');
            })
            .get('/repos/hello/world/git/commits/7638417db6d59f3c431d3e1f261cc637155684cd')
            .reply(200, () => {
                fn4();
                return getApiFixture('repos.git.commits.get');
            })
            .post('/repos/hello/world/git/trees', body => {
                fn5();
                expect(body).toHaveProperty('base_tree');
                expect(body).toHaveProperty('tree');
                return body;
            })
            .reply(201, () => {
                fn6();
                return getApiFixture('repos.git.trees');
            })
            .post('/repos/hello/world/git/commits', body => {
                fn7();
                expect(body).toHaveProperty('tree');
                expect(body).toHaveProperty('parents');
                return body;
            })
            .reply(201, () => {
                fn8();
                return getApiFixture('repos.git.commits');
            })
            .patch('/repos/hello/world/git/refs/' + encodeURIComponent('heads/test'), body => {
                fn9();
                expect(body).toHaveProperty('sha');
                return body;
            })
            .reply(200, () => {
                fn10();
                return getApiFixture('repos.git.refs');
            });
        expect(await push(['README.md', 'CHANGELOG.md'], new GitHub(''), getContext({
            ref: 'refs/heads/test',
            repo: {
                owner: 'hello',
                repo: 'world',
            },
            sha: '7638417db6d59f3c431d3e1f261cc637155684cd',
        }))).toBeTruthy();

        expect(fn1).toBeCalledTimes(1);
        expect(fn2).toBeCalledTimes(2);
        expect(fn3).toBeCalledTimes(2);
        expect(fn4).toBeCalledTimes(1);
        expect(fn5).toBeCalledTimes(1);
        expect(fn6).toBeCalledTimes(1);
        expect(fn7).toBeCalledTimes(1);
        expect(fn8).toBeCalledTimes(1);
        expect(fn9).toBeCalledTimes(1);
        expect(fn10).toBeCalledTimes(1);
    });
});
