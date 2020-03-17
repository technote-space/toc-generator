/* eslint-disable no-magic-numbers */
import fs from 'fs';
import { resolve } from 'path';
import { testEnv } from '@technote-space/github-action-test-helper';
import { normalizeMarkerComment } from '../../src/utils/transform';

const rootDir = resolve(__dirname, '../..');
jest.spyOn(fs, 'writeFileSync').mockImplementation(jest.fn());

describe('normalizeMarkerComment', () => {
	testEnv(rootDir);

	it('should replace marker comment', () => {
		expect(normalizeMarkerComment('<!-- toc -->\n- [Test1](#test1)\n<!-- tocstop -->\n\n## Test1')).toBe('<!-- START doctoc -->\n- [Test1](#test1)\n<!-- END doctoc -->\n\n## Test1');
	});
});
