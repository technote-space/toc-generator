import type { Logger } from '@technote-space/github-action-log-helper';
import type { ExecuteTask } from '@technote-space/github-action-pr-helper/dist/types';
export declare const transformAndSave: (files: Array<{
    path: string;
}>, title: string) => {
    changed: Array<{
        path: string;
    }>;
    unchanged: Array<{
        path: string;
    }>;
};
export declare const executeDoctoc: (paths: Array<string>, title: string, logger: Logger) => {
    changed: Array<string>;
    unchanged: Array<string>;
};
export declare const doctoc: (paths: Array<string>, title: string, logger: Logger) => ExecuteTask;
