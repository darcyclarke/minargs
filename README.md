# minargs

`minargs` is an argument parser with _minimal_ configuration & assumptions. Argument parsing can take many shapes but the explicit goals of this library are as follows:

### Goals
- **no** usage
- **no** validation
- **no** types or type cohersion
- **no** regular expressions
- **no** strictness
- **no** dependencies
- **no** information loss
- **minimal** assumptions
- **minimal** configuration
- **consistant** results/format
- **100%** test coverage

### Mantras
- Bring Your Own Usage™️
- Bring Your Own Validation™️

### Installation

```bash
npm install minargs
```

### `miargs([argv][, options])`

- `argv` (`Array`)
  - Default: `process.argv`
  - The argument strings to parse

#### Options

- `alias` (`Object`)
  - Default: none
  - Define shorts & aliases to map to a canonical argument
  - Note: only single character aliases can be parsed as "shorts" (read more in the **F.A.Q.** below)
- `positionalValues` (`Boolean`)
  - Default: `false`
  - Define whether or not to use positionals that follow bare flag definitions as values
- `recursive` (`Boolean`)
  - Default: `false`
  - Define whether or not to end parsing when a bare `--` marker is found

### Returned Values

```js
{
  args: {},
  positionals: [],
  remainder: [],
  argv: []
}
```

#### `args`
- An `Object` of canonical argument keys with corresponding `Array` of parsed `String` values
- **Examples:**
  - `--foo` will return `[""]` (note the empty string by default)
  - `--foo=bar` will return `["bar"]`
  - `--foo bar` will return `["bar"]` when `positionalValues` is `true`
    - Notably, `bar` is treated as a positional & returned in `positionals` if `positionalValues` is `false`

#### `positionals`
- An `Array` of parsed positional `String` values

#### `remainder`
- An `Array` of `String` values the follow the first bare `--` when `recursive` is `false`
- Notably, this is useful for recursively parsing arguments or passing along args to other processes (read more in the **F.A.Q.** below)

