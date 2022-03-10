# minargs

### Goals
- **no validation<sup><small>*</small></sup>** (aka. *"bring your own validation"* ™️)
- **minimal** configuration
- **minimal** assumptions

## Package

### Installation

```bash
npm install minargs
```

### Usage

```js
// program.js - --foo=bar
const { minargs } = require('minargs')
const { args, values, positionals } = minargs()

args.foo // true
values.foo // 'bar'
positionals // ['-']
```

### Options

- `known` (`Array`) Default: none
- `multiples` (`Array`) Default: none
- `strict` (`Boolean`) Default: `false`
  - If an argument is found that isn't defined in `known`, throw a usage error
- `positionalValues` (`Boolean`) Default: `false`

### Response Object

```js
{
  args: {},
  values: {},
  positionals: [],
  remainder: [],
  process: []
}
```

##### `args`

##### `values`
- Returned values are a string by default
- Returned values are an array of strings if the corresponding arg was defined in `multiples`
- **Examples:**
  - `--foo=bar` will return `undefined` with no configuration
  - `--foo=bar` will return `"bar"` when `'foo'`
  - `--foo bar` will return `"bar"` when `'foo'` & `positionalValues` is `true`
    - Notably, `bar` is treated as a positional & returned in `positionals` if `positionalValues` is `false`

##### `positionals`

##### `remainder`

##### `process`

## CLI

`minargs` comes with a CLI out-of-the-box to make it a little easier to try/use the parser & test any assumptions about input.

### Installation
```bash
# install package globally & call bin...
npm install minargs -g && minargs

# or, use `npx` to install & call bin...
npx minargs
```

### Usage

```bash
minargs "<args>" [<options>]
```

### Options
- `--known` (alias: `k`)
- `--multiple` (alias: `m`)
- `--alias` (alias: `a`)
- `--positionalValues` (alias: `p`) Default: `false`
- `--strict` (alias: `s`) Default: `false`

### Examples

#### Get the # of times a arg was defined (using multiples & alias')...

```bash
minargs "--foo -f -f -ffff" -m foo -a f:foo | jq.values.length
```

#### Piping to/reading from `stdin`...
```bash
"--foo --bar baz" | minargs -k bar -v bar -s
```

### Extended Use Cases

```js
```

#### Handling usage

```js
```

#### Handling validation

```js
```

#### Handling recursive parsing

```js
```

### F.A.Q.
#### Are shorts supported?
- Yes.
- `-a` & `-aCdeFg` are supported
- `-a=b` will capture & return `"b"` as a value
- `-a b` will capture & return `"b"` as a value if  `positionalValues` is `true`

#### What is an `alias`?
- An alias can be any other string that maps to the *canonical* option; this includes single characters which will map shorts to a long-form (ex. `alias: { f: foo }` will parse `-f` as `{ args: { 'foo': true } }`)

#### Is `cmd --foo=bar baz` the same as `cmd baz --foo=bar`?
- Yes.

#### Is value validation or type cohersion supported?
- No.

#### Are usage errors supported?
- No.

#### Does `--no-foo` coerce to `--foo=false`?
- No.
- It would set `{ args: { 'no-foo': true } }`

#### Is `--foo` the same as `--foo=true`?
- No.

#### Are environment variables supported?
- No.

#### Do unknown arguments raise an error?
- When `strict=false`, no.
- When `strict=true`, yes.

#### Does `--` signal the end of flags/options?
- Yes.
- Any arguments following a bare `--` definition will be returned in `remainder`.

#### Is a value stored to represent the existence of `--`?
- No.
- The only way to determine if `--` was present & there were arguments passed afterward is to check the value of `remainder`

#### Is `-` a positional?
- Yes.
- A bare `-` is treated as & returned in `positionals`

#### Is `-bar` the same as `--bar`?
- No.
- `-bar` will be parsed as short options, expanding to `-b`, `-a`, `-r` (ref. [Utility Syntax Guidelines in POSIX.1-2017](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap12.html))

#### Is `---foo` the same as `--foo`?
- No.
- `---foo` returns `{ args: '-foo': true }`
- `--foo` returns `{ args: { 'foo': true }`

#### Is `foo=bar` a positional?
- Yes.

### Notes
<sup>*</sup> `minargs` does support *"validation"* of the **existence** of `known` args when `strict=true`. If you're using `strict=true` you should likely wrap the call in a `try{}catch(e){}` or `util.promisify()` as it will `throw` when unknown args are passed