import path from 'path';
import { setFailed } from '@actions/core';
import { context } from '@actions/github';
import { Logger, Utils } from '@technote-space/github-action-helper';
import { isTargetContext } from './utils/misc';
import { execute } from './utils/process';

const {showActionInfo} = Utils;

/**
 * run
 */
async function run(): Promise<void> {
	try {
		const logger = new Logger();
		showActionInfo(path.resolve(__dirname, '..'), logger, context);

		if (!isTargetContext(context)) {
			logger.info('This is not target event.');
			return;
		}

		await execute(logger, context);
	} catch (error) {
		setFailed(error.message);
	}
}

run();
