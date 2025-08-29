const t = require('tap')
const { minargs, mainArgs } = require('../dist/index.js')

interface MinArgsResult {
  args: Record<string, string[]>
  positionals: string[]
  remainder: string[]
  argv: Array<{
    index: number
    type: 'process' | 'argument' | 'short' | 'positional' | 'value'
    value: string | { name: string; value: string }
  }>
}

interface MinArgsOptions {
  alias?: Record<string, string>
  recursive?: boolean
  positionalValues?: boolean
}

const _process = process
let result: MinArgsResult, options: MinArgsOptions

t.beforeEach(t => {
  process = _process
  options = {}
  result = {
    args: {},
    positionals: [],
    remainder: [],
    argv: []
  }
  process.argv.slice(0, mainArgs()).map((v, i) => result.argv.push({ index: i, type: 'process', value: v }))
})

t.test('minargs : defaults to process.argv when no array passed', t => {
  t.plan(1)
  t.same(minargs(), result)
})

t.test('minargs : fail silently & return blank result when bad argument', t => {
  t.plan(1)
  result.argv = []
  t.same(minargs('argv'), result)
})

t.test('minargs : handles empty string', t => {
  t.plan(1)
  result.argv = []
  t.same(minargs(''), result)
})

t.test('minargs : handles null', t => {
  t.plan(1)
  result.argv = []
  t.same(minargs(null), result)
})

t.test('minargs : handles empty array', t => {
  t.plan(1)
  result.argv = []
  t.same(minargs([]), result)
})

t.test('minargs : handles empty object', t => {
  t.plan(1)
  t.same(minargs({}), result)
})

t.test('minargs : parses shorts', t => {
  t.plan(1)
  result.args = {
    f: [''],
    o: ['', '']
  }
  result.argv = [
    { index: 0, type: 'short', value: { name: 'f', value: '' } },
    { index: 0, type: 'short', value: { name: 'o', value: '' } },
    { index: 0, type: 'short', value: { name: 'o', value: '' } }
  ]
  t.same(minargs(['-foo']), result)
})

t.test('minargs : parses & stores values by default', t => {
  t.plan(1)
  result.args.foo = ['bar']
  result.argv = [
    { index: 0, type: 'argument', value: { name: 'foo', value: 'bar' } }
  ]
  t.same(minargs(['--foo=bar']), result)
})

t.test('minargs : supports parsing multiple values by default', t => {
  t.plan(1)
  result.args.foo = ['', '']
  result.argv = [
    { index: 0, type: 'argument', value: { name: 'foo', value: '' } },
    { index: 1, type: 'argument', value: { name: 'foo', value: '' } }
  ]
  t.same(minargs(['--foo', '--foo']), result)
})

t.test('minargs : parses & stores value for last arg when multiple shorts', t => {
  t.plan(1)
  result.args.f = ['']
  result.args.o = ['', 'bar']
  result.argv = [
    { index: 0, type: 'short', value: { name: 'f', value: '' } },
    { index: 0, type: 'short', value: { name: 'o', value: '' } },
    { index: 0, type: 'short', value: { name: 'o', value: 'bar' } }
  ]
  t.same(minargs(['-foo=bar']), result)
})

t.test('minargs : parses & stores values when multiple shorts passed w/ positionalValue', t => {
  t.plan(1)
  options = {
    positionalValues: true
  }
  result.args.f = ['']
  result.args.o = ['', 'bar']
  result.argv = [
    { index: 0, type: 'short', value: { name: 'f', value: '' } },
    { index: 0, type: 'short', value: { name: 'o', value: '' } },
    { index: 0, type: 'short', value: { name: 'o', value: 'bar' } },
    { index: 1, type: 'value', value: 'bar' }
  ]
  t.same(minargs(['-foo', 'bar'], options), result)
})

t.test('minargs : support bare \'-\' as a positional', t => {
  t.plan(1)
  result.args.foo = ['']
  result.positionals = ['-', 'bar']
  result.argv = [
    { index: 0, type: 'argument', value: { name: 'foo', value: '' } },
    { index: 1, type: 'positional', value: '-' },
    { index: 2, type: 'positional', value: 'bar' }
  ]
  t.same(minargs(['--foo', '-', 'bar']), result)
})

t.test('minargs : support bare \'--\' to mark end of parsing & return remainder', t => {
  t.plan(1)
  result.args.foo = ['']
  result.remainder = ['bar']
  result.positionals = []
  result.argv = [
    { index: 0, type: 'argument', value: { name: 'foo', value: '' } },
    { index: 1, type: 'positional', value: '--' }
  ]
  t.same(minargs(['--foo', '--', 'bar']), result)
})

t.test('minargs : supports recursive parsing & stores \'--\' markers as positionals', t => {
  t.plan(1)
  options = {
    recursive: true
  }
  result.args.foo = ['']
  result.remainder = []
  result.positionals = ['--', 'bar']
  result.argv = [
    { index: 0, type: 'argument', value: { name: 'foo', value: '' } },
    { index: 1, type: 'positional', value: '--' },
    { index: 2, type: 'positional', value: 'bar' }
  ]
  t.same(minargs(['--foo', '--', 'bar'], options), result)
})

t.test('minargs : parses positonals by default', t => {
  t.plan(1)
  result.positionals = ['bar']
  result.argv = [
    { index: 0, type: 'positional', value: 'bar' }
  ]
  t.same(minargs(['bar']), result)
})

t.test('minargs : parses positonals as option values when positionalValues & values is set', t => {
  t.plan(1)
  options = {
    positionalValues: true
  }
  result.args.foo = ['bar']
  result.positionals = []
  result.argv = [
    { index: 0, type: 'argument', value: { name: 'foo', value: 'bar' } },
    { index: 1, type: 'value', value: 'bar' }
  ]
  t.same(minargs(['--foo', 'bar'], options), result)
})

t.test('minargs : parses array when passed', t => {
  t.plan(1)
  result.args.foo = ['']
  result.argv = [
    { index: 0, type: 'argument', value: { name: 'foo', value: '' } }
  ]
  t.same(minargs(['--foo']), result)
})

t.test('minargs : supports shorts aliasing to long-form', t => {
  t.plan(1)
  options = {
    alias: {
      f: 'foo'
    }
  }
  result.args.foo = ['']
  result.argv = [
    { index: 0, type: 'short', value: { name: 'f', value: '' } }
  ]
  t.same(minargs(['-f'], options), result)
})

t.test('minargs : supports aliasing', t => {
  t.plan(1)
  options = {
    alias: {
      f: 'foo'
    }
  }
  result.args.foo = ['']
  result.argv = [
    { index: 0, type: 'argument', value: { name: 'f', value: '' } }
  ]
  t.same(minargs(['--f'], options), result)
})

t.test('minargs : coerces non-string objects to strings', t => {
  t.plan(1)
  result.positionals = ['[object Object]', '', 'null', 'undefined', 'NaN']
  result.argv = [
    { index: 0, type: 'positional', value: '[object Object]' },
    { index: 1, type: 'positional', value: '' },
    { index: 2, type: 'positional', value: 'null' },
    { index: 3, type: 'positional', value: 'undefined' },
    { index: 4, type: 'positional', value: 'NaN' }
  ]
  t.same(minargs([{}, [], null, undefined, NaN], options), result)
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
