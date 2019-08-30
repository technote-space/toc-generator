"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const signale_1 = __importDefault(require("signale"));
const misc_1 = require("./misc");
exports.push = (files, octokit, context) => __awaiter(void 0, void 0, void 0, function* () {
    if (!files.length) {
        signale_1.default.info('There is no diff.');
        return false;
    }
    if (yield checkProtected(octokit, context)) {
        signale_1.default.warn(`Branch [%s] is protected`, misc_1.getBranch(context));
        return false;
    }
    signale_1.default.info('>> Creating blobs...');
    const blobs = yield filesToBlobs(files, octokit, context);
    signale_1.default.info('>> Creating tree...');
    const tree = yield createTree(blobs, octokit, context);
    signale_1.default.info('>> Creating commit...');
    const commit = yield createCommit(tree, octokit, context);
    signale_1.default.info('>> Updating ref...');
    signale_1.default.info(context);
    signale_1.default.info(commit);
    yield updateRef(commit, octokit, context);
    return true;
});
const checkProtected = (octokit, context) => __awaiter(void 0, void 0, void 0, function* () {
    const branch = misc_1.getBranch(context);
    try {
        return 200 === (yield octokit.repos.getBranchProtection({
            owner: context.repo.owner,
            repo: context.repo.repo,
            branch,
        })).status;
    }
    catch (error) {
        return false;
    }
});
const filesToBlobs = (files, octokit, context) => __awaiter(void 0, void 0, void 0, function* () { return yield Promise.all(Object.values(files).map(file => createBlob(file, octokit, context))); });
const createBlob = (filepath, octokit, context) => __awaiter(void 0, void 0, void 0, function* () {
    const blob = yield octokit.git.createBlob({
        owner: context.repo.owner,
        repo: context.repo.repo,
        content: Buffer.from(fs_1.default.readFileSync(path_1.default.resolve(misc_1.getWorkDir(), filepath), 'utf8')).toString('base64'),
        encoding: 'base64',
    });
    return {
        path: filepath,
        sha: blob.data.sha,
    };
});
const createTree = (blobs, octokit, context) => __awaiter(void 0, void 0, void 0, function* () {
    return yield octokit.git.createTree({
        owner: context.repo.owner,
        repo: context.repo.repo,
        base_tree: (yield getCommit(octokit, context)).data.tree.sha,
        tree: Object.values(blobs).map(blob => ({
            path: blob.path,
            type: 'blob',
            mode: '100644',
            sha: blob.sha,
        })),
    });
});
const createCommit = (tree, octokit, context) => __awaiter(void 0, void 0, void 0, function* () {
    return yield octokit.git.createCommit({
        owner: context.repo.owner,
        repo: context.repo.repo,
        tree: tree.data.sha,
        parents: [context.sha],
        message: misc_1.getCommitMessage(),
    });
});
const updateRef = (commit, octokit, context) => __awaiter(void 0, void 0, void 0, function* () {
    yield octokit.git.updateRef({
        owner: context.repo.owner,
        repo: context.repo.repo,
        ref: misc_1.getRef(context),
        sha: commit.data.sha,
    });
});
const getCommit = (octokit, context) => __awaiter(void 0, void 0, void 0, function* () {
    return yield octokit.git.getCommit({
        owner: context.repo.owner,
        repo: context.repo.repo,
        commit_sha: context.sha,
    });
});
