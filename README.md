# Result

This module provides the Result type, a versatile utility to handle success
(`Ok`) and error (`Err`) outcomes in TypeScript. The Result type enables safe
and expressive error handling in your code, especially useful for operations
that might fail, without throwing exceptions.

## Installation

Install the Result module using npm:

```bash
npm install <module-name>
```

Install the `Result` module using deno:

```bash
deno add jsr:<module-name>
```

## Usage

### Basic Types

The `Result<T, E>` type can represent:

- `Ok`: Success, containing a value of type T.
- `Err`: Failure, containing an error of type E.

```ts
import { Result } from "./mod.ts";
import { assertEquals } from "@std/assert";

const success = Result.ok(42);
assertEquals(success.ok, 42);

const failure = Result.err("error");
assertEquals(failure.err, "error");
```

### Checking status with `isOk` and `isErr`

These methods provide a type guard for the variant.

- `isOk()`: Returns true if the result is `Ok`.
- `isErr()`: Returns true if the result is `Err`.

```ts
import { Result } from "./mod.ts";
import { assert } from "@std/assert";

const success = Result.ok(42);
assert(success.isOk());

const failure = Result.err("error");
assert(failure.isErr());
```

### Mapping functions

- `map`: Apply a function to the value in `Ok`, leaving `Err` unchanged.
- `mapErr`: Apply a function to the value in `Err`, leaving `Ok` unchanged.

```ts
import { Result } from "./mod.ts";
import { assertEquals } from "@std/assert";

const success = Result.ok(2);
const mapped = success.map((x) => x * 2);
assertEquals(mapped, Result.ok(4));

const failure = Result.err("error");
const mappedErr = failure.mapErr((e) => `${e}!`);
assertEquals(mappedErr, Result.err("error!"));
```

### Unwrapping

- `unwrap`: Retrieve the `Ok` value or throw an error if `Err`.
- `unwrapOr`: Retrieve the `Ok` value or return a default value.
- `expect`: Retrieve the `Ok` value or throw a custom error if `Err`.

```ts
import { Result } from "./mod.ts";
import { assertEquals } from "@std/assert";

const value = Result.ok(10).unwrap();
assertEquals(value, 10);

const defaultValue = Result.err("error").unwrapOr(0);
assertEquals(defaultValue, 0);

const result = Result.ok(10) as Result<number, string>);
const expectation = result.expect(  "Expected value");
assertEquals(expectation, 10);
```

### Async utilities

Result also supports asynchronous mapping and inspection:

- `mapAsync`: Apply an async function to the `Ok` value.
- `inspectAsync`: Run an async function on the `Ok` or `Err` value.

```ts
import { Result } from "./mod.ts";
import { assertEquals } from "@std/assert";

const asyncResult = await Result.ok(2).mapAsync(async (x) => x * 2);
assertEquals(asyncResult, Result.ok(4));

const asyncResult2 = await Result
  .err("error")
  .inspectErrAsync(async (e) => console.error(e));
assertEquals(asyncResult2, Result.err("error"));
```

### Collecting results with `fromIter`

This function takes an `iterable` of Results. If all elements are `Ok`, it
returns an `Ok` containing an array of values; if any `Err` is encountered, it
returns the first `Err`.

```ts
import { Result } from "./mod.ts";
import { assertEquals } from "@std/assert";

const results = [Result.ok(1), Result.ok(2)];
assertEquals(Result.fromIter(results), Result.ok([1, 2]));

const mixed = [Result.ok(1), Result.err("error")];
assertEquals(Result.fromIter(mixed), Result.err("error"));
```

## Api reference

For a full list of methods and examples, refer to the documentation in the code
comments from "./mod.ts".

## License

TBD
