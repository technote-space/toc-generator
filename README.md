# TOC Generator

[![Build Status](https://github.com/technote-space/toc-generator/workflows/Build/badge.svg)](https://github.com/technote-space/toc-generator/actions)
[![codecov](https://codecov.io/gh/technote-space/toc-generator/branch/master/graph/badge.svg)](https://codecov.io/gh/technote-space/toc-generator)
[![CodeFactor](https://www.codefactor.io/repository/github/technote-space/toc-generator/badge)](https://www.codefactor.io/repository/github/technote-space/toc-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/technote-space/toc-generator/blob/master/LICENSE)

*Read this in other languages: [English](README.md), [日本語](README.ja.md).*

This is a `GitHub Action` to generate TOC (Table of Contents),  
which executes [DocToc](https://github.com/thlorenz/doctoc) and commits if changed.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Screenshot](#screenshot)
- [Installation](#installation)
- [Options](#options)
  - [TARGET_PATHS](#target_paths)
  - [TOC_TITLE](#toc_title)
  - [PR_BRANCH_NAME](#pr_branch_name)
  - [PR_TITLE](#pr_title)
  - [COMMIT_MESSAGE](#commit_message)
  - [INCLUDE_LABELS](#include_labels)
  - [BRANCH_PREFIX](#branch_prefix)
  - [DELETE_PACKAGE](#delete_package)
- [Action event details](#action-event-details)
  - [Target event](#target-event)
  - [Conditions](#conditions)
    - [condition1](#condition1)
    - [condition2](#condition2)
- [Addition](#addition)
  - [Commit](#commit)
  - [Create PullRequest](#create-pullrequest)
  - [Context variables](#context-variables)
- [GitHub Actions using this Action](#github-actions-using-this-action)
- [Author](#author)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Screenshot
![behavior](https://raw.githubusercontent.com/technote-space/toc-generator/images/screenshot.gif)

## Installation
1. Specify location of TOC (option)  
e.g. `README.md`  
   ```markdown
   <!-- START doctoc -->
   <!-- END doctoc -->
   ```
   [detail](https://github.com/thlorenz/doctoc#specifying-location-of-toc)  
1. Setup workflow  
   e.g. `.github/workflows/toc.yml`
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

## Options
### TARGET_PATHS
Target file path. (Comma separated, [Detail](https://github.com/thlorenz/doctoc#adding-toc-to-individual-files))  
default: `'README.md'`  
e.g. `'README.md,README.ja.md'`  
e.g. `.`

### TOC_TITLE
TOC Title.  
default: `'**Table of Contents**'`  
e.g. `''`

### PR_BRANCH_NAME
PullRequest branch name.  
If this option is set, changes will be committed to PullRequest.  
default: `''`  
e.g. `docs/toc-${PR_NUMBER}`  
[Detail](#create-pullrequest)  
[Context variables](#context-variables)

### PR_TITLE
PullRequest title.  
default: `'docs: Update TOC'`  
e.g. `feat: update TOC (${PR_HEAD_REF})`  
[Context variables](#context-variables)

### COMMIT_MESSAGE
Commit message.  
default: `'docs: Update TOC'`  
e.g. `feat: update TOC`

### INCLUDE_LABELS
Labels used to check if the PullRequest has it.  
default: `''`  
e.g. `'Label1, Label2'`  
e.g. 
```yaml
INCLUDE_LABELS: |
  Test Label1
  Test Label2
```

### BRANCH_PREFIX
Branch name prefix.  
default: `''`  
e.g. `master`

### DELETE_PACKAGE
Whether to delete package file before install DocToc for performance.  
default: `'1'`  
e.g. `''`

## Action event details
### Target event
| eventName: action | condition |
|:---:|:---:|
|push: *|[condition1](#condition1)|
|pull_request: \[opened, synchronize, reopened, labeled, unlabeled]|[condition2](#condition2)|
### Conditions
#### condition1
- push to branch (not tag)
  - branch name ([`BRANCH_PREFIX`](#branch_prefix))
- not set `PR_BRANCH_NAME`
#### condition2
- [specified labels](#include_labels) included?

## Addition
### Commit
The `GITHUB_TOKEN` that is provided as a part of `GitHub Actions` doesn't have authorization to create any successive events.  
So it won't spawn actions which triggered by push.  

![GITHUB_TOKEN](https://raw.githubusercontent.com/technote-space/toc-generator/images/no_access_token.png)

This can be a problem if you have branch protection configured.  

If you want to trigger actions, use a personal access token instead.  
1. Generate a [personal access token](https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line) with the public_repo or repo scope.  
(repo is required for private repositories).  
1. [Save as ACCESS_TOKEN](https://help.github.com/en/articles/virtual-environments-for-github-actions#creating-and-using-secrets-encrypted-variables)
1. Use `ACCESS_TOKEN` instead of `GITHUB_TOKEN`.  
   e.g. `.github/workflows/toc.yml`
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

### Create PullRequest
If you set `PR_BRANCH_NAME` option like following yaml, changes will be committed to PullRequest.  
```yaml
on: pull_request
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
          PR_BRANCH_NAME: docs/toc-${PR_NUMBER}
```

![create pr](https://raw.githubusercontent.com/technote-space/toc-generator/images/create_pr.png)

If you want to close PullRequest when PullRequest to merge has been closed, please set `closed` activity type.  

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
     - name: TOC Generator
       uses: technote-space/toc-generator@v1
       with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          PR_BRANCH_NAME: docs/toc-${PR_NUMBER}
```

### Context variables
| name | description |
|:---|:---|
| PR_NUMBER | pull_request.number (e.g. `11`) |
| PR_ID | pull_request.id (e.g. `21031067`) |
| PR_HEAD_REF | pull_request.head.ref (e.g. `change`) |
| PR_BASE_REF | pull_request.base.ref (e.g. `master`) |

[Payload example](https://developer.github.com/v3/activity/events/types/#webhook-payload-example-28)

## GitHub Actions using this Action
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
