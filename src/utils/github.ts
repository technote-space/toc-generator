import fs from 'fs';
import path from 'path';
import signale from 'signale';
import {GitHub} from '@actions/github/lib/github';
import {Context} from '@actions/github/lib/context';
import {Response, GitCreateTreeResponse, GitCreateCommitResponse} from '@octokit/rest';
import {getBranch, getWorkDir, getRefForUpdate, getCommitMessage} from './misc';

export const push = async (files: string[], octokit: GitHub, context: Context): Promise<boolean> => {
    if (!files.length) {
        signale.info('There is no diff.');
        return false;
    }

    if (await checkProtected(octokit, context)) {
        signale.warn(`Branch [%s] is protected`, getBranch(context));
        return false;
    }

    signale.info('Start push to branch [%s]', getBranch(context));

    signale.info('>> Creating blobs...');
    const blobs = await filesToBlobs(files, octokit, context);

    signale.info('>> Creating tree...');
    const tree = await createTree(blobs, octokit, context);

    signale.info('>> Creating commit... [%s]', tree.data.sha);
    const commit = await createCommit(tree, octokit, context);

    signale.info('>> Updating ref... [%s] [%s]', getRefForUpdate(context), commit.data.sha);
    await updateRef(commit, octokit, context);
    return true;
};

const checkProtected = async (octokit: GitHub, context: Context): Promise<boolean> => {
    const branch = getBranch(context);

    try {
        return 200 === (await octokit.repos.getBranchProtection({
            owner: context.repo.owner,
            repo: context.repo.repo,
            branch,
        })).status;
    } catch (error) {
        return false;
    }
};

const filesToBlobs = async (files: object, octokit: GitHub, context: Context) => await Promise.all(Object.values(files).map(file => createBlob(file, octokit, context)));

const createBlob = async (filepath: string, octokit: GitHub, context: Context): Promise<{ path: string, sha: string }> => {
    const blob = await octokit.git.createBlob({
        owner: context.repo.owner,
        repo: context.repo.repo,
        content: Buffer.from(fs.readFileSync(path.resolve(getWorkDir(), filepath), 'utf8')).toString('base64'),
        encoding: 'base64',
    });

    return {
        path: filepath,
        sha: blob.data.sha,
    };
};

const createTree = async (blobs: { path: string, sha: string }[], octokit: GitHub, context: Context) => {
    return await octokit.git.createTree({
        owner: context.repo.owner,
        repo: context.repo.repo,
        base_tree: (await getCommit(octokit, context)).data.tree.sha,
        tree: Object.values(blobs).map(blob => ({
            path: blob.path,
            type: 'blob',
            mode: '100644',
            sha: blob.sha,
        })),
    });
};

const createCommit = async (tree: Response<GitCreateTreeResponse>, octokit: GitHub, context: Context) => {
    return await octokit.git.createCommit({
        owner: context.repo.owner,
        repo: context.repo.repo,
        tree: tree.data.sha,
        parents: [context.sha],
        message: getCommitMessage(),
    });
};

const updateRef = async (commit: Response<GitCreateCommitResponse>, octokit: GitHub, context: Context) => {
    await octokit.git.updateRef({
        owner: context.repo.owner,
        repo: context.repo.repo,
        ref: getRefForUpdate(context),
        sha: commit.data.sha,
    });
};

const getCommit = async (octokit: GitHub, context: Context) => {
    return await octokit.git.getCommit({
        owner: context.repo.owner,
        repo: context.repo.repo,
        commit_sha: context.sha,
    });
};
