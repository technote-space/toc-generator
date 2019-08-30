import path from 'path';
import {setFailed, getInput} from '@actions/core';
import {context, GitHub} from '@actions/github';
import signale from 'signale';
import {getBuildVersion, isTargetEvent} from './utils/misc';
import {getChangedFiles} from './utils/command';
import {push} from './utils/github';

async function run() {
    try {
        const version = getBuildVersion(path.resolve(__dirname, '..', 'build.json'));
        if ('string' === typeof version) {
            signale.info('Version: %s', version);
        }

        signale.info('Event: %s', context.eventName);
        signale.info('Action: %s', context.payload.action);
        signale.info('Ref: %s', context.ref);
        if (!isTargetEvent(context)) {
            signale.info('This is not target event.');
            return;
        }

        const files = await getChangedFiles(context);
        if (false === files) {
            return;
        }
        await push(files, new GitHub(getInput('GITHUB_TOKEN', {required: true})), context);
    } catch (error) {
        setFailed(error.message);
    }
}

run();
