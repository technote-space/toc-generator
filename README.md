# TOC Generator

[![Build Status](https://github.com/technote-space/toc-generator/workflows/Build/badge.svg)](https://github.com/technote-space/toc-generator/actions)
[![codecov](https://codecov.io/gh/technote-space/toc-generator/branch/master/graph/badge.svg)](https://codecov.io/gh/technote-space/toc-generator)
[![CodeFactor](https://www.codefactor.io/repository/github/technote-space/toc-generator/badge)](https://www.codefactor.io/repository/github/technote-space/toc-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/technote-space/toc-generator/blob/master/LICENSE)

GitHub Action to generate TOC (Table of Contents).  
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
- [Addition](#addition)

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
### TOC_TITLE
TOC Title.
default: `'**Table of Contents**'`
### COMMIT_MESSAGE
Commit message.  
default: `'docs: Update TOC'`  

## Action event details
### Target event
- push: *

## Addition
   ```

## GitHub Actions using this Action
- [TOC Generator](https://github.com/technote-space/toc-generator)
- [Release GitHub Actions](https://github.com/technote-space/release-github-actions)
- [Auto card labeler](https://github.com/technote-space/auto-card-labeler)
- [Assign Author](https://github.com/technote-space/assign-author)

## Author
[GitHub (Technote)](https://github.com/technote-space)  
[Blog](https://technote.space)
