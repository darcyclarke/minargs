const t = require('tap')
const { minargs, mainArgs } = require('../index.js')
const _process = process

t.beforeEach(t => {
  process = _process
})

t.test('mainArgs', t => {
  t.plan(1)
  process.execArgv.push('-e')
  t.equal(mainArgs(), 1)
})
