"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_COMMIT_MESSAGE = 'docs: Update TOC';
exports.DEFAULT_TARGET_PATHS = 'README.md';
exports.DEFAULT_PR_TITLE = 'docs: Update TOC';
exports.TARGET_EVENTS = {
    'push': [
        (context) => /^refs\/heads\//.test(context.ref),
    ],
    'pull_request': [
        'opened',
        'reopened',
        'synchronize',
        'labeled',
        'unlabeled',
        'closed',
    ],
};
