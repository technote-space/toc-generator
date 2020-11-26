/* eslint-disable no-magic-numbers */
import fs from 'fs';
import {resolve} from 'path';
import {testEnv} from '@technote-space/github-action-test-helper';
import {Logger} from '@technote-space/github-action-log-helper';
import {
  transformAndSave,
  executeDoctoc,
} from '../../src/utils/doctoc';

const rootDir   = resolve(__dirname, '../..');
const doctocDir = resolve(__dirname, '../fixtures/doctoc');
const logger    = new Logger();
const title     = '**test title**';
jest.spyOn(fs, 'writeFileSync').mockImplementation(jest.fn());

describe('transformAndSave', () => {
  testEnv(rootDir);

  it('should return empty', () => {
    expect(transformAndSave([], title)).toEqual({changed: [], unchanged: []});
  });

  it('should run doctoc', () => {
    expect(transformAndSave([{path: resolve(doctocDir, 'README.update.md')}], title)).toEqual({
      changed: [
        {
          data: fs.readFileSync(resolve(doctocDir, 'expected/README.update.md'), 'utf8'),
          path: resolve(doctocDir, 'README.update.md'),
          transformed: true,
        },
      ],
      unchanged: [],
    });
  });

  it('should not run doctoc', () => {
    expect(transformAndSave([{path: resolve(doctocDir, 'README.not.update.md')}], title)).toEqual({
      changed: [],
      unchanged: [
        {
          data: '',
          path: resolve(doctocDir, 'README.not.update.md'),
          transformed: false,
        },
      ],
    });
  });

  it('mixed', () => {
    expect(transformAndSave([
      {path: resolve(doctocDir, 'README.create1.md')},
      {path: resolve(doctocDir, 'README.create2.md')},
      {path: resolve(doctocDir, 'README.update.md')},
      {path: resolve(doctocDir, 'README.not.update.md')},
      {path: resolve(doctocDir, 'README.toc-me.md')},
    ], title)).toEqual({
      changed: [
        {
          data: fs.readFileSync(resolve(doctocDir, 'expected/README.create1.md'), 'utf8'),
          path: resolve(doctocDir, 'README.create1.md'),
          transformed: true,
        },
        {
          data: fs.readFileSync(resolve(doctocDir, 'expected/README.create2.md'), 'utf8'),
          path: resolve(doctocDir, 'README.create2.md'),
          transformed: true,
        },
        {
          data: fs.readFileSync(resolve(doctocDir, 'expected/README.update.md'), 'utf8'),
          path: resolve(doctocDir, 'README.update.md'),
          transformed: true,
        },
        {
          data: fs.readFileSync(resolve(doctocDir, 'expected/README.toc-me.md'), 'utf8'),
          path: resolve(doctocDir, 'README.toc-me.md'),
          transformed: true,
        },
      ],
      unchanged: [
        {
          data: '',
          path: resolve(doctocDir, 'README.not.update.md'),
          transformed: false,
        },
      ],
    });
  });

  it('should wrap', () => {
    process.env.INPUT_FOLDING = 'true';

    expect(transformAndSave([{path: resolve(doctocDir, 'README.update.md')}], title)).toEqual({
      changed: [
        {
          data: fs.readFileSync(resolve(doctocDir, 'expected/README.update.wrap.md'), 'utf8'),
          path: resolve(doctocDir, 'README.update.md'),
          transformed: true,
        },
      ],
      unchanged: [],
    });

    expect(transformAndSave([{path: resolve(doctocDir, 'README.update.md')}], 'test title')).toEqual({
      changed: [
        {
          data: fs.readFileSync(resolve(doctocDir, 'expected/README.update.wrap.md'), 'utf8'),
          path: resolve(doctocDir, 'README.update.md'),
          transformed: true,
        },
      ],
      unchanged: [],
    });
  });

  it('should set options', () => {
    process.env.INPUT_FOLDING          = 'true';
    process.env.INPUT_MAX_HEADER_LEVEL = '3';
    process.env.INPUT_ENTRY_PREFIX     = '☆';

    expect(transformAndSave([{path: resolve(doctocDir, 'README.update.md')}], title)).toEqual({
      changed: [
        {
          data: fs.readFileSync(resolve(doctocDir, 'expected/README.update.options.md'), 'utf8'),
          path: resolve(doctocDir, 'README.update.md'),
          transformed: true,
        },
      ],
      unchanged: [],
    });
  });

  it('should run doctoc with custom mode', () => {
    process.env.INPUT_CUSTOM_MODE     = 'true';
    process.env.INPUT_CUSTOM_TEMPLATE = '<p align="center"><sub>${ITEMS}</sub></p>';
    process.env.INPUT_ITEM_TEMPLATE   = '<a href="${LINK}">[${TEXT}]</a>';
    process.env.INPUT_SEPARATOR       = '･';
    expect(transformAndSave([{path: resolve(doctocDir, 'README.horizontal.md')}], title)).toEqual({
      changed: [
        {
          data: fs.readFileSync(resolve(doctocDir, 'expected/README.horizontal1.md'), 'utf8'),
          path: resolve(doctocDir, 'README.horizontal.md'),
          transformed: true,
        },
      ],
      unchanged: [],
    });
  });

  it('should run doctoc with html mode (deprecated)', () => {
    process.env.INPUT_HTML_MODE = 'true';
    expect(transformAndSave([{path: resolve(doctocDir, 'README.horizontal.md')}], title)).toEqual({
      changed: [
        {
          data: fs.readFileSync(resolve(doctocDir, 'expected/README.horizontal2.md'), 'utf8'),
          path: resolve(doctocDir, 'README.horizontal.md'),
          transformed: true,
        },
      ],
      unchanged: [],
    });
  });
});

