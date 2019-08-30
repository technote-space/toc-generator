# TOC Generator

[![Build Status](https://github.com/technote-space/toc-generator/workflows/Build/badge.svg)](https://github.com/technote-space/toc-generator/actions)
[![Coverage Status](https://coveralls.io/repos/github/technote-space/toc-generator/badge.svg?branch=master)](https://coveralls.io/github/technote-space/toc-generator?branch=master)
[![CodeFactor](https://www.codefactor.io/repository/github/technote-space/toc-generator/badge)](https://www.codefactor.io/repository/github/technote-space/toc-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/technote-space/toc-generator/blob/master/LICENSE)

GitHub Action to generate TOC.  
Just run [DocToc](https://github.com/thlorenz/doctoc) and commit to branch if changed.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Screenshot](#screenshot)
- [Installation](#installation)
- [Action event details](#action-event-details)
  - [Target event](#target-event)
- [Author](#author)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Screenshot

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

## Action event details
### Target event
- push: *

## Author
[GitHub (Technote)](https://github.com/technote-space)  
[Blog](https://technote.space)
