import type { AstroIntegration } from 'astro'
import k from 'kleur'

import { createImageTransformer, type ImageTransformerOptions } from './transformers/image'
import { createSvgTransformer, type SvgTransformerOptions } from './transformers/svg'
import { report } from './utils'
import type { Result } from './types'

export type { SharpOptions, ImageTransformerOptions } from './transformers/image'
export type { SvgoOptions, SvgTransformerOptions } from './transformers/svg'
export type * from './types'

/** Integration options. */
export interface AstroPressOptions {
  /** Image transformer options. */
  image?: ImageTransformerOptions
  /** SVG transformer options. */
  svg?: SvgTransformerOptions
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
