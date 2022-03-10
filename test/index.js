const t = require('tap')
const { minArgs, mainArgs } = require('../index.js')
const _process = process
let result, options

t.beforeEach(t => {
  process = _process
  options = {}
  result = {
    args: {},
    values: {},
    positionals: [],
    remainder: [],
    process: process.argv.slice(0, mainArgs())
  }
})

t.test('minArgs : fail silently & return blank result when bad argument', t => {
  t.plan(1)
  t.same(minArgs('argv'), result)
})

t.test('minArgs : throws usage error when passed a bad argument in \'strict\' mode', t => {
  t.plan(1)
  options = {
    strict: true
  }
  let expected = new Error('usage error: argv must be an array')
  t.throws(function () { minArgs('argv', options) }, expected)
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
    multiple: ['f', 'o']
  }
  result.args.f = true
  result.args.o = true
  result.values.f = ['']
  result.values.o = ['', '']
  t.same(minArgs(['-foo'], options), result)
})

t.test('minArgs : parses & stores values when multiple shorts passed', t => {
  t.plan(1)
  options = {
    multiple: ['f', 'o']
  }
  result.args.f = true
  result.args.o = true
  result.values.f = ['']
  result.values.o = ['', 'bar']
  t.same(minArgs(['-foo=bar'], options), result)
})

t.test('minArgs : parses & stores values when multiple shorts passed w/ positionalValue', t => {
  t.plan(1)
  options = {
    multiple: ['f', 'o'],
    positionalValues: true
  }
  result.args.f = true
  result.args.o = true
  result.values.f = ['']
  result.values.o = ['', 'bar']
  t.same(minArgs(['-foo', 'bar'], options), result)
})

t.test('minArgs : support known arguments', t => {
  t.plan(1)
  options = {
    known: ['foo', 'bar']
  }
  result.args.foo = true
  result.args.bar = false
  result.values.foo = ''
  result.values.bar = ''
  t.same(minArgs(['--foo'], options), result)
})

t.test('minArgs : throw when in strict mode & unknown arguments passed', t => {
  t.plan(1)
  options = {
    known: ['foo'],
    strict: true
  }
  let expected = new Error('unknown option: bar')
  t.throws(function () { minArgs(['--foo', '--bar'], options) }, expected)
})

t.test('minArgs : support bare \'-\' as a positional', t => {
  t.plan(1)
  result.args.foo = true
  result.values.foo = ''
  result.positionals = ['-', 'bar']
  t.same(minArgs(['--foo', '-', 'bar']), result)
})

t.test('minArgs : support bare \'--\' to mark end of parsing & return remainder', t => {
  t.plan(1)
  result.args.foo = true
  result.values.foo = ''
  result.remainder = ['bar']
  t.same(minArgs(['--foo', '--', 'bar']), result)
})

t.test('minArgs : parses positonals by default', t => {
  t.plan(1)
  result.positionals = ['bar']
  t.same(minArgs(['bar']), result)
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

t.test('minArgs : supports shorts aliasing to long-form', t => {
  t.plan(1)
  options = {
    alias: {
      f: 'foo'
    }
  }
  result.args.foo = true
  result.values.foo = ''
  t.same(minArgs(['-f'], options), result)
})

t.test('minArgs : supports aliasing', t => {
  t.plan(1)
  options = {
    alias: {
      f: 'foo'
    }
  }
  result.args.foo = true
  result.values.foo = ''
  t.same(minArgs(['--f'], options), result)
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

t.test('mainArgs : returns 1 when versions.electron isn\'t defaultApp', t => {
  t.plan(1)
  process.versions = {}
  process.versions.electron = true
  process.defaultApp = false
  t.equal(mainArgs(), 1)
})

t.test('mainArgs : returns 2 by default', t => {
  t.plan(1)
  process.versions = {}
  process.defaultApp = true
  process.execArgv = []
  process.versions = false
  t.equal(mainArgs(), 2)
})
