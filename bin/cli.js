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
  stdin.on('data', (chunk) => {
    data += chunk
  })
  stdin.on('end', () => {
    run(data.toString())
    process.exit(0)
  })
}
