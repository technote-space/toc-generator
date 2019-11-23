import path from 'path';
import { setFailed } from '@actions/core';
import { context } from '@actions/github';
import { Logger, ContextHelper } from '@technote-space/github-action-helper';
import { isTargetContext } from './utils/misc';
import { execute } from './utils/process';

/**
 * run
 */
async function run(): Promise<void> {
	const logger = new Logger();
	ContextHelper.showActionInfo(path.resolve(__dirname, '..'), logger, context);

	if (!isTargetContext(context)) {
		logger.info('This is not target event.');
		return;
	}

	await execute(logger, context);
}

run().catch(error => setFailed(error.message));