describe('executeDoctoc', () => {
  testEnv(rootDir);

  it('should execute doctoc 1', () => {
    expect(executeDoctoc([
      doctocDir,
    ], title, logger)).toEqual({
      changed: [
        resolve(doctocDir, 'README.create1.md'),
        resolve(doctocDir, 'README.create2.md'),
        resolve(doctocDir, 'README.horizontal.md'),
        resolve(doctocDir, 'README.toc-me.md'),
        resolve(doctocDir, 'README.update.md'),
        resolve(doctocDir, 'expected/README.horizontal1.md'),
        resolve(doctocDir, 'expected/README.horizontal2.md'),
        resolve(doctocDir, 'expected/README.update.options.md'),
        resolve(doctocDir, 'expected/README.update.wrap.md'),
      ],
      unchanged: [
        resolve(doctocDir, 'README.not.update.md'),
        resolve(doctocDir, 'expected/README.create1.md'),
        resolve(doctocDir, 'expected/README.create2.md'),
        resolve(doctocDir, 'expected/README.toc-me.md'),
        resolve(doctocDir, 'expected/README.update.md'),
      ],
    });
  });

  it('should execute doctoc 2', () => {
    expect(executeDoctoc([
      resolve(doctocDir, 'README*.md'),
    ], title, logger)).toEqual({
      changed: [
        resolve(doctocDir, 'README.create1.md'),
        resolve(doctocDir, 'README.create2.md'),
        resolve(doctocDir, 'README.horizontal.md'),
        resolve(doctocDir, 'README.toc-me.md'),
        resolve(doctocDir, 'README.update.md'),
      ],
      unchanged: [
        resolve(doctocDir, 'README.not.update.md'),
      ],
    });
  });

  it('should not execute doctoc', () => {
    expect(executeDoctoc([
      resolve(doctocDir, 'tmp'),
      resolve(doctocDir, 'README-test*.md'),
    ], title, logger)).toEqual({
      changed: [],
      unchanged: [],
    });
  });
});
