"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformWithWrap = void 0;
const fs_1 = require("fs");
const core_1 = require("@actions/core");
const doctoc_1 = require("@technote-space/doctoc");
const github_action_helper_1 = require("@technote-space/github-action-helper");
const misc_1 = require("./misc");
const transformWithWrap = (path, title) => {
    const { transformed, data } = (0, doctoc_1.transform)((0, fs_1.readFileSync)(path, 'utf8'), {
        maxHeaderLevel: (0, misc_1.getMaxHeaderLevel)(),
        title,
        isNotitle: (0, misc_1.isNoTitle)(title),
        isFolding: (0, misc_1.isFolding)(),
        entryPrefix: (0, misc_1.getEntryPrefix)(),
        checkOpeningComments: github_action_helper_1.Utils.uniqueArray((0, misc_1.getArrayInput)('OPENING_COMMENT').concat(doctoc_1.CHECK_OPENING_COMMENT)),
        checkClosingComments: github_action_helper_1.Utils.uniqueArray((0, misc_1.getArrayInput)('CLOSING_COMMENT').concat(doctoc_1.CHECK_CLOSING_COMMENT)),
        isCustomMode: github_action_helper_1.Utils.getBoolValue((0, core_1.getInput)('CUSTOM_MODE') || (0, core_1.getInput)('HTML_MODE')),
        customTemplate: (0, core_1.getInput)('CUSTOM_TEMPLATE') || (0, core_1.getInput)('HTML_TEMPLATE'),
        itemTemplate: (0, core_1.getInput)('ITEM_TEMPLATE'),
        separator: (0, core_1.getInput)('SEPARATOR'),
        footer: (0, core_1.getInput)('FOOTER'),
    });
    return { path, transformed, data };
};
exports.transformWithWrap = transformWithWrap;
