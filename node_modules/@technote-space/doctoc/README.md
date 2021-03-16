# DocToc

[![npm version](https://badge.fury.io/js/%40technote-space%2Fdoctoc.svg)](https://badge.fury.io/js/%40technote-space%2Fdoctoc)
[![CI Status](https://github.com/technote-space/doctoc/workflows/CI/badge.svg)](https://github.com/technote-space/doctoc/actions)
[![codecov](https://codecov.io/gh/technote-space/doctoc/branch/master/graph/badge.svg)](https://codecov.io/gh/technote-space/doctoc)
[![CodeFactor](https://www.codefactor.io/repository/github/technote-space/doctoc/badge)](https://www.codefactor.io/repository/github/technote-space/doctoc)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/technote-space/doctoc/blob/master/LICENSE)

Generates table of contents for markdown files inside local git repository. Links are compatible with anchors generated
by github or other sites via a command line flag.

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<details>
<summary>Details</summary>

- [Install](#install)
- [Example](#example)
- [Author](#author)

</details>
<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Install
```shell script
yarn add @technote-space/doctoc
```

## Example
```js
import {readFileSync} from 'fs';
import {findMarkdownFiles, transform} from '@technote-space/doctoc';

findMarkdownFiles(__dirname);

transform(readFileSync('README.md', {
  // mode: 'github.com', // github.com | bitbucket.org | gitlab.com | nodejs.org | ghost.org (default: github.com)
  // maxHeaderLevel: 2, // default: 4
  // title: '**Table of Contents**',
  // isNotitle: true,
  // isFolding: true,
  // entryPrefix: '*',
  // processAll: true,
  // updateOnly: true,
  // openingComment: '<!-- toc -->',
  // closingComment: '<!-- tocstop --> ',
  // checkOpeningComments: ['<!-- toc '],
  // checkClosingComments: ['<!-- tocstop '],
  // isCustomMode: false,
  // customTemplate: '<p align="center">${ITEMS}</p>',
  // itemTemplate: '<a href="${LINK}">${TEXT}</a>',
  // separator: '<span>|</span>',
  // footer: '',
}));
```

## Author
[GitHub (Technote)](https://github.com/technote-space)  
[Blog](https://technote.space)
