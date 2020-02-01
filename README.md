# TOC Generator

[![CI Status](https://github.com/technote-space/toc-generator/workflows/CI/badge.svg)](https://github.com/technote-space/toc-generator/actions)
[![codecov](https://codecov.io/gh/technote-space/toc-generator/branch/master/graph/badge.svg)](https://codecov.io/gh/technote-space/toc-generator)
[![CodeFactor](https://www.codefactor.io/repository/github/technote-space/toc-generator/badge)](https://www.codefactor.io/repository/github/technote-space/toc-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/technote-space/toc-generator/blob/master/LICENSE)

*Read this in other languages: [English](README.md), [日本語](README.ja.md).*

This is a `GitHub Action` to generate TOC (Table of Contents),  
which executes [DocToc](https://github.com/thlorenz/doctoc) and commits if changed.

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<details>
<summary>Details</summary>

- [Screenshot](#screenshot)
- [Installation](#installation)
- [Options](#options)
  - [TARGET_PATHS](#target_paths)
  - [TOC_TITLE](#toc_title)
  - [MAX_HEADER_LEVEL](#max_header_level)
  - [FOLDING](#folding)
  - [COMMIT_MESSAGE](#commit_message)
  - [COMMIT_NAME](#commit_name)
  - [COMMIT_EMAIL](#commit_email)
  - [PR_BRANCH_PREFIX](#pr_branch_prefix)
  - [PR_BRANCH_NAME](#pr_branch_name)
  - [PR_TITLE](#pr_title)
  - [PR_BODY](#pr_body)
  - [PR_COMMENT_BODY](#pr_comment_body)
  - [PR_CLOSE_MESSAGE](#pr_close_message)
  - [TARGET_BRANCH_PREFIX](#target_branch_prefix)
  - [INCLUDE_LABELS](#include_labels)
- [Action event details](#action-event-details)
  - [Target event](#target-event)
  - [Conditions](#conditions)
- [Addition](#addition)
  - [Commit](#commit)
  - [Create PullRequest](#create-pullrequest)
  - [Context variables](#context-variables)
  - [Context PR variables](#context-pr-variables)
- [Sample repositories using this Action](#sample-repositories-using-this-action)
- [Author](#author)

</details>
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
           uses: technote-space/toc-generator@v2
           with:
             GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
   ```

## Options
### TARGET_PATHS
Target file path. (Comma separated, [Detail](https://github.com/thlorenz/doctoc#adding-toc-to-individual-files))  
default: `'README*.md'`  
e.g. `.`

### TOC_TITLE
TOC Title.  
default: `'**Table of Contents**'`  
e.g. `''`

### MAX_HEADER_LEVEL
Maximum heading level. ([Detail](https://github.com/thlorenz/doctoc#specifying-a-maximum-heading-level-for-toc-entries))  
default: ``  
e.g. `3`

### FOLDING
Whether to make TOC foldable.  
default: `false`  
e.g. `'true'`

### COMMIT_MESSAGE
Commit message.  
default: `'docs: Update TOC'`  
e.g. `feat: update TOC`

### COMMIT_NAME
Git commit name.  
default: `'${github.actor}'`  
[About Github Context](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/contexts-and-expression-syntax-for-github-actions#github-context)

### COMMIT_EMAIL
Git commit email.  
default: `'${github.actor}@users.noreply.github.com'`  
[About Github Context](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/contexts-and-expression-syntax-for-github-actions#github-context)

### PR_BRANCH_PREFIX
PullRequest branch prefix.  
default: `'toc-generator/'`

### PR_BRANCH_NAME
PullRequest branch name.  
default: `'update-toc-${PR_ID}'`  
e.g. `toc-${PR_NUMBER}`  
[Context variables](#context-variables)

### PR_TITLE
PullRequest title.  
default: `'docs: Update TOC (${PR_MERGE_REF})'`  
e.g. `feat: update TOC`  
[Context variables](#context-variables)

### PR_BODY
PullRequest body.  
default:
```
## Base PullRequest

${PR_TITLE} (${PR_NUMBER_REF})

## Command results
<details>
  <summary>Details: </summary>

  ${COMMANDS_OUTPUT}

</details>

## Changed files
<details>
  <summary>${FILES_SUMMARY}: </summary>

  ${FILES}

</details>

<hr>

[:octocat: Repo](${ACTION_URL}) | [:memo: Issues](${ACTION_URL}/issues) | [:department_store: Marketplace](${ACTION_MARKETPLACE_URL})
```
[Context PR variables](#context-pr-variables)

### PR_COMMENT_BODY
PullRequest body for comment.  
default:
```
## Command results
<details>
  <summary>Details: </summary>

  ${COMMANDS_OUTPUT}

</details>

## Changed files
<details>
  <summary>${FILES_SUMMARY}: </summary>

  ${FILES}

</details>

<hr>

[:octocat: Repo](${ACTION_URL}) | [:memo: Issues](${ACTION_URL}/issues) | [:department_store: Marketplace](${ACTION_MARKETPLACE_URL})
```
[Context PR variables](#context-pr-variables)

### PR_CLOSE_MESSAGE
Message body when closing PullRequest.  
default: `'This PR is no longer needed because the package looks up-to-date.'`

### TARGET_BRANCH_PREFIX
Filter by branch name.  
default: `''`  
e.g. `'release/'`

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

## Action event details
### Target event
| eventName: action | condition |
|:---:|:---:|
|push: *|[condition1](#condition1)|
|pull_request: \[opened, synchronize, reopened, labeled, unlabeled]|[condition2](#condition2)|
|pull_request: \[closed]||

- The following activity types must be explicitly specified ([detail](https://help.github.com/en/github/automating-your-workflow-with-github-actions/events-that-trigger-workflows#pull-request-event-pull_request))
  - `labeled`, `unlabeled`, `closed`
### Conditions
#### condition1
- push to branch (not tag)
  - branch name ([`TARGET_BRANCH_PREFIX`](#target_branch_prefix))
#### condition2
- [specified labels](#include_labels) included?
- branch name ([`TARGET_BRANCH_PREFIX`](#target_branch_prefix))

## Addition
### Commit
The `GITHUB_TOKEN` that is provided as a part of `GitHub Actions` doesn't have authorization to create any successive events.  
So it won't spawn actions which triggered by push.  

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
           uses: technote-space/toc-generator@v2
           with:
             # GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
             GITHUB_TOKEN: ${{ secrets.ACCESS_TOKEN }}
   ```

### Create PullRequest
If you set `pull_request` event like following yaml, changes will be committed to PullRequest.  
```yaml
on: pull_request
name: TOC Generator
jobs:
 generateTOC:
   name: TOC Generator
   runs-on: ubuntu-latest
   steps:
     - name: TOC Generator
       uses: technote-space/toc-generator@v2
       with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

![create pr](https://raw.githubusercontent.com/technote-space/toc-generator/images/create_pr.png)

If the `closed` activity type is set, this action closes the PR when it is no longer needed.  

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
       uses: technote-space/toc-generator@v2
       with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Context variables
| name | description |
|:---|:---|
| PR_NUMBER | pull_request.number (e.g. `11`) |
| PR_NUMBER_REF | `#${pull_request.number}` (e.g. `#11`) |
| PR_ID | pull_request.id (e.g. `21031067`) |
| PR_HEAD_REF | pull_request.head.ref (e.g. `change`) |
| PR_BASE_REF | pull_request.base.ref (e.g. `master`) |
| PR_MERGE_REF | pull_request.base.ref (e.g. `change -> master`) |
| PR_TITLE | pull_request.title (e.g. `Update the README with new information.`) |

[Payload example](https://developer.github.com/v3/activity/events/types/#webhook-payload-example-28)

### Context PR variables
- [Context variables](#context-variables)

| name | description |
|:---|:---|
| PR_LINK | Link to PR |
| COMMANDS_OUTPUT | Result of TOC command |
| FILES_SUMMARY | e.g. `Changed 2 files` |
| FILES | Changed file list |

## Sample repositories using this Action
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
