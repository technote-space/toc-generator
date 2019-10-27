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
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const github_1 = require("@actions/github");
const github_action_helper_1 = require("@technote-space/github-action-helper");
const command_1 = require("./command");
const misc_1 = require("./misc");
const getHelper = (logger) => new github_action_helper_1.ApiHelper(logger);
const getOctokit = () => new github_1.GitHub(core_1.getInput('GITHUB_TOKEN', { required: true }));
exports.execute = (logger, context) => __awaiter(void 0, void 0, void 0, function* () {
    if (misc_1.isClosePR(context)) {
        yield getHelper(logger).closePR(misc_1.getPrBranchName(context), getOctokit(), context);
        return;
    }
    const files = yield command_1.getChangedFiles(context);
    if (false === files) {
        return;
    }
    if (misc_1.isCreatePR(context)) {
        yield getHelper(logger).createPR(misc_1.getWorkDir(), misc_1.getCommitMessage(), files, misc_1.getPrBranchName(context), {
            title: misc_1.getPrTitle(context),
            body: misc_1.getPrBody(context, files),
        }, getOctokit(), context);
    }
    else {
        yield getHelper(logger).commit(misc_1.getWorkDir(), misc_1.getCommitMessage(), files, getOctokit(), context);
    }
});