#### `argv`
- An `Array` of `Object`s with corresponding `index`s mapping back to the original `process.argv` or provided `Array`
- `Object`s also contain the `value` parsed & `type` (ie. `"argument"`, `"short"`, `"positional"` or `"value"`)
- The `type` `"value"` will only ever be defined -- in place of `"positional"` -- when `positionalValues=true`
- Notably, this is useful for recreating the original `String` values or extending the capabilities of this information (ref. https://github.com/pkgjs/parseargs/issues/84)

### Example Usage

#### Basic

```bash
$ basic.js - --foo=bar -- --baz
```

```js
#!/usr/bin/env node

// basic.js
const { minargs } = require('minargs')
const { args, positionals, remainder, argv } = minargs()

args          // { "foo": ["bar"] }
positionals   // ["-"]
remainder     // ["--baz"]
argv          // [ { index: 0, type: 'argument', value: { name: "foo", value: "bar" } } ... ]
```

#### Handling existence

<details>
<summary>Toggle Example</summary>

```bash
$ exists.js --foo
```

```js
#!/usr/bin/env node

// exists.js
const { minargs } = require('minargs')
const { args } = minargs()
if (args.foo) {
  // ...
}
```
</details>

#### Handling last value define

<details>
<summary>Toggle Example</summary>

```bash
$ last-definition-.js --foo
```

```js
#!/usr/bin/env node

// exists.js
const { minargs } = require('minargs')
const { args } = minargs()
if (args.foo) {
  // ...
}
```
</details>

#### Handling unknown args

<details>
<summary>Toggle Example</summary>

```bash
$ unknown.js --baz
```
#### Handling extension

```js
#!/usr/bin/env node

// unknown.js
const { minargs } = require('minargs')
const { args } = minargs()
const known = ['foo', 'bar']
const unknown = Object.keys(args).filter(arg => !known.includes(arg))
if (unknown.length > 0) {
  console.error('unknown flags passed:', unknown)
  // stop the process & set an `exitCode` appropriately
  process.exit(1)
}

// ...
```
</details>

#### Handling validation

<details>
<summary>Toggle Example</summary>

```bash
$ validate.js --num=1337
```

```js
#!/usr/bin/env node

// validate.js
const { minargs } = require('minargs')
const { args } = minargs()
const usage = {
  num: {
    validate: (value) => {
      if (!isNaN(value)) {
        return Number(value)
      }
      throw Error('Validation error!')
    }
  },
  force: {
    validate: (value) => {
      if (~['true','false'].indexOf(value.toLowerCase())) {
        return Boolean(value)
      }
      throw Error('Validation error!')
    }
  }
}

Object.keys(args).filter(name => args[name]).map(name => {
  usage[name].validate(args[name].pop())
})

// ...
```
</details>

#### Handling recursive parsing

<details>
<summary>Toggle Example</summary>

```bash
$ recursive-parse.js
```

```js
#!/usr/bin/env node

// recursive-parse.js
const { minargs } = require('minargs')
console.log(minargs({ recursive: true }))
// ...
```
</details>

#### Handling sub process

<details>
<summary>Toggle Example</summary>

```bash
$ mkdir.js ./path/to/new/dir/ --force --verbose --parents
```

```js
#!/usr/bin/env node

// mkdir.js
const known = ['force']
const { args, positionals } = minargs()
const cmd = (args.force) ? 'sudo mkdir' : 'mkdir'
const _args = Object.keys(flags).filter(f => known[f])

process('child_process').spawnSync(cmd, [..._args, ...positionals])
```
</details>

#### Handling robust options & usage

<details>
<summary>Toggle Example</summary>

```bash
$ usage.js -h
```

```js
#!/usr/bin/env node

// usage.js
const { minargs } = require('minargs')
const usage = {
  help: {
    short: 'h',
    usage: 'cli --help',
    description: 'Print usage information'
  }
  force: {
    short: 'f',
    usage: 'cli --force',
    description: 'Run this cli tool with no restrictions'
  }
}
const opts = {
  alias: Object.keys(usage).filter(arg => usage[arg].short).reduce((o, k) => {
    o[usage[k].short] = k
    return o
  }, {})
}
const { args } = minargs(opts)

if (args.help) {
  Object.keys(usage).map(name => {
    let short = usage[name].short ? `-${usage[name].short}, ` : ''
    let row = [`  ${short}--${name}`, usage[name].usage, usage[name].description]
    console.log.apply(this, fill(columns, row))
  })
}

/// ...
```
</details>

### F.A.Q.

#### Why isn't strictness supported?
  * Strictness is a function of usage. By default, `minargs` does not assume anything about "known" or "unknown" arguments or their intended values (ex. defaults/types). Usage examples above show how you can quickly & easily utilize `minargs` as the backbone for an application which _does_ enforce strictness/validation & more.

#### Are shorts supported?
  * Yes.
  * Individual (ex. `-a`) & combined (ex. `-aCdeFg`) shorts are supported
  * `-a=b` will capture & return `"b"` as a value
  * `-a b` will capture & return `"b"` as a value if  `positionalValues` is `true`

#### Are multiples supported?
  * Yes.
  * By default multiple definitions of the same argument will get consolidated into a single `arg` entry with a corresponding `Array` of `String` values
  * Getting the last defined value of an argument is as simple as running `.pop()` on the `Array` (ex. `args.foo.pop()`)

#### What is an `alias`?
  * An alias can be any other string that maps to a *canonical* option; this includes single characters which will map shorts to a long-form (ex. `alias: { f: foo }` will parse `-f` as `{ args: { "foo": [""] } }`)

#### Is `cmd --foo=bar baz` the same as `cmd baz --foo=bar`?
  * _Sort of_.
  * The returned `argv` `Array` will change to reflect the differing positions of the arguments & positionals **BUT** `args` & `positionals` will remain consistent

#### Is value validation or type cohersion supported?
  * No.

#### Are usage errors supported?
  * No.

#### Does `--no-foo` coerce to `--foo=false`?
  * No.
  * `--no-foo` will parse to `{ args: { "no-foo": [""] } }` & `--foo-false` to `{ args: { "no-foo": ["false"] } }` respectively

#### Is `--foo` the same as `--foo=true`?
  * No.
  * `--foo` will parse to `{ args: { "foo": [""] } }` & `--foo=true` to ` { args: { "foo": ["true"] } }` respectively

#### Are environment variables supported?
  * No.

#### Does `--` signal the end of flags/options?
  * Yes.
  * Any arguments following a bare `--` definition will be returned in `remainder`.

#### Is a value stored to represent the existence of `--`?
  * No.
  * The only way to determine if `--` was present & there were arguments passed afterward is to check the value of `remainder`

#### Is `-` a positional?
  * Yes.
  * A bare `-` is treated as & returned in `positionals`

#### Is `-bar` the same as `--bar`?
  * No.
  * `-bar` will be parsed as short options, expanding to `-b`, `-a`, `-r` (ref. [Utility Syntax Guidelines in POSIX.1-2017](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap12.html))

#### Is `---foo` the same as `--foo`?
  * No.
  * `---foo` returns `{ args: "-foo": [""] }`
  * `--foo` returns `{ args: { "foo": [""] }`

#### Is `foo=bar` a positional?
  * Yes.

#### Are negative numbers supported as positional values?
  * No.
  * `minargs` aligns with the [POSIX Argument Syntax](https://www.gnu.org/software/libc/manual/html_node/Argument-Syntax.html) here (ie. "Arguments are options if they begin with a hyphen delimiter")
  * `--number -2` will be parsed as `{ args: { "number": [""], "2": [""] } }`
  * You will have to use explicit value setting to make this association (ex. `--number=-2`) & may further require validation/type coercion to determine if the value is a `Number` (as is shown in the usage examples above)

### CLI

`minargs` has a companion CLI library: [`@minargs/cli`](https://www.npmjs.com/package/@minargs/cli)

#### Installation

```bash
# install package globally & call bin...
npm install @minargs/cli -g && minargs

# or, use `npx` to install & call bin...
npx -- @minargs/cli "<args>" [<options>]
```

#### Usage

```bash
minargs "<args>" [<options>]
```

#### Options & more....

To learn more, check out the `@minargs/cli` [GitHub repository](https://github.com/darcyclarke/minargs-cli) or [package page](https://www.npmjs.com/package/@minargs/cli)
