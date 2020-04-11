# types.ts

> Shared TypeScript definitions for Octokit projects

[![@latest](https://img.shields.io/npm/v/@octokit/types.svg)](https://www.npmjs.com/package/@octokit/types)
[![Build Status](https://github.com/octokit/types.ts/workflows/Test/badge.svg)](https://github.com/octokit/types.ts/actions?workflow=Test)
[![Greenkeeper](https://badges.greenkeeper.io/octokit/types.ts.svg)](https://greenkeeper.io/)

## Usage

Get response types from endpoint methods

```ts
import {
  GetResponseTypeFromEndpointMethod,
  GetResponseDataTypeFromEndpointMethod,
} from "@octokit/types";
import { Octokit } from "@octokit/rest";

const octokit = new Octokit();
type CreateLabelResponseType = GetResponseType<
  typeof octokit.issues.createLabel
>;
type CreateLabelResponseDataType = GetResponseDataType<
  typeof octokit.issues.createLabel
>;
```

See https://octokit.github.io/types.ts for all exported types

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

[MIT](LICENSE)
