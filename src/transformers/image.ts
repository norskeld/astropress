import { join } from 'node:path'

import type { AstroIntegrationLogger } from 'astro'
import fg from 'fast-glob'
import sharp from 'sharp'

import type { Transformer, Result } from '@/types'
import { defaults, message } from '@/utils'
import { writeFile } from 'node:fs/promises'

/** Image transformer options. */
export interface ImageTransformerOptions {
  /** Source directory to look for SVG files in. Defaults to Astro `outDir`. */
  dir: string
  /** Output directory to write SVG files to. Defaults to `dir`. */
  out?: string
  /** Sharp options. */
  options?: SharpOptions
  /** Astro integration logger. */
  logger?: AstroIntegrationLogger
}

/** Image formats supported by sharp. */
export type SharpFormat = keyof SharpOptions

/** Format-specific sharp options. */
export interface SharpOptions {
  avif?: sharp.AvifOptions
  gif?: sharp.GifOptions
  heif?: sharp.HeifOptions
  jp2?: sharp.Jp2Options
  jpeg?: sharp.JpegOptions
  jxl?: sharp.JxlOptions
  png?: sharp.PngOptions
  raw?: sharp.RawOptions
  tiff?: sharp.TiffOptions
  webp?: sharp.WebpOptions
}

/** Default sharp options. */
const SHARP_DEFAULTS = {
  avif: {
    chromaSubsampling: '4:4:4',
    effort: 9.0
  },
  gif: {
    effort: 10.0
  },
  jp2: {
    chromaSubsampling: '4:4:4'
  },
  jpeg: {
    chromaSubsampling: '4:4:4',
    mozjpeg: true,
    trellisQuantisation: true,
    overshootDeringing: true,
    optimiseScans: true
  },
  jxl: {
    effort: 9
  },
  png: {
    compressionLevel: 9.0,
    palette: true
  },
  tiff: {
    compression: 'lzw'
  },
  webp: {
    effort: 6.0
  }
} satisfies SharpOptions

export const createImageTransformer = ({
  dir,
  out,
  logger,
  options = {}
}: ImageTransformerOptions): Transformer<SharpOptions> => ({
  dir,
  options,
  pattern: '**/*.{avif,gif,heif,jpg,jpeg,png,webp}',

  async collect() {
    return fg.glob(this.pattern, {
      cwd: this.dir,
      dot: true,
      absolute: false
    })
  },

  async transform() {
    const options = defaults(this.options, SHARP_DEFAULTS)
    const paths = await this.collect()
    const results = [] as Array<Result>

    for (const path of paths) {
      const file = join(this.dir, path)
      const image = sharp(file)

      const { format } = await image.metadata()

      if (format && format in options) {
        const selected = format as SharpFormat
        const buffer = await image.toBuffer()

        const output = sharp(buffer, {
          failOn: 'none',
          sequentialRead: true,
          unlimited: true,
          animated: format === 'gif' || format === 'webp'
        })

        const formatOptions = options[selected]
        const executor = output[selected].bind(output)

        try {
          const { data, info } = await executor(formatOptions as never).toBuffer({
            resolveWithObject: true
          })

          const diff = buffer.byteLength - info.size

          if (diff > 0) {
            await writeFile(out ? join(out, path) : file, data, 'utf-8')

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
        } catch {
          const result = {
            kind: 'err',
            path,
            message: 'Failed to compress the image'
          } as const

          logger?.info(message(result))
          results.push(result)
        }
      } else {
        const result = {
          kind: 'err',
          path,
          message: `Unsupported or invalid format: ${format}`
        } as const

        logger?.info(message(result))
        results.push(result)
      }
    }

    return results
  }
})
