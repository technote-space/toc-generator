import { Utils } from '@technote-space/github-action-helper';
import { Logger } from '@technote-space/github-action-log-helper';
import fs from 'fs';
import { sync } from 'fast-glob';
import { findMarkdownFiles } from '@technote-space/doctoc';
import { cleanPath } from './misc';
import { transformWithWrap } from './transform';
import { CommandOutput, ExecuteTask } from '@technote-space/github-action-pr-helper/dist/types';

export const transformAndSave = (files: Array<{ path: string }>, title: string): { changed: Array<{ path: string }>; unchanged: Array<{ path: string }> } => {
  const transformed = files.map(file => transformWithWrap(file.path, title));
  const changed     = transformed.filter(item => item.transformed);
  const unchanged   = transformed.filter(item => !item.transformed);

  changed.forEach(item => {
    fs.writeFileSync(item.path, item.data, 'utf8');
  });

  return { changed, unchanged };
};

const parsePaths = (paths: Array<string>): Array<string> => sync(paths.map(path => cleanPath(path)), {
  onlyFiles: false,
  caseSensitiveMatch: false,
  cwd: Utils.getWorkspace(),
});

export const executeDoctoc = (paths: Array<string>, title: string, logger: Logger): { changed: Array<string>; unchanged: Array<string> } => parsePaths(paths).map(path => {
  const stat = fs.statSync(path);
  if (stat.isDirectory()) {
    logger.displayCommand('DocToccing "%s" and its sub directories.', path);
    return transformAndSave(findMarkdownFiles(path), title);
  }

  logger.displayCommand('DocToccing single file "%s".', path);
  return transformAndSave([{ path }], title);
}).reduce((acc, value) => ({
  changed: acc.changed.concat(value.changed.map(item => item.path)),
  unchanged: acc.unchanged.concat(value.unchanged.map(item => item.path)),
}), {
  changed: [] as Array<string>,
  unchanged: [] as Array<string>,
});

export const doctoc = (paths: Array<string>, title: string, logger: Logger): ExecuteTask => {
  return async(): Promise<CommandOutput> => {
    // process.cwd is not available in Worker threads.
    const cwd     = process.cwd;
    process.cwd   = (): string => Utils.getWorkspace();
    const results = executeDoctoc(paths, title, logger);
    process.cwd   = cwd;
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
