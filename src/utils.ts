import k from 'kleur'

import type { Err, Ok, Result, Skip } from './types'

function isObject(item: unknown): item is Record<string, unknown> {
  return !!item && typeof item === 'object' && !Array.isArray(item)
}

function hasOwn(target: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(target, key)
}

/**
 * Recursively merges default options with user options. Does not mutate the user options object.
 *
 * @template U The type of user options
 * @template T The type of default options (defaults to `U`)
 *
 * @param {U} options The user options
 * @param {T} defaultOptions The default options
 *
 * @returns {U} The merged user options
 */
export function defaults<U, T extends U = U>(options: U, defaultOptions: T): U {
  const output = structuredClone(options)

  if (isObject(options) && isObject(defaultOptions) && isObject(output)) {
    Object.keys(defaultOptions).forEach((key) => {
      if (isObject(defaultOptions[key])) {
        if (!hasOwn(options, key)) {
          Object.assign(output, {
            [key]: defaultOptions[key]
          })
        } else {
          Object.assign(output[key] as object, defaults(options[key], defaultOptions[key]))
        }
      } else {
        Object.assign(output, {
          [key]: defaultOptions[key]
        })
      }
    })
  }

  return output as U
}

/**
 * Inflects a word based on the given length.
 *
 * @param {[string, string]} inflection The `[singular, plural]` word inflection
 * @param {number} length The length of the array
 *
 * @returns {string} The inflected word
 */
export function inflect([single, plural]: [string, string], length: number): string {
  return length === 1 ? single : plural
}

/**
 * Formats the given number of bytes into a human readable string.
 *
 * @param {number} bytes The number of bytes
 *
 * @returns {string} The formatted byte string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return '0 Bytes'
  }

  const k = 1024
  const index = Math.floor(Math.log(bytes) / Math.log(k))
  const value = parseFloat((bytes / k ** index).toFixed(2))
  const unit = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'][index]

  return `${value} ${unit}`
}

/**
 * Generates a report from the given results.
 *
 * @param {Array<Result>} results The transformation results
 *
 * @returns {Array<string>} The report
 */
export function report(results: Array<Result>): Array<string> {
  const oks = results.filter((result): result is Ok => result.kind === 'ok')
  const errors = results.filter((result): result is Err => result.kind === 'err')
  const skips = results.filter((result): result is Skip => result.kind === 'skip')
  const saved = oks.reduce((acc, result) => acc + result.diff, 0)

  return [
    `Compressed: ${oks.length} ${inflect(['file', 'files'], oks.length)}.`,
    `Skipped: ${skips.length} ${inflect(['file', 'files'], skips.length)}.`,
    `Errors: ${errors.length} ${inflect(['file', 'files'], errors.length)}.`,
    ``,
    `Total savings: ${k.green(formatBytes(saved))}.\n`
  ]
}

/**
 * Generates a human-readable message for the given result.
 *
 * @param {Result} result The transformation result
 *
 * @returns {string} The message
 */
export function message(result: Result): string {
  switch (result.kind) {
    case 'ok': {
      const formatted = formatBytes(Math.abs(result.diff))
      const saved = k.green(`-${formatted}`)

      return `${k.green('✓ Compressed')}: ${result.path} (${saved})`
    }

    case 'err': {
      return `${k.red('⨯ Error')}: ${result.path} (${result.message})`
    }

    case 'skip': {
      return `${k.gray('- Skipped')}: ${result.path} (${result.message})`
    }
  }
}
