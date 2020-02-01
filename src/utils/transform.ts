import transform, { start, end } from 'doctoc/lib/transform';
import updateSection from 'update-section';
import { isNoTitle, wrapTitle, wrapToc, getEntryPrefix, getMaxHeaderLevel } from './misc';
import { readFileSync } from 'fs';

const matchesStart = (line: string): boolean => /<!-- START doctoc /.test(line);

const matchesEnd = (line: string): boolean => /<!-- END doctoc /.test(line);

export const transformWithWrap = (path: string, title: string): { transformed: boolean; path: string; data?: string } => {
	const content = readFileSync(path, 'utf8');
	const {toc}   = transform(content, undefined, getMaxHeaderLevel(), wrapTitle(title), isNoTitle(title), getEntryPrefix());

	// transformed is not working
	// https://github.com/thlorenz/doctoc/pull/169
	const data        = updateSection(content, `${start}\n${wrapToc(toc, title)}\n${end}`, matchesStart, matchesEnd, true);
	const transformed = data !== content;

	if (transformed) {
		return {path, transformed, data};
	}

	return {path, transformed};
};
