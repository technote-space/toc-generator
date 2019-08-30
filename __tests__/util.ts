const fs = require('fs');
const path = require('path');

export const getContext = (override: object) => Object.assign({
    payload: {
        action: '',
    },
    eventName: '',
    sha: '',
    ref: '',
    workflow: '',
    action: '',
    actor: '',
    issue: {
        owner: '',
        repo: '',
        number: 1,
    },
    repo: {
        owner: '',
        repo: '',
    },
}, override);

export const getApiFixture = (name: string) => JSON.parse(fs.readFileSync(path.resolve(__dirname, `fixtures/${name}.json`)));

export const disableNetConnect = nock => {
    beforeEach(() => {
        nock.disableNetConnect();
    });

    afterEach(() => {
        nock.cleanAll();
        nock.enableNetConnect();
    });
};

export const testEnv = () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = {...OLD_ENV};
        delete process.env.NODE_ENV;
    });

    afterEach(() => {
        process.env = OLD_ENV;
    });
};
