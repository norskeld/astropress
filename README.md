# astropress

<!-- Uncomment & replace owner/repo. -->

<!-- [![Coverage](https://img.shields.io/coverallsCoverage/github/norskeld/astropress?style=flat-square&colorA=22272d&colorB=22272d)](https://coveralls.io/github/norskeld/astropress 'Test coverage') -->
<!-- [![Bundlephobia](https://img.shields.io/bundlephobia/minzip/@nrsk/astropress?style=flat-square&colorA=22272d&colorB=22272d&label=minzipped)](https://bundlephobia.com/package/@nrsk/astropress) -->
<!-- ![Tree Shaking](https://img.shields.io/static/v1?label=tree+shaking&message=✔&style=flat-square&colorA=22272d&colorB=22272d) -->

[![Build/Test](https://img.shields.io/github/actions/workflow/status/norskeld/astropress/test.yml?style=flat-square&colorA=22272d&colorB=22272d)](https://github.com/norskeld/astropress/actions 'Build and test workflows')
[![NPM](https://img.shields.io/npm/v/@nrsk/astropress?style=flat-square&colorA=22272d&colorB=22272d)](https://npm.im/@nrsk/astropress 'This package on NPM')
[![Semantic Release](https://img.shields.io/static/v1?label=semantic+release&message=✔&style=flat-square&colorA=22272d&colorB=22272d)](https://github.com/semantic-release/semantic-release 'This package uses semantic release to handle releasing, versioning, changelog generation and tagging')
[![Conventional Commits](https://img.shields.io/static/v1?label=conventional+commits&message=✔&style=flat-square&colorA=22272d&colorB=22272d)](https://conventionalcommits.org 'This package follows the conventional commits spec and guidelines')

Astro integration for images and SVG compression.

## Features

Basic image and SVG compression integration for [Astro 4](https://astro.build). Uses:

- [x] [sharp](https://github.com/lovell/sharp)
- [x] [svgo](https://github.com/svg/svgo)

## Installation

First, install the `@nrsk/astropress` package using your package manager.

```bash
npm install @nrsk/astropress
```

Then, apply the integration to your [astro.config.\*](https://docs.astro.build/en/reference/configuration-reference/#integrations) file using the `integrations` property:

```typescript
import { defineConfig } from 'astro/config'
import astropress from '@nrsk/astropress'

export default defineConfig({
  integrations: [astropress()]
})
```

> [!NOTE]\
> Place astropress **after** all other integrations.

## Configuration

**sharp** and **svgo** are given reasonable defaults, but can be easily configured via the `image.options` and `svg.options` properties, which accept **sharp** and **svgo** options respectively.

Besides that you can specify `dir` and `out` options to configure the input and output directories.

```typescript
import { defineConfig } from 'astro/config'
import astropress from '@nrsk/astropress'

export default defineConfig({
  integrations: [
    astropress({
      image: {
        dir: '/path/to/input/dir',
        out: '/path/to/output/dir',
        options // sharp options.
      },
      svg: {
        dir: '/path/to/input/dir',
        out: '/path/to/output/dir',
        options // svgo options.
      }
    })
  ]
})
```

## License

[MIT](LICENSE).
