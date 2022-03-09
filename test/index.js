const t = require('tap')
const { minArgs, mainArgs } = require('../index.js')
const _process = process
let result, options, argv

t.beforeEach(t => {
  process = _process
  argv = []
  options = {}
  result = {
    args: {},
    values: {},
    positionals: [],
    remainder: [],
    process: process.argv.slice(0, mainArgs())
  }
})

t.test('minArgs : return blank when bad argument', t => {
  t.plan(1)
  t.same(minArgs(null), result)
})

t.test('minArgs : defaults to process.argv when no array passed', t => {
  t.plan(1)
  t.same(minArgs(), result)
})

t.test('minArgs : parses shorts', t => {
  t.plan(1)
  result.args = {
    f: true,
    o: true
  }
  result.values = {
    f: '',
    o: ''
  }
  t.same(minArgs(['-foo']), result)
})

t.test('minArgs : parses & stores values by default', t => {
  t.plan(1)
  options = {
    values: ['foo']
  }
  result.args.foo = true
  result.values.foo = 'bar'
  t.same(minArgs(['--foo=bar']), result)
})

t.test('minArgs : supports parsing multiple values', t => {
  t.plan(1)
  options = {
    multiples: ['f', 'o']
  }
  result.args.f = true
  result.args.o = true
  result.values.f = ['']
  result.values.o = ['', '']
  t.same(minArgs(['-foo'], options), result)
})

t.test('minArgs : parses & stores values when values set & multiple shorts passed', t => {
  t.plan(1)
  options = {
    multiples: ['f', 'o']
  }
  result.args.f = true
  result.args.o = true
  result.values.f = ['']
  result.values.o = ['', 'bar']
  t.same(minArgs(['-foo=bar'], options), result)
})

t.test('minArgs : parses positonals by default', t => {
  t.plan(1)
  result.args.foo = true
  result.values.foo = ''
  result.positionals = ['bar']
  t.same(minArgs(['--foo', 'bar']), result)
})

t.test('minArgs : parses positonals as option values when positionalValues & values is set', t => {
  t.plan(1)
  options = {
    values: ['foo'],
    positionalValues: true
  }
  result.args.foo = true
  result.values.foo = 'bar'
  result.positionals = []
  t.same(minArgs(['--foo', 'bar'], options), result)
})

t.test('minArgs : parses array when passed', t => {
  t.plan(1)
  result.args.foo = true
  result.values.foo = ''
  t.same(minArgs(['--foo']), result)
})

t.test('mainArgs : returns 1 when includes -e', t => {
  t.plan(1)
  process.execArgv.push('-e')
  t.equal(mainArgs(), 1)
})

t.test('mainArgs : returns 1 when includes --eval', t => {
  t.plan(1)
  process.execArgv.push('--eval')
  t.equal(mainArgs(), 1)
})

t.test('mainArgs : returns 1 when includes -p', t => {
  t.plan(1)
  process.execArgv.push('-p')
  t.equal(mainArgs(), 1)
})

t.test('mainArgs : returns 1 when includes --print', t => {
  t.plan(1)
  process.execArgv.push('--print')
  t.equal(mainArgs(), 1)
})

t.test('mainArgs : returns 1 when versions.electron is set with defaultApp', t => {
  t.plan(1)
  process.versions = { electron: true }
  process.defaultApp = true
  t.equal(mainArgs(), 1)
})

t.test('mainArgs : returns 2 by default', t => {
  t.plan(1)
  process.execArgv = []
  process.versions = null
  t.equal(mainArgs(), 2)
})