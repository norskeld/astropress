/** A successful transformation result. */
export interface Ok {
  /** The kind of result. */
  kind: 'ok'
  /** The file path. */
  path: string
  /** The difference in bytes. Should be greater than zero. */
  diff: number
}

/** A failed transformation result. */
export interface Err {
  /** The kind of result. */
  kind: 'err'
  /** The file path. */
  path: string
  /** The error message. */
  message: string
}

/** A skipped transformation result. */
export interface Skip {
  /** The kind of result. */
  kind: 'skip'
  /** The file path. */
  path: string
  /** The difference in bytes. Should be zero or negative. */
  diff: number
  /** The reason why the file was skipped. */
  message: string
}

/** The result of a transformation. */
export type Result = Ok | Err | Skip

/** A transformer. */
export interface Transformer<O> {
  /** The directory to look in for files using the `pattern`. */
  dir: string
  /** Glob pattern to match files. */
  pattern: string
  /** Options to pass to the transformer. */
  options: O
  /** Returns a list of paths to files to transform. */
  collect: () => Promise<Array<string>>
  /** Transforms the files. */
  transform: () => Promise<Array<Result>>
}
