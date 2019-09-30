# GitHub Action Helper

[![npm version](https://badge.fury.io/js/%40technote-space%2Fgithub-action-helper.svg)](https://badge.fury.io/js/%40technote-space%2Fgithub-action-helper)
[![Build Status](https://github.com/technote-space/github-action-helper/workflows/Build/badge.svg)](https://github.com/technote-space/github-action-helper/actions)
[![codecov](https://codecov.io/gh/technote-space/github-action-helper/branch/master/graph/badge.svg)](https://codecov.io/gh/technote-space/github-action-helper)
[![CodeFactor](https://www.codefactor.io/repository/github/technote-space/github-action-helper/badge)](https://www.codefactor.io/repository/github/technote-space/github-action-helper)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/technote-space/github-action-helper/blob/master/LICENSE)

*Read this in other languages: [English](README.md), [日本語](README.ja.md).*

GitHub Action 用のヘルパー

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [使用方法](#%E4%BD%BF%E7%94%A8%E6%96%B9%E6%B3%95)
  - [Logger](#logger)
  - [Command](#command)
  - [ApiHelper](#apihelper)
  - [GitHelper](#githelper)
  - [Utils](#utils)
- [Author](#author)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## 使用方法
1. インストール  
`npm i @technote-space/github-action-helper`
1. 使用
```typescript
import { Logger, Command, Utils } from '@technote-space/github-action-helper';
```

### Logger
```typescript
import { Logger } from '@technote-space/github-action-helper';

const logger = new Logger();
logger.startProcess('Process name');
logger.displayCommand('command');
logger.displayStdout('stdout1\nstdout2');
logger.displayStderr('stderr1\nstderr2');
logger.log();
logger.info('output info');
logger.endProcess();

// ::group::Process name
// [command]command
//   >> stdout1
//   >> stdout2
// ::warning::  >> stderr1
// ::warning::  >> stderr2
// 
// > output info
// ::endgroup::
```

### Command
```typescript
import { Logger, Command } from '@technote-space/github-action-helper';

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

run();
```

### ApiHelper
```typescript
import { Logger, ApiHelper } from '@technote-space/github-action-helper';
import { context } from '@actions/github';
import { GitHub } from '@actions/github' ;
import { getInput } from '@actions/core';
import path from 'path';

const helper = new ApiHelper(new Logger());
async function run() {
    await helper.commit(path.resolve(__dirname, '..'), 'feat: commit message', ['README.md', 'package.json'], new GitHub(getInput('GITHUB_TOKEN', {required: true})), context);
}

run();
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

run();
```

### Utils
```typescript
import { Logger, Utils } from '@technote-space/github-action-helper';
import { context } from '@actions/github';
import path from 'path';

const {
	isRelease,
	getWorkspace,
	getGitUrl,
	escapeRegExp,
	getBoolValue,
	getRepository,
	getTagName,
	getBranch,
	getRefForUpdate,
	getSender,
	uniqueArray,
	getBuildVersion,
	showActionInfo,
	getArrayInput,
} = Utils;

console.log(isRelease(context));  // e.g. true
console.log(getWorkspace());  // e.g. /home/runner/work/RepoOwner/RepoName
console.log(getGitUrl());  // e.g. https://octocat:token@github.com/RepoOwner/RepoName.git
console.log(escapeRegExp('.*+?^${}()|[]\\')); // '\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\'
console.log(getBoolValue('0'));  // false
console.log(getBoolValue('false'));  // false
console.log(getRepository(context));  // e.g. 'RepoOwner/RepoName'
console.log(getTagName(context));  // e.g. 'v1.2.3'
console.log(getBranch(context));  // e.g. 'master'
console.log(getRefForUpdate(context));  // e.g. 'heads%2Fmaster'
console.log(getSender(context));  // e.g. 'octocat'
console.log(uniqueArray([1, 2, 2, 3, 4, 3]));  // [1, 2, 3, 4]
console.log(getBuildVersion(path.resolve(__dirname, 'build.json')));  // e.g. 'v1.2.3'
showActionInfo(path.resolve(__dirname, '..'), new Logger(), context);
console.log(getArrayInput('TEST'));  // e.g. ['test1', 'test2']
```

## Author
[GitHub (Technote)](https://github.com/technote-space)  
[Blog](https://technote.space)
