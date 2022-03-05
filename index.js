'use strict'

function minargs(argv, options = {}) {

  // setup result object definitions
  let result = {
    args: {},
    values: {},
    positionals: [],
    remainder: []
  }

  // check for options only
  if (arguments.length === 1 && !Array.isArray(argv)) {
    options = argv
    argv = null
  }

  // set option defaults
  const defaults = {
    known: [],
    values: [],
    multiples: [],
    alias: {},
    strict: false,
    positionalValues: false,
    process: true
  }
  options = Object.assign(defaults, options)

  // default to process.argv
  const start = mainArgs()
  argv = argv || process.argv.slice(start)

  // check if we should add process positionals to result
  if (options.process) {
    result.process = process.argv.slice(0, start)
  }

  // throw if in strict mode & passed argv was invalid input
  if (options.strict && !Array.isArray(argv)) {
    throw new Error('usage error: argv must be an array')
  }

  // set arg, value
  function store(name, value) {

    // check if errors should be thrown
    if (options.strict && !known.includes(name)) {
      throw new Error('unknown option:', name)
    }

    // set existence of arg
    result.args[name] = true

    // check if we should store values
    // push if set already & multiple
    if (result.values[name] && options.multiples.includes(name)) {
      result.values[name].push(value)
    // create array value if doesn't exist
    } else if (options.multiples.includes(name)) {
      result.values[name] = [value]
    // fallback to singular value
    } else {
      result.values[name] = value
    }
  }

  // return early an empty result if passed value isn't a string
  if (!Array.isArray(argv)) {
    return result
  }

  // walk args
  let pos = 0
  while (pos < argv.length) {
    let arg = argv[pos]

    // Handle args
    if (arg.startsWith('-')) {
      // Handle stdin/stdout '-' positional
      if (arg === '-') {
        result.positionals.push('-')
        ++pos
        continue

      // Handle end of input (ie. bare '--')
      } else if (arg === '--') {
        result.remainder = argv.slice(++pos)
        return result

      // Handle shorts (ie. '-x')
      } else if (arg.charAt(1) !== '-') {
        // expand & set short existence
        arg = arg.slice(1, arg.length)
        arg.split('').map(name => {
          store(options.alias[name] || name, undefined)
        })

      } else {
        // remove leading '--'
        arg = arg.slice(2)
      }

      // Handel equal values (ie. '--foo=b')
      if (arg.includes('=')) {

        const i = arg.indexOf('=')
        const val = options.values.includes(arg) ? arg.slice(i + 1) : undefined
        store(arg.slice(0, i), val)

      // Handle positional values (ie. '--foo b')
      } else if (pos + 1 < argv.length &&
                !argv[pos + 1].startsWith('-') &&
                options.positionalValues) {

        const val = options.values.includes(arg) ? argv[++pos] : undefined
        store(arg, val)

      } else {
        store(arg, undefined)
      }

    // Arguments without a dash prefix are considered "positional"
    } else {
      result.positionals.push(arg)
    }

    // increment position
    pos++
  }

  // return result
  return result
}

// mainArgs() pulled from @pkgjs/parseargs
// https://github.com/pkgjs/parseargs
// https://github.com/pkgjs/parseargs/blob/main/index.js

function mainArgs() {

  // This function is a placeholder for proposed process.mainArgs.
  // Work out where to slice process.argv for user supplied arguments.

  // Electron is an interested example, with work-arounds implemented in
  // Commander and Yargs. Hopefully Electron would support process.mainArgs
  // itself and render this work-around moot.
  //
  // In a bundled Electron app, the user CLI args directly
  // follow executable. (No special processing required for unbundled.)
  // 1) process.versions.electron is either set by electron, or undefined
  //    see https://github.com/electron/electron/blob/master/docs/api/process.md#processversionselectron-readonly
  // 2) process.defaultApp is undefined in a bundled Electron app, and set
  //    in an unbundled Electron app
  //    see https://github.com/electron/electron/blob/master/docs/api/process.md#processversionselectron-readonly
  // (Not included in tests as hopefully temporary example.)
  /* c8 ignore next 3 */
  if (process.versions && process.versions.electron && !process.defaultApp) {
    return 1
  }

  // Check node options for scenarios where user CLI args follow executable.
  const execArgv = process.execArgv
  if (execArgv.includes('-e') ||
      execArgv.includes('--eval') ||
      execArgv.includes('-p') ||
      execArgv.includes('--print')) {
    return 1
  }

  // Normally first two arguments are executable and script, then CLI arguments
  return 2
}

module.exports = {
  minargs,
  mainArgs
}
