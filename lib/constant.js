"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLOSING_COMMENT = exports.OPENING_COMMENT = exports.TARGET_EVENTS = exports.ACTION_REPO = exports.ACTION_OWNER = exports.ACTION_NAME = void 0;
exports.ACTION_NAME = 'TOC Generator';
exports.ACTION_OWNER = 'technote-space';
exports.ACTION_REPO = 'toc-generator';
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
exports.OPENING_COMMENT = '<!-- START doctoc ';
exports.CLOSING_COMMENT = '<!-- END doctoc ';
