'use strict'

function minArgs (argv, options = {}) {
  // setup result object definitions
  let result = {
    args: {},
    positionals: [],
    remainder: [],
    argv: []
  }
  let defaulted = false

  // set positional, arg & values
  function store (index, type, name, value) {
    // check the type of item being stored
    if (type === 'argument' || type === 'short') {
      // check for aliases
      let alias = options.alias[name] || name

      // check if we should store values
      value = (typeof value !== 'undefined') ? value : ''

      // push if set already
      if (result.args[alias]) {
        result.args[alias].push(value)
      } else {
        result.args[alias] = [value]
      }
    }

    // set item in the index
    result.argv.push({
      index,
      type,
      value: name ? { name, value } : value
    })
  }

  // check for options only
  if (arguments.length === 1 &&
      typeof arguments[0] === 'object' &&
      !Array.isArray(arguments[0]) &&
      argv != null) {
    options = arguments[0]
    argv = process.argv
    defaulted = true
  }

  // fallback to process.argv if not set
  if (arguments.length === 0) {
    argv = process.argv
    defaulted = true
  }

  // return early if argv isn't an array
  if (!Array.isArray(argv)) {
    return result
  }

  // set option defaults
  const defaults = {
    alias: {},
    recursive: false,
    positionalValues: false
  }
  options = Object.assign(defaults, options)

  // set starting position
  let start = 0

  // set process positionals & update start position when defaulting
  if (defaulted) {
    start = mainArgs()
    process.argv.slice(0, start).map((v, i) => store(i, 'process', null, v))
  }

  // walk args
  let index = start
  while (index < argv.length) {
    let type = ''
    let arg = argv[index]

    // Handle args
    if (arg.startsWith('-')) {
      // Handle stdin/stdout '-' positional
      if (arg === '-') {
        result.positionals.push(arg)
        store(index, 'positional', null, arg)
        ++index
        continue

      // Handle end of input (ie. bare '--')
      } else if (arg === '--') {
        store(index, 'positional', null, arg)
        if (options.recursive) {
          result.positionals.push(arg)
          ++index
          continue
        }
        result.remainder = argv.slice(++index)
        return result

      // Handle shorts (ie. '-x')
      } else if (arg.charAt(1) !== '-') {
        arg = arg.slice(1, arg.length)
        type = 'short'
        // Handle short value setting
        if (arg.includes('=')) {
          const parts = arg.split('=')
          // expand & set short existence
          const shorts = parts[0].split('')
          shorts.slice(0, -1).map(short => store(index, type, short, ''))
          arg = shorts[shorts.length - 1] + '=' + parts[1]

        // set arg to last short for usage by positional values
        } else {
          const shorts = arg.split('')
          shorts.slice(0, -1).map(short => store(index, type, short, ''))
          arg = shorts[shorts.length - 1]
        }
      } else {
        // remove leading '--'
        arg = arg.slice(2)
      }

      // Handle equal values (ie. '--foo=b')
      if (arg.includes('=')) {
        const parts = arg.split('=')
        store(index, type || 'argument', parts[0], parts[1])

      // Handle positional values (ie. '--foo b')
      } else if (index + 1 < argv.length &&
                !argv[index + 1].startsWith('-') &&
                options.positionalValues) {
        store(index, type || 'argument', arg, argv[++index])
        result.argv.push({
          index,
          type: 'value',
          value: argv[index]
        })
      } else {
        store(index, type || 'argument', arg)
      }

    // Arguments without a dash prefix are considered "positional"
    } else {
      result.positionals.push(arg)
      store(index, 'positional', null, arg)
    }

    // increment position
    index++
  }

  // return result
  return result
}

// mainArgs() pulled from @pkgjs/parseargs
// https://github.com/pkgjs/parseargs
// https://github.com/pkgjs/parseargs/blob/main/index.js

function mainArgs () {
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
  minargs: minArgs,
  minArgs,
  mainArgs
}
