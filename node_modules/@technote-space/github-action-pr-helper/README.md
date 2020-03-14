# GitHub Action PR Helper

[![npm version](https://badge.fury.io/js/%40technote-space%2Fgithub-action-pr-helper.svg)](https://badge.fury.io/js/%40technote-space%2Fgithub-action-pr-helper)
[![CI Status](https://github.com/technote-space/github-action-pr-helper/workflows/CI/badge.svg)](https://github.com/technote-space/github-action-pr-helper/actions)
[![codecov](https://codecov.io/gh/technote-space/github-action-pr-helper/branch/master/graph/badge.svg)](https://codecov.io/gh/technote-space/github-action-pr-helper)
[![CodeFactor](https://www.codefactor.io/repository/github/technote-space/github-action-pr-helper/badge)](https://www.codefactor.io/repository/github/technote-space/github-action-pr-helper)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/technote-space/github-action-pr-helper/blob/master/LICENSE)

*Read this in other languages: [English](README.md), [日本語](README.ja.md).*

PullRequest Helper for GitHub Actions.

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<details>
<summary>Details</summary>

- [Usage](#usage)
- [Arguments](#arguments)
- [Behavior](#behavior)
- [Author](#author)

</details>
<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Usage
1. Install  
   * npm  
   `npm i @technote-space/github-action-pr-helper`
   * yarn  
   `yarn add @technote-space/github-action-pr-helper`
1. Use
```typescript
import { run } from '@technote-space/github-action-pr-helper';

run({
	actionName: 'Test Action',
	actionOwner: 'octocat',
	actionRepo: 'hello-world',
});
```

## Arguments
@see [types.ts](src/types.ts)

## Behavior
1. Initialize working directory  
2. Clone branch named `${prBranchPrefix}${prBranchName}`  
3. Check if clone is succeeded  
3.a Succeeded  
3.a.1 Merge head ref branch  
3.a.2 Abort merge if failed merge  
3.b Failed  
3.b.1 Clone head ref branch  
3.b.2 Create branch named `${prBranchPrefix}${prBranchName}`  
4. Run commands  
5. Check if there is a difference  
5.a No difference  
5.a.1 Find related Pull Request  
5.a.2 Exit if there is no Pull Request  
5.a.3 Close Pull Request and exit if there is no difference between HEAD and head ref  
5.a.4 Get mergeable parameter of Pull Request  
5.b There is a difference  
5.b.1 Commit  
5.b.2 Close Pull Request and exit if there is no difference between HEAD and head ref  
5.b.3 Push  
5.b.4 Create Pull Request or comment with command results  
5.b.5 Get mergeable parameter of Pull Request  
6. Resolve conflicts if it is not mergeable  
6.1 Try to merge and push if merge is succeeded  
6.2 Rebase if merge is failed  
6.2.1 Initialize working directory  
6.2.2 Clone head ref branch  
6.2.3 Create branch named `${prBranchPrefix}${prBranchName}`  
6.2.4 Run commands  
6.2.5 Commit  
6.2.6 Force push  
6.2.7 Update Pull Request  

## Author
[GitHub (Technote)](https://github.com/technote-space)  
[Blog](https://technote.space)
