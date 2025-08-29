import * as t from 'tap'
import { minArgs as minargs, mainArgs, MinArgsResult, MinArgsOptions } from '../src/index'

const _process = process
let result: MinArgsResult
let options: MinArgsOptions

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
  t.same(minargs('argv' as any), result)
})

t.test('minargs : handles empty string', t => {
  t.plan(1)
  result.argv = []
  t.same(minargs('' as any), result)
})

t.test('minargs : handles null', t => {
  t.plan(1)
  result.argv = []
  t.same(minargs(null as any), result)
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
  t.same(minargs([{}, [], null, undefined, NaN] as any, options), result)
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
  const originalVersions = process.versions
  const originalDefaultApp = (process as any).defaultApp
  try {
    Object.defineProperty(process, 'versions', { value: { electron: true }, configurable: true })
    Object.defineProperty(process, 'defaultApp', { value: false, configurable: true })
    t.equal(mainArgs(), 1)
  } finally {
    Object.defineProperty(process, 'versions', { value: originalVersions, configurable: true })
    if (originalDefaultApp !== undefined) {
      Object.defineProperty(process, 'defaultApp', { value: originalDefaultApp, configurable: true })
    }
  }
})

t.test('mainArgs : returns 2 by default', t => {
  t.plan(1)
  const originalVersions = process.versions
  const originalDefaultApp = (process as any).defaultApp
  const originalExecArgv = process.execArgv
  try {
    Object.defineProperty(process, 'versions', { value: false, configurable: true })
    Object.defineProperty(process, 'defaultApp', { value: true, configurable: true })
    Object.defineProperty(process, 'execArgv', { value: [], configurable: true })
    t.equal(mainArgs(), 2)
  } finally {
    Object.defineProperty(process, 'versions', { value: originalVersions, configurable: true })
    Object.defineProperty(process, 'execArgv', { value: originalExecArgv, configurable: true })
    if (originalDefaultApp !== undefined) {
      Object.defineProperty(process, 'defaultApp', { value: originalDefaultApp, configurable: true })
    }
  }
})

t.test('minargs : handles alias lookup when key does not exist in alias map', t => {
  t.plan(1)
  options = {
    alias: {
      x: 'other'
    }
  }
  result.args.foo = ['']
  result.argv = [
    { index: 0, type: 'argument', value: { name: 'foo', value: '' } }
  ]
  t.same(minargs(['--foo'], options), result)
})

t.test('minargs : handles alias with empty string value falls back to name', t => {
  t.plan(1)
  options = {
    alias: {
      foo: ''
    }
  }
  result.args.foo = ['']
  result.argv = [
    { index: 0, type: 'argument', value: { name: 'foo', value: '' } }
  ]
  t.same(minargs(['--foo'], options), result)
})

t.test('minargs : handles alias with null value falls back to name', t => {
  t.plan(1)
  options = {
    alias: {
      bar: null as any
    }
  }
  result.args.bar = ['']
  result.argv = [
    { index: 0, type: 'argument', value: { name: 'bar', value: '' } }
  ]
  t.same(minargs(['--bar'], options), result)
})

t.test('minargs : handles alias with undefined value falls back to name', t => {
  t.plan(1)
  options = {
    alias: {
      baz: undefined as any
    }
  }
  result.args.baz = ['']
  result.argv = [
    { index: 0, type: 'argument', value: { name: 'baz', value: '' } }
  ]
  t.same(minargs(['--baz'], options), result)
})

t.test('minargs : covers branch where alias exists but name is empty string', t => {
  t.plan(1)
  options = {
    alias: {
      x: 'mapped'  // alias exists but won't be used
    }
  }
  result.args[''] = ['test']
  result.argv = [
    { index: 0, type: 'argument', value: 'test' }
  ]
  // This hits the case where options.alias exists but name is empty
  // So (options.alias && name) is falsy, going to name || '' branch
  // Since name is '', it should use '' and hit that specific branch
  t.same(minargs(['--=test'], options), result)
})




