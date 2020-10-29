import {Context} from '@actions/github/lib/context';

export const ACTION_NAME     = 'TOC Generator';
export const ACTION_OWNER    = 'technote-space';
export const ACTION_REPO     = 'toc-generator';
export const TARGET_EVENTS   = {
  'push': [
    (context: Context): boolean => /^refs\/heads\//.test(context.ref),
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
