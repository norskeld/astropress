import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import type { AstroIntegrationLogger } from 'astro'
import fg from 'fast-glob'
import svgo from 'svgo'

import type { Transformer, Result } from '@/types'
import { defaults, message } from '@/utils'

/** SVG transformer options. */
export interface SvgTransformerOptions {
  /** Source directory to look for SVG files in. Defaults to Astro `outDir`. */
  dir: string
  /** Output directory to write SVG files to. Defaults to `dir`. */
  out?: string
  /** SVGo options. */
  options?: SvgoOptions
  /** Astro integration logger. */
  logger?: AstroIntegrationLogger
}

/** SVGo options alias. */
export type SvgoOptions = svgo.Config

/** Default SVGo options. */
const SVGO_CONFIG = {
  plugins: ['preset-default'],
  multipass: true,
  js2svg: {
    indent: 0,
    pretty: false
  }
} satisfies SvgoOptions

export const createSvgTransformer = ({
  dir,
  out,
  logger,
  options = {}
}: SvgTransformerOptions): Transformer<SvgoOptions> => ({
  dir,
  options,
  pattern: '**/*.svg',

  async collect() {
    return fg.glob(this.pattern, {
      cwd: this.dir,
      dot: true,
      absolute: false
    })
  },

  async transform() {
    const options = defaults(this.options, SVGO_CONFIG)
    const paths = await this.collect()
    const results = [] as Array<Result>

    for (const path of paths) {
      const file = join(this.dir, path.toString())
      const contents = await readFile(file, 'utf-8')
      const output = svgo.optimize(contents, options)

      const diff = output.data.length - contents.length

      if (diff > 0) {
        await writeFile(out ? join(out, path) : file, output.data, 'utf-8')

        const result = {
          kind: 'ok',
          path,
          diff
        } as const

        logger?.info(message(result))
        results.push(result)
      } else {
        const result = {
          kind: 'skip',
          path,
          message: 'No optimizations were applied',
          diff
        } as const

        logger?.info(message(result))
        results.push(result)
      }
    }

    return results
  }
})
