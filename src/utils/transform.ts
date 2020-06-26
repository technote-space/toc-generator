import transform, {start, end} from 'doctoc/lib/transform';
import updateSection from 'update-section';
import {readFileSync} from 'fs';
import {Utils} from '@technote-space/github-action-helper';
import {isNoTitle, wrapTitle, wrapToc, getEntryPrefix, getMaxHeaderLevel, getArrayInput} from './misc';
import {OPENING_COMMENT, CLOSING_COMMENT} from '../constant';

const matchesStart = (line: string): boolean => Utils.getRegExp(OPENING_COMMENT).test(line);
const matchesEnd   = (line: string): boolean => Utils.getRegExp(CLOSING_COMMENT).test(line);

export const normalizeMarkerComment = (contents: string): string => {
  const replacedOpening = getArrayInput('OPENING_COMMENT').reduce((acc, comment) => acc.split('\n').map(line => line.replace(Utils.getPrefixRegExp(comment), OPENING_COMMENT)).join('\n'), contents);
  return getArrayInput('CLOSING_COMMENT').reduce((acc, comment) => acc.split('\n').map(line => line.replace(Utils.getPrefixRegExp(comment), CLOSING_COMMENT)).join('\n'), replacedOpening);
};

export const transformWithWrap = (path: string, title: string): { transformed: boolean; path: string; data: string } => {
  const content = normalizeMarkerComment(readFileSync(path, 'utf8'));
  const {toc}   = transform(content, undefined, getMaxHeaderLevel(), wrapTitle(title), isNoTitle(title), getEntryPrefix());

  // transformed is not working
  // https://github.com/thlorenz/doctoc/pull/169
  const data        = updateSection(content, `${start}\n${wrapToc(toc, title)}\n${end}`, matchesStart, matchesEnd, true);
  const transformed = data !== content;

  if (transformed) {
    return {path, transformed, data};
  }

  return {path, transformed, data: ''};
};
