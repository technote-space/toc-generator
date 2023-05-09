 # TOC Generator 内容目录生成器

[![CI Status](https://github.com/technote-space/toc-generator/workflows/CI/badge.svg)](https://github.com/technote-space/toc-generator/actions)
[![codecov](https://codecov.io/gh/technote-space/toc-generator/branch/main/graph/badge.svg)](https://codecov.io/gh/technote-space/toc-generator)
[![CodeFactor](https://www.codefactor.io/repository/github/technote-space/toc-generator/badge)](https://www.codefactor.io/repository/github/technote-space/toc-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/technote-space/toc-generator/blob/main/LICENSE)

*阅读本文件的多语言版本: [English](README.md), [日本語](README.ja.md),[中文版](README.zh.md)。*

这是一个 `GitHub Actions` ，用于生成 TOC (内容目录),  
它会执行 [DocToc](https://github.com/thlorenz/doctoc) 并在发生变更时提交。

## 内容目录

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<details>
<summary>Details</summary>

- [Installation](#installation)
- [Screenshot](#screenshot)
- [Options](#options)
  - [Specify options individually](#specify-options-individually)
- [Action event details](#action-event-details)
  - [Target event](#target-event)
  - [Conditions](#conditions)
- [Addition](#addition)
  - [GITHUB_TOKEN](#github_token)
  - [Create PullRequest](#create-pullrequest)
  - [Context variables](#context-variables)
  - [Context PR variables](#context-pr-variables)
- [Configuration Examples](#configuration-examples)
  - [Example 1](#example-1)
  - [Example 2](#example-2)
  - [Example 3](#example-3)
- [Author](#author)

</details>
<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## 安装
1. 指定 TOC 位置（可选）
示例 `README.md`  
   ```markdown
   <!-- START doctoc -->
   <!-- END doctoc -->
   ```
   [详情](https://github.com/thlorenz/doctoc#specifying-location-of-toc)  
1. 创建 workflow  
   示例 `.github/workflows/toc.yml`
   ```yaml
   on: push
   name: TOC Generator
   jobs:
     generateTOC:
       name: TOC Generator
       runs-on: ubuntu-latest
       steps:
         - uses: technote-space/toc-generator@v4
   ```

## 截图
![行为](https://raw.githubusercontent.com/technote-space/toc-generator/images/screenshot.gif)

## 选项
| 名称 | 描述 | 默认值 | 示例 |
|:---|:---|:---|:---|
|TARGET_PATHS|Target file path. (Comma separated, [Detail](https://github.com/thlorenz/doctoc#adding-toc-to-individual-files))|`README*.md`|`README*.md,CHANGELOG.md`, `.`|
|TOC_TITLE|TOC Title|`**Table of Contents**`|`''`|
|MAX_HEADER_LEVEL|Maximum heading level. ([Detail](https://github.com/thlorenz/doctoc#specifying-a-maximum-heading-level-for-toc-entries))| |`3`|
|CUSTOM_MODE|Whether it is custom mode([Generated Example](samples/README.horizontal.md))|`false`|`true`|
|CUSTOM_TEMPLATE|Custom template for custom mode|`<p align="center">${ITEMS}</p>`| |
|ITEM_TEMPLATE|Item template for custom mode|`<a href="${LINK}">${TEXT}</a>`| |
|SEPARATOR|Separator for custom mode|<code>\<span>|\</span></code>| |
|FOLDING|Whether to make TOC foldable|`false`|`true`|
|COMMIT_MESSAGE|Commit message|`chore(docs): update TOC`|`docs: update TOC`|
|COMMIT_NAME|Git commit name|`${github.actor}`| |
|COMMIT_EMAIL|Git commit email|`${github.actor}@users.noreply.github.com`| |
|CREATE_PR|Whether to create PullRequest|`false`|`true`|
|CHECK_ONLY_DEFAULT_BRANCH|Whether to check only default branch|`false`|`true`|
|PR_BRANCH_PREFIX|PullRequest branch prefix|`toc-generator/`| |
|PR_BRANCH_NAME|PullRequest branch name<br>[Context variables](#context-variables)|`update-toc-${PR_ID}`|`toc-${PR_NUMBER}`|
|PR_TITLE|PullRequest title<br>[Context variables](#context-variables)|`chore(docs): update TOC (${PR_MERGE_REF})`|`docs: update TOC`|
|PR_BODY|PullRequest body<br>[Context PR variables](#context-pr-variables)|[action.yml](action.yml)| |
|PR_COMMENT_BODY|PullRequest body for comment<br>[Context PR variables](#context-pr-variables)|[action.yml](action.yml)| |
|PR_CLOSE_MESSAGE|Message body when closing PullRequest|`This PR has been closed because it is no longer needed.`| |
|TARGET_BRANCH_PREFIX|Filter by branch name| |`release/`|
|INCLUDE_LABELS|Labels used to check if the PullRequest has it| |`Label1, Label2`|
|OPENING_COMMENT|Opening comment (for other than DocToc)|`<!-- toc `| |
|CLOSING_COMMENT|Closing comment (for other than DocToc)|`<!-- tocstop `| |
|SKIP_COMMENT|Change skip comment (default: `<!-- DOCTOC SKIP `)| |`<!-- toc skip `|
|GITHUB_TOKEN|Access token|`${{github.token}}`|`${{secrets.ACCESS_TOKEN}}`|
|SIGNOFF| Add `Signed-off-by` line | |`true`|

### 特殊独立选项
The options used for [doctoc](https://github.com/technote-space/doctoc#example) can be commented to specify values.  
If you want to generate multiple TOCs with different settings, specify the values individually as follows.

示例
```markdown
<!-- START doctoc -->
<!-- param::isNotitle::true:: -->
<!-- param::isCustomMode::true:: -->

<!-- END doctoc -->

...

```

## Action 事件详情
### 目标事件
| eventName: action | condition |
|:---|:---|
|push: *|[condition1](#condition1)|
|pull_request: \[opened, synchronize, reopened, labeled, unlabeled]|[condition2](#condition2)|
|pull_request: \[closed]||
|schedule, repository_dispatch, workflow_dispatch||

- 以下活动类型必须明确指定 （[详情](https://help.github.com/en/github/automating-your-workflow-with-github-actions/events-that-trigger-workflows#pull-request-event-pull_request)）
  - `labeled`, `unlabeled`, `closed`
### 条件
#### condition1
- 推送到分支 (不是tag)
  - 分支名称 ([`TARGET_BRANCH_PREFIX`](#options))
#### condition2
- 包含指定标签？ ([`INCLUDE_LABELS`](#options))
- 分支名称 ([`TARGET_BRANCH_PREFIX`](#options))

## 附加说明
### GITHUB_TOKEN
 `GITHUB_TOKEN` 作为 `GitHub Actions` 的一部分，没有授权来创建任何后续事件。 
因此它不会产生由推送触发的 action 。

如果你配置了分支保护策略，这会是个问题。

如果你想触发 action，使用个人访问令牌来代替。
1. 生成一个 [个人访问令牌](https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line) ，范围需选择 public_repo 或 repo 。  
（私有仓库必须选择 repo）。  
1. [保存为ACCESS_TOKEN](https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets)
1. 使用 `ACCESS_TOKEN` 代替 `GITHUB_TOKEN` 作为输入。
   示例 `.github/workflows/toc.yml`
   ```yaml
   on: push
   name: TOC Generator
   jobs:
     generateTOC:
       name: TOC Generator
       runs-on: ubuntu-latest
       steps:
         - uses: technote-space/toc-generator@v4
           with:
             GITHUB_TOKEN: ${{ secrets.ACCESS_TOKEN }}
   ```

### 创建 PullRequest
如果 `CREATE_PR` 设置为 `true`，则会创建一个 PR 。  

```yaml
on: pull_request
name: TOC Generator
jobs:
  generateTOC:
    name: TOC Generator
    runs-on: ubuntu-latest
    steps:
      - uses: technote-space/toc-generator@v4
        with:
          CREATE_PR: true
```

![创建 PR](https://raw.githubusercontent.com/technote-space/toc-generator/images/create_pr.png)

如果活动类型设置为 `closed`，则该 action 会在 PR 不再需要时关闭它 。 

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
      - uses: technote-space/toc-generator@v4
```

### 上下文变量
| 名称 | 描述 |
|:---|:---|
| PR_NUMBER | pull_request.number (如 `11`) |
| PR_NUMBER_REF | `#${pull_request.number}` (如 `#11`) |
| PR_ID | pull_request.id (如 `21031067`) |
| PR_HEAD_REF | pull_request.head.ref (如 `change`) |
| PR_BASE_REF | pull_request.base.ref (如 `main`) |
| PR_MERGE_REF | pull_request.base.ref (如 `change -> main`) |
| PR_TITLE | pull_request.title (如 `update the README with new information.`) |

[Payload 示例](https://developer.github.com/v3/activity/events/types/#webhook-payload-example-28)

### 上下文 PR 变量
- [上下文变量](#context-variables)

| 名称 | 描述 |
|:---|:---|
| PR_LINK | PR 链接 |
| COMMANDS_OUTPUT | TOC 命令结果 |
| FILES_SUMMARY | 如 `Changed 2 files` |
| FILES | 变更文件列表 |

## 配置示例 Examples
### 示例 1
在没有限制的分支上push时执行 action 并直接提交。

```yaml
on: push
name: TOC Generator
jobs:
  generateTOC:
    name: TOC Generator
    runs-on: ubuntu-latest
    steps:
      - uses: technote-space/toc-generator@v4
```

### 示例 2
通过仅对以 `release/` 开头的分支执行 PR 更新操作，从而创建或更新 PR。

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
      - uses: technote-space/toc-generator@v4
        with:
          CREATE_PR: true
          TARGET_BRANCH_PREFIX: release/
```

### 示例 3
仅在默认分支定时执行action并直接提交。
（使用为其他 workflow 运行而创建的 Token）

```yaml
on:
  schedule:
    - cron: "0 23 * * *"
name: TOC Generator
jobs:
  generateTOC:
    name: TOC Generator
    runs-on: ubuntu-latest
    steps:
      - uses: technote-space/toc-generator@v4
        with:
          GITHUB_TOKEN: ${{ secrets.ACCESS_TOKEN }}
          CHECK_ONLY_DEFAULT_BRANCH: true
```

## 作者
[GitHub (Technote)](https://github.com/technote-space)  
[博客](https://technote.space)
