# anchor-markdown-header

[![npm version](https://badge.fury.io/js/%40technote-space%2Fanchor-markdown-header.svg)](https://badge.fury.io/js/%40technote-space%2Fanchor-markdown-header)
[![CI Status](https://github.com/technote-space/anchor-markdown-header/workflows/CI/badge.svg)](https://github.com/technote-space/anchor-markdown-header/actions)
[![codecov](https://codecov.io/gh/technote-space/anchor-markdown-header/branch/master/graph/badge.svg)](https://codecov.io/gh/technote-space/anchor-markdown-header)
[![CodeFactor](https://www.codefactor.io/repository/github/technote-space/anchor-markdown-header/badge)](https://www.codefactor.io/repository/github/technote-space/anchor-markdown-header)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/technote-space/anchor-markdown-header/blob/master/LICENSE)

Generates an anchor for a markdown header.

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<details>
<summary>Details</summary>

- [Install](#install)
- [Example](#example)
- [API](#api)

</details>
<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Install
```shell script
yarn add @technote-space/anchor-markdown-header
```

## Example

```js
import anchor from '@technote-space/anchor-markdown-header';

anchor('"playerJoined" (player)'); 
// --> ["playerJoined" (player)](#playerjoined-player)

anchor('fs.rename(oldPath, newPath, [callback])', 'nodejs.org', 'fs') ;
// --> [fs.rename(oldPath, newPath, [callback])](#fs_fs_rename_oldpath_newpath_callback)

// github.com mode is default
anchor('"playerJoined" (player)') === anchor('"playerJoined" (player)', 'github.com'); 
// --> true
```

## API

`anchor(header[, mode] [, moduleName] [, repetition)`

```js
/**
 * @name anchorMarkdownHeader
 * @function
 * @param header      {String} The header to be anchored.
 * @param mode        {String} The anchor mode (github.com|nodejs.org|bitbucket.org|ghost.org|gitlab.com).
 * @param repetition  {Number} The nth occurrence of this header text, starting with 0. Not required for the 0th instance.
 * @param moduleName  {String} The name of the module of the given header (required only for 'nodejs.org' mode).
 * @return            {String} The header anchor that is compatible with the given mode.
 */
```
