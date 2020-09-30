# Github Action Log Helper

[![npm version](https://badge.fury.io/js/%40technote-space%2Fgithub-action-log-helper.svg)](https://badge.fury.io/js/%40technote-space%2Fgithub-action-log-helper)
[![CI Status](https://github.com/technote-space/github-action-log-helper/workflows/CI/badge.svg)](https://github.com/technote-space/github-action-log-helper/actions)
[![codecov](https://codecov.io/gh/technote-space/github-action-log-helper/branch/master/graph/badge.svg)](https://codecov.io/gh/technote-space/github-action-log-helper)
[![CodeFactor](https://www.codefactor.io/repository/github/technote-space/github-action-log-helper/badge)](https://www.codefactor.io/repository/github/technote-space/github-action-log-helper)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/technote-space/github-action-log-helper/blob/master/LICENSE)

*Read this in other languages: [English](README.md), [日本語](README.ja.md).*

GitHub Actions 用のログヘルパー

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<details>
<summary>Details</summary>

- [インストール](#%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB)
  - [yarn](#yarn)
  - [npm](#npm)
- [Logger](#logger)
- [Author](#author)

</details>
<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## インストール
### yarn
- `yarn add @technote-space/github-action-log-helper`
### npm
- `npm i @technote-space/github-action-log-helper`

## Logger
```typescript
import { Logger } from '@technote-space/github-action-log-helper';

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

logger.getColorString('colored text', 'green'); // Color: 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white'
logger.getColorString('colored text', 'yellow', 'underline'); // Attribute: 'bold' | 'underline' | 'italic'
logger.c('colored text', 'yellow', 'underline'); // alias
 ```

## Author
[GitHub (Technote)](https://github.com/technote-space)  
[Blog](https://technote.space)
