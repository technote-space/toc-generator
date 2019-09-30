# TOC Generator

[![Build Status](https://github.com/technote-space/toc-generator/workflows/Build/badge.svg)](https://github.com/technote-space/toc-generator/actions)
[![codecov](https://codecov.io/gh/technote-space/toc-generator/branch/master/graph/badge.svg)](https://codecov.io/gh/technote-space/toc-generator)
[![CodeFactor](https://www.codefactor.io/repository/github/technote-space/toc-generator/badge)](https://www.codefactor.io/repository/github/technote-space/toc-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/technote-space/toc-generator/blob/master/LICENSE)

*Read this in other languages: [English](README.md), [日本語](README.ja.md).*

これは目次を生成する`GitHub Action`です。  
[DocToc](https://github.com/thlorenz/doctoc) を実行し変更があればコミットします。  

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [スクリーンショット](#%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88)
- [インストール](#%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB)
- [オプション](#%E3%82%AA%E3%83%97%E3%82%B7%E3%83%A7%E3%83%B3)
  - [TARGET_PATHS](#target_paths)
  - [TOC_TITLE](#toc_title)
  - [COMMIT_MESSAGE](#commit_message)
- [Action イベント詳細](#action-%E3%82%A4%E3%83%99%E3%83%B3%E3%83%88%E8%A9%B3%E7%B4%B0)
  - [対象イベント](#%E5%AF%BE%E8%B1%A1%E3%82%A4%E3%83%99%E3%83%B3%E3%83%88)
  - [condition](#condition)
- [補足](#%E8%A3%9C%E8%B6%B3)
  - [コミット](#%E3%82%B3%E3%83%9F%E3%83%83%E3%83%88)
- [このアクションを使用しているアクションの例](#%E3%81%93%E3%81%AE%E3%82%A2%E3%82%AF%E3%82%B7%E3%83%A7%E3%83%B3%E3%82%92%E4%BD%BF%E7%94%A8%E3%81%97%E3%81%A6%E3%81%84%E3%82%8B%E3%82%A2%E3%82%AF%E3%82%B7%E3%83%A7%E3%83%B3%E3%81%AE%E4%BE%8B)
- [Author](#author)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## スクリーンショット
![behavior](https://raw.githubusercontent.com/technote-space/toc-generator/images/screenshot.gif)

## インストール
1. 目次の位置を指定 (option)  
   ```markdown
   <!-- START doctoc -->
   <!-- END doctoc -->
   ```
   [詳細](https://github.com/thlorenz/doctoc#specifying-location-of-toc)  
1. workflow を設定  
   例：`.github/workflows/toc.yml`
   ```yaml
   on: push
   name: TOC Generator
   jobs:
     generateTOC:
       name: TOC Generator
       runs-on: ubuntu-latest
       steps:
         - name: TOC Generator
           uses: technote-space/toc-generator@v1
           with:
             GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
   ```

## オプション
### TARGET_PATHS
対象のファイルパス (カンマ区切り, [詳細](https://github.com/thlorenz/doctoc#adding-toc-to-individual-files))  
default: `'README.md'`  
例：`'README.md,README.ja.md'`  
### TOC_TITLE
目次タイトル  
default: `'**Table of Contents**'`
### COMMIT_MESSAGE
コミットメッセージ    
default: `'docs: Update TOC'`  

## Action イベント詳細
### 対象イベント
| eventName: action | condition |
|:---:|:---:|
|push: *|[condition](#condition)|
### condition
- ブランチへのプッシュ

## 補足
### コミット
GitHub Actions で提供される`GITHUB_TOKEN`は連続するイベントを作成する権限がありません。  
したがって、プッシュによってトリガーされるビルドアクションなどは実行されません。  

![GITHUB_TOKEN](https://raw.githubusercontent.com/technote-space/toc-generator/images/no_access_token.png)

これはブランチプロテクションを設定していると問題になります。

もしアクションをトリガーしたい場合は代わりに`personal access token`を使用してください。  
1. public_repo または repo の権限で [Personal access token](https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line) を生成  
(repo はプライベートリポジトリで必要です)  
1. [ACCESS_TOKENとして保存](https://help.github.com/en/articles/virtual-environments-for-github-actions#creating-and-using-secrets-encrypted-variables)
1. `GITHUB_TOKEN`の代わりに`ACCESS_TOKEN`を使用  
   例：`.github/workflows/toc.yml`
   ```yaml
   on: push
   name: TOC Generator
   jobs:
     generateTOC:
       name: TOC Generator
       runs-on: ubuntu-latest
       steps:
         - name: TOC Generator
           uses: technote-space/toc-generator@v1
           with:
             # GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
             GITHUB_TOKEN: ${{ secrets.ACCESS_TOKEN }}
   ```

![ACCESS_TOKEN](https://raw.githubusercontent.com/technote-space/toc-generator/images/with_access_token.png)

## このアクションを使用しているアクションの例
- [Release GitHub Actions](https://github.com/technote-space/release-github-actions)
  - [toc.yml](https://github.com/technote-space/release-github-actions/blob/master/.github/workflows/toc.yml)
- [Auto card labeler](https://github.com/technote-space/auto-card-labeler)
  - [toc.yml](https://github.com/technote-space/auto-card-labeler/blob/master/.github/workflows/toc.yml)
- [Assign Author](https://github.com/technote-space/assign-author)
  - [toc.yml](https://github.com/technote-space/assign-author/blob/master/.github/workflows/toc.yml)
- [TOC Generator](https://github.com/technote-space/toc-generator)
  - [toc.yml](https://github.com/technote-space/toc-generator/blob/master/.github/workflows/toc.yml)
- [Package Version Check Action](https://github.com/technote-space/package-version-check-action)
  - [toc.yml](https://github.com/technote-space/package-version-check-action/blob/master/.github/workflows/toc.yml)

## Author
[GitHub (Technote)](https://github.com/technote-space)  
[Blog](https://technote.space)
