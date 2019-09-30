# TOC Generator

[![Build Status](https://github.com/technote-space/toc-generator/workflows/Build/badge.svg)](https://github.com/technote-space/toc-generator/actions)
[![codecov](https://codecov.io/gh/technote-space/toc-generator/branch/master/graph/badge.svg)](https://codecov.io/gh/technote-space/toc-generator)
[![CodeFactor](https://www.codefactor.io/repository/github/technote-space/toc-generator/badge)](https://www.codefactor.io/repository/github/technote-space/toc-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/technote-space/toc-generator/blob/master/LICENSE)

*Read this in other languages: [English](README.md), [日本語](README.ja.md).*

This is a `GitHub Action` to generate TOC (Table of Contents).  
Just run [DocToc](https://github.com/thlorenz/doctoc) and commit to branch if changed.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Screenshot](#screenshot)
- [Installation](#installation)
- [Options](#options)
  - [TARGET_PATHS](#target_paths)
  - [TOC_TITLE](#toc_title)
  - [COMMIT_MESSAGE](#commit_message)
- [Action event details](#action-event-details)
  - [Target event](#target-event)
  - [condition](#condition)
- [Addition](#addition)
  - [Commit](#commit)
- [GitHub Actions using this Action](#github-actions-using-this-action)
- [Author](#author)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Screenshot
![behavior](https://raw.githubusercontent.com/technote-space/toc-generator/images/screenshot.gif)

## Installation
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
1. Specifying location of TOC (option)  
see: https://github.com/thlorenz/doctoc#specifying-location-of-toc  
```markdown
<!-- START doctoc -->
<!-- END doctoc -->
```

## Options
### TARGET_PATHS
Target file path. (Comma separated, [Detail](https://github.com/thlorenz/doctoc#adding-toc-to-individual-files))  
default: `'README.md'`  
e.g. `'README.md,README.ja.md'`  
### TOC_TITLE
TOC Title.  
default: `'**Table of Contents**'`
### COMMIT_MESSAGE
Commit message.  
default: `'docs: Update TOC'`  

## Action event details
### Target event
| eventName: action | condition |
|:---:|:---:|
|push: *|[condition](#condition)|
### condition
- push to branch

## Addition
### Commit
The `GITHUB_TOKEN` that is provided as a part of `GitHub Actions` doesn't have authorization to create any successive events.  
So it won't spawn actions which triggered by push.  

![GITHUB_TOKEN](https://raw.githubusercontent.com/technote-space/toc-generator/images/no_access_token.png)

This is a problem if you are setting up branch protection.  

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

## GitHub Actions using this Action
- [TOC Generator](https://github.com/technote-space/toc-generator)
- [Release GitHub Actions](https://github.com/technote-space/release-github-actions)
- [Auto card labeler](https://github.com/technote-space/auto-card-labeler)
- [Assign Author](https://github.com/technote-space/assign-author)

## Author
[GitHub (Technote)](https://github.com/technote-space)  
[Blog](https://technote.space)
