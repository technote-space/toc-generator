import path from 'path';
import { setFailed, getInput } from '@actions/core';
import { context, GitHub } from '@actions/github';
import { Logger, Utils, ApiHelper } from '@technote-space/github-action-helper';
import { getChangedFiles } from './utils/command';
import { isTargetContext, getCommitMessage, getPrBranchName, getPrTitle, getPrBody, getWorkDir, isCreatePR } from './utils/misc';

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

		const files = await getChangedFiles(context);
		if (false === files) {
			return;
		}

		if (isCreatePR(context)) {
			await (new ApiHelper(logger)).createPR(getWorkDir(), getCommitMessage(), files, getPrBranchName(context), {
				title: getPrTitle(context),
				body: getPrBody(files),
			}, new GitHub(getInput('GITHUB_TOKEN', {required: true})), context);
		} else {
			await (new ApiHelper(logger)).commit(getWorkDir(), getCommitMessage(), files, new GitHub(getInput('GITHUB_TOKEN', {required: true})), context);
		}
	} catch (error) {
		setFailed(error.message);
	}
}

run();
