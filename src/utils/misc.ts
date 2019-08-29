import fs from 'fs';
import {Context} from '@actions/github/lib/context';
import {TARGET_EVENTS} from '../constant';

export const isTargetEvent = (context: Context): boolean => 'string' === typeof context.payload.action && context.eventName in TARGET_EVENTS && TARGET_EVENTS[context.eventName] === context.payload.action;

export const getBuildVersion = (filepath: string): string | boolean => {
    if (!fs.existsSync(filepath)) {
        return false;
    }

    const json = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    if (json && 'tagName' in json) {
        return json['tagName'];
    }

    return false;
};
