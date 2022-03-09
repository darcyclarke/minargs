#!/usr/bin/env node

const isTTY = process.stdin.isTTY
const stdin = process.stdin
const { minargs, mainArgs } = require('../index.js')
const { args } = minargs({
  values: ['args'],
  alias: {
    strict: 's'
  }
})
const options = { strict: !!args.strict }

function run (argv = process.argv) {
  try {
    console.log(JSON.stringify(minargs(argv, options), null, 2))
    process.exit(0)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

// usage
if (isTTY && mainArgs().length === 0) {
  console.error('usage error: no args')
  process.exit(1)

// args
} else if (isTTY && mainArgs().length !== 0) {
  run()
// stdin
} else {
  let data = ''
  let argv = []
  stdin.on('data', (chunk) => {
    data += chunk
  })
  stdin.on('end', () => {
    // Regular Expression & string parsing from: https://github.com/mccormicka/string-argv
    // ([^\s'"]([^\s'"]*(['"])([^\3]*?)\3)+[^\s'"]*) Matches nested quotes until the first space outside of quotes
    // [^\s'"]+ or Match if not a space ' or "
    // (['"])([^\5]*?)\5 or Match "quoted text" without quotes
    // `\3` and `\5` are a backreference to the quote style (' or ") captured
    const regEx = /([^\s'"]([^\s'"]*(['"])([^\3]*?)\3)+[^\s'"]*)|[^\s'"]+|(['"])([^\5]*?)\5/gi
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
      match = regEx.exec(data.toString())
      if (match !== null) {
        // Index 1 in the array is the captured group if it exists
        // Index 0 is the matched text, which we use if no captured group exists
        argv.push(firstString(match[1], match[6], match[0]))
      }
    } while (match !== null)
    run(argv)
    process.exit(0)
  })
}
