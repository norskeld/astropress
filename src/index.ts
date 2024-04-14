import type { AstroIntegration } from 'astro'
import k from 'kleur'

import { createImageTransformer, type SharpOptions } from './transformers/image'
import { createSvgTransformer, type SvgoOptions } from './transformers/svg'
import type { Result } from './types'
import { report } from './utils'

export type { SharpOptions } from './transformers/image'
export type { SvgoOptions } from './transformers/svg'
export type * from './types'

export interface ImageOptions {
  /** Source directory to look for images in. Defaults to Astro `outDir`. */
  dir?: string
  /** Output directory to write images to. Defaults to `dir`. */
  out?: string
  /** Sharp options. */
  options?: SharpOptions
}

export interface SvgOptions {
  /** Source directory to look for SVG files in. Defaults to Astro `outDir`. */
  dir?: string
  /** Output directory to write SVG files to. Defaults to `dir`. */
  out?: string
  /** Svgo options. */
  options?: SvgoOptions
}

/** Integration options. */
export interface AstroPressOptions {
  /** Image options. */
  image?: ImageOptions
  /** SVG options. */
  svg?: SvgOptions
}

export function astropress(options: AstroPressOptions = {}): AstroIntegration {
  return {
    name: 'astrocompress',
    hooks: {
      'astro:build:done': async (ctx) => {
        const dir = ctx.dir.pathname
        const logger = ctx.logger

        // Log heading.
        console.log('\n' + k.bgGreen(k.black(' compressing images ')))

        try {
          const results = [] as Array<Result>

          // Create and apply transformers.
          const transformers = [
            createSvgTransformer({ dir, logger, ...options.svg }),
            createImageTransformer({ dir, logger, ...options.image })
          ]

          for (const transformer of transformers) {
            results.push(...(await transformer.transform()))
          }

          // Log report.
          logger.info('')

          for (const line of report(results)) {
            logger.info(line)
          }
        } catch (err) {
          logger.error(`Couldn't compress files: ${err}`)
        }
      }
    }
  }
}

export default astropress
