import { getInput } from '@actions/core';
import { GitHub } from '@actions/github';
import { Context } from '@actions/github/lib/context';
import { Logger, ApiHelper } from '@technote-space/github-action-helper';
import { getChangedFiles } from './command';
import { getCommitMessage, getPrBody, getPrBranchName, getPrTitle, getWorkDir, isClosePR, isCreatePR } from './misc';

const getHelper = (logger: Logger): ApiHelper => new ApiHelper(logger);

const getOctokit = (): GitHub => new GitHub(getInput('GITHUB_TOKEN', {required: true}));

export const execute = async(logger: Logger, context: Context): Promise<void> => {
	if (isClosePR(context)) {
		await getHelper(logger).closePR(getPrBranchName(context), getOctokit(), context);
		return;
	}

	const files = await getChangedFiles(context);
	if (false === files) {
		return;
	}

	if (isCreatePR(context)) {
		await getHelper(logger).createPR(getWorkDir(), getCommitMessage(), files, getPrBranchName(context), {
			title: getPrTitle(context),
			body: getPrBody(context, files),
		}, getOctokit(), context);
	} else {
		await getHelper(logger).commit(getWorkDir(), getCommitMessage(), files, getOctokit(), context);
	}
};