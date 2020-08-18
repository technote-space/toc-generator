"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const github_action_pr_helper_1 = require("@technote-space/github-action-pr-helper");
const misc_1 = require("./utils/misc");
github_action_pr_helper_1.run(misc_1.getRunnerArguments());
