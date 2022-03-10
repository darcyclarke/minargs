#!/usr/bin/env node

const isTTY = process.stdin.isTTY
const stdin = process.stdin
const { minargs, mainArgs } = require('../index.js')
const usage = {
  args: {
    usage: 'minargs --args="<string of arguments>"',
    description: 'The string of arguments to be parsed'
  },
  multiple: {
    multiple: true,
    short: 'm',
    usage: 'minargs --multiple <option>',
    description: 'Define an argument that should support multiples'
  },
  alias: {
    multiple: true,
    short: 'a',
    usage: 'minargs --alias <alias>:<option>',
    description: 'Define an alias between two option names'
  },
  known: {
    multiple: true,
    short: 'k',
    usage: 'minargs --known <option>',
    description: 'Define an option that is expected'
  },
  strict: {
    short: 's',
    usage: 'minargs --known <option> --strict',
    description: 'Default: false - Define whether unknown options should error (use alongside `--known`)'
  },
  positionalValues: {
    short: 'p',
    usage: 'minargs --positionalValues',
    description: 'Default: false - Define whether to capture positional values'
  },
  help: {
    short: 'h',
    usage: 'minargs --help',
    description: 'Print usage information'
  }
}
const opts = {
  positionalValues: true,
  known: Object.keys(usage),
  multiple: Object.keys(usage).filter(arg => usage[arg].multiple),
  alias: Object.keys(usage).filter(arg => usage[arg].short).reduce((o, k) => {
    o[usage[k].short] = k
    return o
  }, {})
}

const { args, values } = minargs(process.argv.slice(mainArgs()), opts)

function printUsage() {
  console.log('')
  console.log('Usage:')
  console.log('')
  console.log('  minargs --args="<arguments to be parsed>" [<options>]')
  console.log('')
  console.log('  or...')
  console.log('')
  console.log('  echo "<arguments to be parsed>" | minargs [<options>]')
  console.log('')
  let columns = [28, 40, 50]
  console.log.apply(this, fill(columns, ['Options:', 'Usage:', 'Description:']))
  console.log('')
  Object.keys(usage).map(name => {
    let short = usage[name].short ? `-${usage[name].short}, ` : ''
    let row = [`  ${short}--${name}`, usage[name].usage, usage[name].description]
    console.log.apply(this, fill(columns, row))
  })
  console.log('')
}

function fill (columns, row) {
  return row.map((value, index) => {
    let diff = columns[index] - value.length
    diff = diff < 0 ? 0 : diff
    return value + Array(diff).fill().join(' ')
  })
}

function run (argv) {
  try {
    const opts = {
      strict: !!args.strict,
      positionalValues: !!args.positionalValues,
      known: !values.known ? [] : values.known,
      multiple: !values.multiple ? [] : values.multiple,
      alias: !values.alias ? [] : values.alias.reduce((o, v) => {
          const parts = v.split(':')
          o[parts[0]] = parts[1]
          return o
        }, {})
    }
    console.log(JSON.stringify(minargs(argv, opts), null, 2))
    process.exit(0)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

function parseString (str) {
  // Regular Expression & string parsing from: https://github.com/mccormicka/string-argv
  // ([^\s'"]([^\s'"]*(['"])([^\3]*?)\3)+[^\s'"]*) Matches nested quotes until the first space outside of quotes
  // [^\s'"]+ or Match if not a space ' or "
  // (['"])([^\5]*?)\5 or Match "quoted text" without quotes
  // `\3` and `\5` are a backreference to the quote style (' or ") captured
  const regEx = /([^\s'"]([^\s'"]*(['"])([^\3]*?)\3)+[^\s'"]*)|[^\s'"]+|(['"])([^\5]*?)\5/gi
  const argv = []
  function firstString(...args) {
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      if (typeof arg === 'string') {
        return arg
      }
    }
  }
  do {
    // Each call to exec returns the next regex match as an array
    match = regEx.exec(str)
    if (match !== null) {
      // Index 1 in the array is the captured group if it exists
      // Index 0 is the matched text, which we use if no captured group exists
      argv.push(firstString(match[1], match[6], match[0]))
    }
  } while (match !== null)
  return argv
}

if (isTTY) {

  if (args.help) {
    printUsage()
    process.exit(0)
  } else if (!args.args) {
    console.error('Usage error: no args passed')
    console.log('')
    printUsage()
    process.exit(1)
  } else if (args.args) {
    run(parseString(values.args))
  }

// run as stdin, if that's what's happening...
} else {
  let data = ''
  stdin.on('data', (chunk) => {
    data += chunk
  })
  stdin.on('end', () => {
    run(parseString(data.toString()))
    process.exit(0)
  })
}
