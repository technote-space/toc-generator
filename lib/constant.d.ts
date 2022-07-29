import type { Context } from '@actions/github/lib/context';
export declare const ACTION_NAME = "TOC Generator";
export declare const ACTION_OWNER = "technote-space";
export declare const ACTION_REPO = "toc-generator";
export declare const TARGET_EVENTS: {
    push: ((context: Context) => boolean)[];
    pull_request: string[];
    schedule: string;
    repository_dispatch: string;
    workflow_dispatch: string;
    workflow_run: string;
};
