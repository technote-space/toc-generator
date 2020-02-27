# GitHub Action PR Helper

[![npm version](https://badge.fury.io/js/%40technote-space%2Fgithub-action-pr-helper.svg)](https://badge.fury.io/js/%40technote-space%2Fgithub-action-pr-helper)
[![CI Status](https://github.com/technote-space/github-action-pr-helper/workflows/CI/badge.svg)](https://github.com/technote-space/github-action-pr-helper/actions)
[![codecov](https://codecov.io/gh/technote-space/github-action-pr-helper/branch/master/graph/badge.svg)](https://codecov.io/gh/technote-space/github-action-pr-helper)
[![CodeFactor](https://www.codefactor.io/repository/github/technote-space/github-action-pr-helper/badge)](https://www.codefactor.io/repository/github/technote-space/github-action-pr-helper)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/technote-space/github-action-pr-helper/blob/master/LICENSE)

*Read this in other languages: [English](README.md), [日本語](README.ja.md).*

GitHub Actions 用のプルリクヘルパー

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<details>
<summary>Details</summary>

- [使用方法](#%E4%BD%BF%E7%94%A8%E6%96%B9%E6%B3%95)
- [引数](#%E5%BC%95%E6%95%B0)
- [動作](#%E5%8B%95%E4%BD%9C)
- [Author](#author)

</details>
<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## 使用方法
1. インストール  
   * npm  
   `npm i @technote-space/github-action-pr-helper`
   * yarn  
   `yarn add @technote-space/github-action-pr-helper`
1. 使用
```typescript
import { run } from '@technote-space/github-action-pr-helper';

run({
	actionName: 'Test Action',
	actionOwner: 'octocat',
	actionRepo: 'hello-world',
});
```

## 引数
@see [types.ts](src/types.ts)

## 動作
1. 作業ディレクトリを初期化  
2. ブランチ `${prBranchPrefix}${prBranchName}` をclone  
3. cloneが成功したか確認  
3.a 成功した場合  
3.a.1 head refをマージ  
3.a.2 マージに失敗したらabort merge  
3.b 失敗した場合  
3.b.1 head refをclone  
3.b.2 ブランチ `${prBranchPrefix}${prBranchName}` を作成  
4. コマンドを実行  
5. 変更があるかをチェック  
5.a 変更がない場合  
5.a.1 関連するプルリクエストを取得  
5.a.2 プルリクエストがない場合、終了  
5.a.3 HEADとhead refに違いがない場合、プルリクエストを閉じて終了  
5.a.4 マージ可能かどうかのパラメータを取得  
5.b 変更がある場合  
5.b.1 Commit  
5.b.2 HEADとhead refに違いがない場合、プルリクエストを閉じて終了  
5.b.3 Push  
5.b.4 コマンドの実行結果とともにプルリクエストまたはコメントを作成  
5.b.5 マージ可能かどうかのパラメータを取得  
6. マージ可能でない場合、コンフリクトを解決  
6.1 マージを試みて成功したらPush  
6.2 マージが失敗したらRebase処理  
6.2.1 作業ディレクトリを初期化  
6.2.2 ref branchをclone  
6.2.3 ブランチ `${prBranchPrefix}${prBranchName}` を作成  
6.2.4 コマンドを実行  
6.2.5 Commit  
6.2.6 Force push  
6.2.7 プルリクエストを更新  

## Author
[GitHub (Technote)](https://github.com/technote-space)  
[Blog](https://technote.space)
