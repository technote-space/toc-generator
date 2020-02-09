# Filter GitHub Action

[![npm version](https://badge.fury.io/js/%40technote-space%2Ffilter-github-action.svg)](https://badge.fury.io/js/%40technote-space%2Ffilter-github-action)
[![CI Status](https://github.com/technote-space/filter-github-action/workflows/CI/badge.svg)](https://github.com/technote-space/filter-github-action/actions)
[![codecov](https://codecov.io/gh/technote-space/filter-github-action/branch/master/graph/badge.svg)](https://codecov.io/gh/technote-space/filter-github-action)
[![CodeFactor](https://www.codefactor.io/repository/github/technote-space/filter-github-action/badge)](https://www.codefactor.io/repository/github/technote-space/filter-github-action)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/technote-space/filter-github-action/blob/master/LICENSE)

*Read this in other languages: [English](README.md), [日本語](README.ja.md).*

GitHub Actions を Context などでフィルタリングするためのヘルパー

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<details>
<summary>Details</summary>

- [使用方法](#%E4%BD%BF%E7%94%A8%E6%96%B9%E6%B3%95)
  - [上の例の結果](#%E4%B8%8A%E3%81%AE%E4%BE%8B%E3%81%AE%E7%B5%90%E6%9E%9C)
  - [Ignore check](#ignore-check)
- [Author](#author)

</details>
<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## 使用方法
1. インストール  
`npm i @technote-space/filter-github-action`
1.   
```typescript
import { Context } from '@actions/github/lib/context';
import { context } from '@actions/github';
import { isTargetEvent, isTargetLabels } from '@technote-space/filter-github-action';

console.log( isTargetEvent( {
	'release': [
		// or
		'published',
		'rerequested',
	],
	'push': [
		// use context
		(context: Context): boolean => /^refs\/tags\//.test(context.ref),
		'rerequested',
	],
	'pull_request': [
		// or
		[
			// and
			(context: Context): boolean => /^refs\/tags\//.test(context.ref),
			'rerequested',
		],
	],
	// wildcard
	'project_card': '*',
}, context ) );

const includes = ['label1', 'label2'];
const excludes = ['label3', 'label4'];
console.log( isTargetLabels( includes, excludes, context ) );
```

### 上の例の結果
#### isTargetEvent
|eventName|action|ref|result|
|:---:|:---:|:---:|:---:|
|release|published|*|true|
|release|rerequested|*|true|
|release|created|*|false|
|push|*|refs/tags/v1.2.3|true|
|push|*|refs/heads/v1.2.3|false|
|push|rerequested|*|true|
|pull_request|rerequested|refs/tags/v1.2.3|true|
|pull_request|created|refs/tags/v1.2.3|false|
|pull_request|rerequested|refs/heads/v1.2.3|false|
|project_card|*|*|true|
|label|*|*|false|

#### isTargetLabels
|eventName|context labels|includes|excludes|result|
|:---:|:---:|:---:|:---:|:---:|
|issues|---|---|---|true|
|pull_request|---|---|---|true|
|push|---|---|---|true|
|issues|label1|---|---|true|
|issues|---|label1|---|false|
|issues|label1|label1|---|true|
|issues|label1, label2|label1|---|true|
|issues|label1|label1, label2|---|true|
|issues|---|---|label1|true|
|issues|label1|---|label1|false|
|issues|label1, label2|label1|label2|false|
|issues|label1, label2|label1|label3|true|

### Ignore check
```
with:
  IGNORE_CONTEXT_CHECK: true
```

## Author
[GitHub (Technote)](https://github.com/technote-space)  
[Blog](https://technote.space)
