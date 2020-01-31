/* eslint-disable no-magic-numbers */
import fs from 'fs';
import { resolve } from 'path';
import { testEnv } from '@technote-space/github-action-test-helper';
import { Logger } from '@technote-space/github-action-helper';
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
		expect(transformAndSave([], title, logger)).toEqual({changed: [], unchanged: []});
	});

	it('should run doctoc', () => {
		expect(transformAndSave([{path: resolve(doctocDir, 'README.update.md')}], title, logger)).toEqual({
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
		expect(transformAndSave([{path: resolve(doctocDir, 'README.not.update.md')}], title, logger)).toEqual({
			changed: [],
			unchanged: [
				{
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
		], title, logger)).toEqual({
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
			],
			unchanged: [
				{
					path: resolve(doctocDir, 'README.not.update.md'),
					transformed: false,
				},
			],
		});
	});

	it('should wrap', () => {
		process.env.INPUT_FOLDING = 'true';

		expect(transformAndSave([{path: resolve(doctocDir, 'README.update.md')}], title, logger)).toEqual({
			changed: [
				{
					data: fs.readFileSync(resolve(doctocDir, 'expected/README.update.wrap.md'), 'utf8'),
					path: resolve(doctocDir, 'README.update.md'),
					transformed: true,
				},
			],
			unchanged: [],
		});

		expect(transformAndSave([{path: resolve(doctocDir, 'README.update.md')}], 'test title', logger)).toEqual({
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
});

describe('executeDoctoc', () => {
	testEnv(rootDir);

	it('should execute doctoc 1', () => {
		expect(executeDoctoc([
			doctocDir,
		], title, logger)).toEqual({
			changed: [
				'/var/www/html/gh-actions/toc-generator/__tests__/fixtures/doctoc/README.create1.md',
				'/var/www/html/gh-actions/toc-generator/__tests__/fixtures/doctoc/README.create2.md',
				'/var/www/html/gh-actions/toc-generator/__tests__/fixtures/doctoc/README.update.md',
				'/var/www/html/gh-actions/toc-generator/__tests__/fixtures/doctoc/expected/README.update.options.md',
				'/var/www/html/gh-actions/toc-generator/__tests__/fixtures/doctoc/expected/README.update.wrap.md',
			],
			unchanged: [
				'/var/www/html/gh-actions/toc-generator/__tests__/fixtures/doctoc/README.not.update.md',
				'/var/www/html/gh-actions/toc-generator/__tests__/fixtures/doctoc/expected/README.create1.md',
				'/var/www/html/gh-actions/toc-generator/__tests__/fixtures/doctoc/expected/README.create2.md',
				'/var/www/html/gh-actions/toc-generator/__tests__/fixtures/doctoc/expected/README.update.md',
			],
		});
	});

	it('should execute doctoc 2', () => {
		expect(executeDoctoc([
			resolve(doctocDir, 'README*.md'),
		], title, logger)).toEqual({
			changed: [
				'/var/www/html/gh-actions/toc-generator/__tests__/fixtures/doctoc/README.create1.md',
				'/var/www/html/gh-actions/toc-generator/__tests__/fixtures/doctoc/README.create2.md',
				'/var/www/html/gh-actions/toc-generator/__tests__/fixtures/doctoc/README.update.md',
			],
			unchanged: [
				'/var/www/html/gh-actions/toc-generator/__tests__/fixtures/doctoc/README.not.update.md',
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
