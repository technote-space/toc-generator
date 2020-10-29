"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformWithWrap = void 0;
const fs_1 = require("fs");
const doctoc_1 = require("@technote-space/doctoc");
const github_action_helper_1 = require("@technote-space/github-action-helper");
const misc_1 = require("./misc");
exports.transformWithWrap = (path, title) => {
    const { transformed, data } = doctoc_1.transform(fs_1.readFileSync(path, 'utf8'), {
        maxHeaderLevel: misc_1.getMaxHeaderLevel(),
        title,
        isNotitle: misc_1.isNoTitle(title),
        isFolding: misc_1.isFolding(),
        entryPrefix: misc_1.getEntryPrefix(),
        checkOpeningComments: github_action_helper_1.Utils.uniqueArray(misc_1.getArrayInput('OPENING_COMMENT').concat(doctoc_1.CHECK_OPENING_COMMENT)),
        checkClosingComments: github_action_helper_1.Utils.uniqueArray(misc_1.getArrayInput('CLOSING_COMMENT').concat(doctoc_1.CHECK_CLOSING_COMMENT)),
    });
    return { path, transformed, data };
};
