# TOC Generator

[![CI Status](https://github.com/technote-space/toc-generator/workflows/CI/badge.svg)](https://github.com/technote-space/toc-generator/actions)
[![codecov](https://codecov.io/gh/technote-space/toc-generator/branch/master/graph/badge.svg)](https://codecov.io/gh/technote-space/toc-generator)
[![CodeFactor](https://www.codefactor.io/repository/github/technote-space/toc-generator/badge)](https://www.codefactor.io/repository/github/technote-space/toc-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/technote-space/toc-generator/blob/master/LICENSE)

*Read this in other languages: [English](README.md), [日本語](README.ja.md).*

これは目次を生成する`GitHub Actions`です。  
[DocToc](https://github.com/thlorenz/doctoc) を実行し変更があればコミットします。  

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<details>
<summary>Details</summary>

- [インストール](#%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB)
- [スクリーンショット](#%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88)
- [オプション](#%E3%82%AA%E3%83%97%E3%82%B7%E3%83%A7%E3%83%B3)
- [Action イベント詳細](#action-%E3%82%A4%E3%83%99%E3%83%B3%E3%83%88%E8%A9%B3%E7%B4%B0)
  - [対象イベント](#%E5%AF%BE%E8%B1%A1%E3%82%A4%E3%83%99%E3%83%B3%E3%83%88)
  - [Conditions](#conditions)
- [補足](#%E8%A3%9C%E8%B6%B3)
  - [GITHUB_TOKEN](#github_token)
  - [プルリクエストの作成](#%E3%83%97%E3%83%AB%E3%83%AA%E3%82%AF%E3%82%A8%E3%82%B9%E3%83%88%E3%81%AE%E4%BD%9C%E6%88%90)
  - [Context variables](#context-variables)
  - [Context PR variables](#context-pr-variables)
- [このアクションを使用しているリポジトリの例](#%E3%81%93%E3%81%AE%E3%82%A2%E3%82%AF%E3%82%B7%E3%83%A7%E3%83%B3%E3%82%92%E4%BD%BF%E7%94%A8%E3%81%97%E3%81%A6%E3%81%84%E3%82%8B%E3%83%AA%E3%83%9D%E3%82%B8%E3%83%88%E3%83%AA%E3%81%AE%E4%BE%8B)
- [Author](#author)

</details>
<!-- END doctoc generated TOC please keep comment here to allow auto update -->

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
         - uses: technote-space/toc-generator@v2
   ```

## スクリーンショット
![behavior](https://raw.githubusercontent.com/technote-space/toc-generator/images/screenshot.gif)

## オプション
| name | description | default | required | e.g. |
|:---:|:---|:---:|:---:|:---:|
|TARGET_PATHS|対象のファイルパス (カンマ区切り, [詳細](https://github.com/thlorenz/doctoc#adding-toc-to-individual-files))|`README*.md`|true|`README*.md,CHANGELOG.md`, `.`|
|TOC_TITLE|目次タイトル|`**Table of Contents**`| |`''`|
|MAX_HEADER_LEVEL|Heading最大レベル ([詳細](https://github.com/thlorenz/doctoc#specifying-a-maximum-heading-level-for-toc-entries))| | |`3`|
|FOLDING|目次を折りたたみ式にするかどうか|`false`| |`true`|
|COMMIT_MESSAGE|コミットメッセージ|`docs: update TOC`|true|`feat: update TOC`|
|COMMIT_NAME|コミット時に設定する名前|`${github.actor}`| | |
|COMMIT_EMAIL|コミット時に設定するメールアドレス|`${github.actor}@users.noreply.github.com`| | |
|CREATE_PR|プルリクエストを作成するかどうか|`true`| |`false`|
|PR_BRANCH_PREFIX|プルリクエストのブランチプリフィックス|`toc-generator/`|true| |
|PR_BRANCH_NAME|プルリクエストのブランチ名<br>[Context variables](#context-variables)|`update-toc-${PR_ID}`|true|`toc-${PR_NUMBER}`|
|PR_TITLE|プルリクエストのタイトル<br>[Context variables](#context-variables)|`docs: update TOC (${PR_MERGE_REF})`|true|`feat: update TOC`|
|PR_BODY|プルリクエストの本文<br>[Context PR variables](#context-pr-variables)|[action.yml](action.yml)|true| |
|PR_COMMENT_BODY|プルリクエストの本文（コメント用）<br>[Context PR variables](#context-pr-variables)|[action.yml](action.yml)| | |
|PR_CLOSE_MESSAGE|プルリクエストを閉じるときのメッセージ|`This PR has been closed because it is no longer needed.`| | |
|TARGET_BRANCH_PREFIX|ブランチ名のフィルタ| | |`release/`|
|INCLUDE_LABELS|プルリクエストに付与されているかチェックするラベル| | |`Label1, Label2`|
|OPENING_COMMENT|開始コメント (DocToc以外のため)|`<!-- toc `| | |
|CLOSING_COMMENT|終了コメント (DocToc以外のため)|`<!-- tocstop `| | |
|GITHUB_TOKEN|アクセストークン|`${{github.token}}`|true|`${{secrets.ACCESS_TOKEN}}`|

## Action イベント詳細
### 対象イベント
| eventName: action | condition |
|:---:|:---:|
|push: *|[condition1](#condition1)|
|pull_request: \[opened, synchronize, reopened, labeled, unlabeled]|[condition2](#condition2)|
|pull_request: \[closed]||

- 次のアクティビティタイプは明示的に指定する必要があります。 ([詳細](https://help.github.com/ja/github/automating-your-workflow-with-github-actions/events-that-trigger-workflows#pull-request-event-pull_request))
  - `labeled`, `unlabeled`, `closed`
### Conditions
#### condition1
- ブランチへのプッシュ (タグのプッシュではない)
  - ブランチ名 ([`TARGET_BRANCH_PREFIX`](#%E3%82%AA%E3%83%97%E3%82%B7%E3%83%A7%E3%83%B3))
#### condition2
- 指定したラベルが付与されているかどうか ([`INCLUDE_LABELS`](#%E3%82%AA%E3%83%97%E3%82%B7%E3%83%A7%E3%83%B3))
- ブランチ名 ([`TARGET_BRANCH_PREFIX`](#%E3%82%AA%E3%83%97%E3%82%B7%E3%83%A7%E3%83%B3))

## 補足
### GITHUB_TOKEN
GitHub Actions で提供される`GITHUB_TOKEN`は連続するイベントを作成する権限がありません。  
したがって、プッシュによってトリガーされるビルドアクションなどは実行されません。  

これはブランチプロテクションを設定していると問題になる場合があります。  

もしアクションをトリガーしたい場合は代わりに`personal access token`を使用してください。  
1. public_repo または repo の権限で [Personal access token](https://help.github.com/ja/articles/creating-a-personal-access-token-for-the-command-line) を生成  
(repo はプライベートリポジトリで必要です)  
1. [ACCESS_TOKENとして保存](https://help.github.com/ja/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets)
1. `GITHUB_TOKEN`の代わりに`ACCESS_TOKEN`を使用するように設定  
   例：`.github/workflows/toc.yml`
   ```yaml
   on: push
   name: TOC Generator
   jobs:
     generateTOC:
       name: TOC Generator
       runs-on: ubuntu-latest
       steps:
         - uses: technote-space/toc-generator@v2
           with:
             GITHUB_TOKEN: ${{ secrets.ACCESS_TOKEN }}
   ```

### プルリクエストの作成
`CREATE_PR` に `true` (default) を設定 かつ `pull_request` イベントを設定した場合は、変更はプルリクエストにコミットされます。  

```yaml
on: pull_request
name: TOC Generator
jobs:
 generateTOC:
   name: TOC Generator
   runs-on: ubuntu-latest
   steps:
     - uses: technote-space/toc-generator@v2
```

![create pr](https://raw.githubusercontent.com/technote-space/toc-generator/images/create_pr.png)

`closed`アクティビティタイプが設定されている場合、このアクションは不要になったプルリクエストを閉じます。

```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened, closed]
name: TOC Generator
jobs:
 generateTOC:
   name: TOC Generator
   runs-on: ubuntu-latest
   steps:
     - uses: technote-space/toc-generator@v2
```

### Context variables
| name | description |
|:---|:---|
| PR_NUMBER | pull_request.number (例：`11`) |
| PR_NUMBER_REF | `#${pull_request.number}` (例：`#11`) |
| PR_ID | pull_request.id (例：`21031067`) |
| PR_HEAD_REF | pull_request.head.ref (例：`change`) |
| PR_BASE_REF | pull_request.base.ref (例：`master`) |
| PR_MERGE_REF | pull_request.base.ref (例：`change -> master`) |
| PR_TITLE | pull_request.title (例：`update the README with new information.`) |

[Payload example](https://developer.github.com/v3/activity/events/types/#webhook-payload-example-28)

### Context PR variables
- [Context variables](#context-variables)

| name | description |
|:---|:---|
| PR_LINK | プルリクエストへのリンク |
| COMMANDS_OUTPUT | TOC コマンドの結果 |
| FILES_SUMMARY | 例：`Changed 2 files` |
| FILES | 変更されたファイル一覧 |

## このアクションを使用しているリポジトリの例
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
