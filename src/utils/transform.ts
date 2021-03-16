import {readFileSync} from 'fs';
import {getInput} from '@actions/core' ;
import {transform, CHECK_OPENING_COMMENT, CHECK_CLOSING_COMMENT} from '@technote-space/doctoc';
import {Utils} from '@technote-space/github-action-helper';
import {
  isNoTitle,
  getEntryPrefix,
  getMaxHeaderLevel,
  getArrayInput,
  isFolding,
} from './misc';

export const transformWithWrap = (path: string, title: string): { transformed: boolean; path: string; data: string } => {
  const {transformed, data} = transform(readFileSync(path, 'utf8'), {
    maxHeaderLevel: getMaxHeaderLevel(),
    title,
    isNotitle: isNoTitle(title),
    isFolding: isFolding(),
    entryPrefix: getEntryPrefix(),
    checkOpeningComments: Utils.uniqueArray(getArrayInput('OPENING_COMMENT').concat(CHECK_OPENING_COMMENT)),
    checkClosingComments: Utils.uniqueArray(getArrayInput('CLOSING_COMMENT').concat(CHECK_CLOSING_COMMENT)),
    isCustomMode: Utils.getBoolValue(getInput('CUSTOM_MODE') || getInput('HTML_MODE')),
    customTemplate: getInput('CUSTOM_TEMPLATE') || getInput('HTML_TEMPLATE'),
    itemTemplate: getInput('ITEM_TEMPLATE'),
    separator: getInput('SEPARATOR'),
    footer: getInput('FOOTER'),
  });
  return {path, transformed, data};
};
