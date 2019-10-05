import path from 'path';
import { setFailed, getInput } from '@actions/core';
import { context, GitHub } from '@actions/github';
import { Logger, Utils, ApiHelper } from '@technote-space/github-action-helper';
import { getChangedFiles } from './utils/command';
import { isTargetContext, getCommitMessage, getWorkDir } from './utils/misc';

const {showActionInfo, getPrHeadRef} = Utils;

/**
 * run
 */
async function run(): Promise<void> {
	try {
		const logger = new Logger();
		const _context = Object.assign({}, context, {ref: getPrHeadRef(context)});
		showActionInfo(path.resolve(__dirname, '..'), logger, _context);

		if (!isTargetContext(_context)) {
			logger.info('This is not target event.');
			return;
		}

		const files = await getChangedFiles(_context);
		if (false === files) {
			return;
		}
		await (new ApiHelper(logger)).commit(getWorkDir(), getCommitMessage(), files, new GitHub(getInput('GITHUB_TOKEN', {required: true})), _context);
	} catch (error) {
		setFailed(error.message);
	}
}

run();
