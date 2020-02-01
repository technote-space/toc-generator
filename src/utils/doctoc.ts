import { Logger, Utils } from '@technote-space/github-action-helper';
import { writeFileSync, statSync } from 'fs';
import { sync } from '@technote-space/fast-glob';
import file from 'doctoc/lib/file';
import { cleanPath } from './misc';
import { transformWithWrap } from './transform';
import { CommandOutput, ExecuteTask } from '@technote-space/github-action-pr-helper/dist/types';

export const transformAndSave = (files: Array<{ path: string }>, title: string, logger: Logger): { changed: Array<{ path: string }>; unchanged: Array<{ path: string }> } => {
	const transformed = files.map(file => transformWithWrap(file.path, title));
	const changed     = transformed.filter(item => item.transformed);
	const unchanged   = transformed.filter(item => !item.transformed);

	unchanged.forEach(item => logger.info('"%s" is up to date', item.path));
	changed.forEach(item => {
		logger.info('"%s" will be updated', item.path);
		writeFileSync(item.path, item.data, 'utf8');
	});

	return {changed, unchanged};
};

const parsePaths = (paths: Array<string>): Array<string> => sync(paths.map(path => cleanPath(path)), {
	onlyFiles: false,
	caseSensitiveMatch: false,
	cwd: Utils.getWorkspace(),
});

export const executeDoctoc = (paths: Array<string>, title: string, logger: Logger): { changed: Array<string>; unchanged: Array<string> } => parsePaths(paths).map(path => {
	const stat = statSync(path);
	if (stat.isDirectory()) {
		logger.startProcess('DocToccing "%s" and its sub directories for github.com.', path);
		return transformAndSave(file.findMarkdownFiles(path), title, logger);
	}

	logger.startProcess('DocToccing single file "%s" for github.com.', path);
	return transformAndSave([{path}], title, logger);
}).reduce((acc, value) => ({
	changed: acc.changed.concat(value.changed.map(item => item.path)),
	unchanged: acc.unchanged.concat(value.unchanged.map(item => item.path)),
}), {
	changed: [] as Array<string>,
	unchanged: [] as Array<string>,
});

export const doctoc = (paths: Array<string>, title: string, logger: Logger): ExecuteTask => {
	return async(): Promise<CommandOutput> => {
		const results = executeDoctoc(paths, title, logger);
		return {
			command: 'Run doctoc',
			stdout: [
				'changed:',
				...results.changed.map(item => `  - ${item}`),
				'unchanged:',
				...results.unchanged.map(item => `  - ${item}`),
			],
			stderr: [],
		};
	};
};
