# TOC Generator

[![Build Status](https://github.com/technote-space/toc-generator/workflows/Build/badge.svg)](https://github.com/technote-space/toc-generator/actions)
[![Coverage Status](https://coveralls.io/repos/github/technote-space/toc-generator/badge.svg?branch=master)](https://coveralls.io/github/technote-space/toc-generator?branch=master)
[![CodeFactor](https://www.codefactor.io/repository/github/technote-space/toc-generator/badge)](https://www.codefactor.io/repository/github/technote-space/toc-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/technote-space/toc-generator/blob/master/LICENSE)

GitHub Action to generate TOC.  
Just run [DocToc](https://github.com/thlorenz/doctoc) and commit to branch if changed.

<!-- START doctoc -->
<!-- END doctoc -->

## Installation
1. Setup workflow  
   e.g. `.github/workflows/push.yml`
   ```yaml
   on: push
   name: Push
   jobs:
     assignAuthor:
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
### COMMIT_MESSAGE
Commit message.  
default: `'docs: Update TOC'`  

## Action event details
### Target event
- push: *

## Addition
### Recommended setting
#### Specifying location of toc
see: https://github.com/thlorenz/doctoc#specifying-location-of-toc  
```markdown
<!-- START doctoc -->
<!-- END doctoc -->
```

## Author
[GitHub (Technote)](https://github.com/technote-space)  
[Blog](https://technote.space)
