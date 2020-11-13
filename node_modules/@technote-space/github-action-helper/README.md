# GitHub Action Helper

[![npm version](https://badge.fury.io/js/%40technote-space%2Fgithub-action-helper.svg)](https://badge.fury.io/js/%40technote-space%2Fgithub-action-helper)
[![CI Status](https://github.com/technote-space/github-action-helper/workflows/CI/badge.svg)](https://github.com/technote-space/github-action-helper/actions)
[![codecov](https://codecov.io/gh/technote-space/github-action-helper/branch/master/graph/badge.svg)](https://codecov.io/gh/technote-space/github-action-helper)
[![CodeFactor](https://www.codefactor.io/repository/github/technote-space/github-action-helper/badge)](https://www.codefactor.io/repository/github/technote-space/github-action-helper)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/technote-space/github-action-helper/blob/master/LICENSE)

*Read this in other languages: [English](README.md), [日本語](README.ja.md).*

Helper for GitHub Actions.

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<details>
<summary>Details</summary>

- [Usage](#usage)
  - [Command](#command)
  - [ApiHelper](#apihelper)
  - [GitHelper](#githelper)
  - [Utils](#utils)
  - [ContextHelper](#contexthelper)
  - [Dependencies](#dependencies)
- [Author](#author)

</details>
<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Usage
1. Install  
   1. npm  
      `npm i @technote-space/github-action-helper`
   1. yarn  
      `yarn add @technote-space/github-action-helper`
   
1. Use
```typescript
import { Command, ApiHelper, GitHelper, Utils, ContextHelper } from '@technote-space/github-action-helper';
```

### Command
```typescript
import { Command } from '@technote-space/github-action-helper';
import { Logger } from '@technote-space/github-action-log-helper';

const logger = new Logger();
const command = new Command(logger);
async function run() {
    logger.startProcess('Simple use');
    await command.execAsync({command: 'ls'});
    logger.log();
    logger.startProcess('Options');
    await command.execAsync({command: 'ls', altCommand: 'alt', quiet: true, suppressError: true, suppressOutput: true});
    logger.endProcess();

    // ::group::Simple use
    // [command]ls
    //   >> README.md
    //   >> src
    // 
    // ::endgroup::
    // ::group::Options
    // [command]alt
    // ::endgroup::
}

run().catch(error => console.error(error));
```

### ApiHelper
```typescript
import { ApiHelper } from '@technote-space/github-action-helper';
import { Logger } from '@technote-space/github-action-log-helper';
import { context } from '@actions/github';
import { GitHub } from '@actions/github' ;
import { getInput } from '@actions/core';
import path from 'path';

const helper = new ApiHelper(new Logger());
async function run() {
    await helper.commit(path.resolve(__dirname, '..'), 'feat: commit message', ['README.md', 'package.json'], new GitHub(getInput('GITHUB_TOKEN', {required: true})), context);
}

run().catch(error => console.error(error));
```

### GitHelper
```typescript
import { Logger, GitHelper } from '@technote-space/github-action-helper';
import { context } from '@actions/github';
import path from 'path';
const workDir = path.resolve(__dirname, '..');

const helper = new GitHelper(new Logger());
async function run() {
    await helper.getCurrentBranchName(workDir);
    await helper.clone(workDir, 'test-branch', context);
    await helper.checkout(workDir, context);
    await helper.gitInit(workDir, 'test-branch');
    await helper.config(workDir, 'name', 'email');
    await helper.runCommand(workDir, ['command1', 'command2']);
    await helper.getDiff(workDir);
    await helper.checkDiff(workDir);
    await helper.commit(workDir, 'commit message');
    await helper.fetchTags(workDir, context);
    await helper.deleteTag(workDir, 'delete-tag', context);
    await helper.copyTag(workDir, 'new-tag', 'from-tag', context);
    await helper.addLocalTag(workDir, 'add-tag');
    await helper.push(workDir, 'test-tag', context);
}

run().catch(error => console.error(error));
```

### Utils
```typescript
import { Utils } from '@technote-space/github-action-helper';
import { context } from '@actions/github';

const {
	isCloned,
	isValidSemanticVersioning,
	normalizeVersion,
	isBranch,
	isRemoteBranch,
	isPrRef,
	getPrMergeRef,
	getPrHeadRef,
	getRefForUpdate,
	getBranch,
	getAccessToken,
	getActor,
	escapeRegExp,
	getRegExp,
	getPrefixRegExp,
	getSuffixRegExp,
	getBoolValue,
	uniqueArray,
	getWorkspace,
	split,
	getArrayInput,
	sleep,
	useNpm,
	replaceAll,
	generateNewPatchVersion,
	generateNewMinorVersion,
	generateNewMajorVersion,
	arrayChunk,
} = Utils;

console.log(isCloned('workDir'));  // e.g. true
console.log(isValidSemanticVersioning('v1.2.3'));  // e.g. true
console.log(normalizeVersion('v1.2-alpha'));  // e.g. 1.2.0-alpha
console.log(normalizeVersion('v1.2-alpha', {onlyCore: true}));  // e.g. 1.2.0
console.log(isBranch('refs/heads/feature/change'));  // e.g. true
console.log(isRemoteBranch('refs/remotes/origin/feature/test'));  // e.g. true
console.log(isPrRef('refs/pull/123/merge'));  // e.g. true
console.log(getPrMergeRef('refs/pull/123/head'));  // e.g. refs/pull/123/merge
console.log(getPrHeadRef('refs/pull/123/merge'));  // e.g. refs/pull/123/head
console.log(getRefForUpdate(context));  // e.g. 'heads%2Fmaster'
console.log(getBranch(context));  // e.g. 'master'
console.log(getAccessToken(true/* required? */));  // e.g. 'token'
console.log(getActor());  // e.g. 'octocat'
console.log(escapeRegExp('.*+?^${}()|[]\\')); // '\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\'
console.log(getRegExp(' test ').test('abc test xyz'));  // e.g. true
console.log(getPrefixRegExp('feature/').test('feature/test'));  // e.g. true
console.log(getSuffixRegExp('.php').test('test.php'));  // e.g. true
console.log(getBoolValue('0'));  // false
console.log(getBoolValue('false'));  // false
console.log(uniqueArray([1, 2, 2, 3, 4, 3]));  // [1, 2, 3, 4]
console.log(getWorkspace());  // e.g. /home/runner/work/RepoOwner/RepoName
console.log(split('test1\ntest2'));  // e.g. ['test1', 'test2']
console.log(split(''));  // e.g. []
console.log(getArrayInput('TEST'));  // e.g. ['test1', 'test2']
console.log(useNpm('dir')); // e.g. true
console.log(replaceAll('test1-test2-test3', 'test', 'abc')); // e.g. abc1-abc2-abc3
console.log(generateNewPatchVersion('v1.2.3')); // v1.2.4
console.log(generateNewMinorVersion('v1.2.3')); // v1.3.0
console.log(generateNewMajorVersion('v1.2.3')); // v2.0.0
console.log(arrayChunk([1, 2, 3, 4, 5, 6, 7], 3)); // [[1, 2, 3], [4, 5, 6], [7]]
async function run () {
    await sleep(1000);
}
run().catch(error => console.error(error));
```

### ContextHelper
```typescript
import { ContextHelper } from '@technote-space/github-action-helper';
import { Logger } from '@technote-space/github-action-log-helper';
import { context } from '@actions/github';

const {
	isRelease,
	isPush,
	isPr,
	isIssue,
	isCron,
	getTagName,
	getSender,
	getRepository,
	getGitUrl,
	showActionInfo,
} = ContextHelper;

console.log(isRelease(context));  // e.g. true
console.log(isPush(context));  // e.g. true
console.log(isPr(context));  // e.g. true
console.log(isIssue(context));  // e.g. true
console.log(isCron(context));  // e.g. true
console.log(getGitUrl());  // e.g. https://octocat:token@github.com/RepoOwner/RepoName.git
console.log(getRepository(context));  // e.g. 'RepoOwner/RepoName'
console.log(getTagName(context));  // e.g. 'v1.2.3'
console.log(getSender(context));  // e.g. 'octocat'
showActionInfo('root dir', new Logger(), context);
```

### Dependencies
[@technote-space/github-action-log-helper](https://github.com/technote-space/github-action-log-helper)

## Author
[GitHub (Technote)](https://github.com/technote-space)  
[Blog](https://technote.space)
