# Result

## Design

### Initial vision

A rust Result port for TypeScript. In some ways, TypeScript has a more powerful type system than Rust.
For instance, we can use `result.ok` which checks `ok` for truthy values, and validates `result` is an `Ok`.

However, we cannot write 1:1 Rust in TypeScript. There will be limitations where the idiomatic Rust way conflicts with the idiomatic TypeScript way.

- In TypeScript we have `Result` as a type so that it can implement an interface across `Ok` and `Err` and have a discriminated union for `ok` and `err`.
  Types in TypeScript cannot have static methods for the creation of `Ok` and `Err` types. So Rust's `Result::Ok()` cannot be written as `Result.Ok()` unless there is some `.d.ts` magic I'm not aware of.
  So, we'll stick to `new Ok()` and `Ok.from` which is a more TypeScript idiomatic way to do so.
  The downside is Referencing `Ok` and `Err` directly results in a larger and clunkier API for clients.
  As a remediation, I'd suggest importing the result library as `import * as Result from "result";`.

## Design considerations

### Re-name to res

I'm tempted to re-name `Result` to `Res`. This would make all the objects map to their 'short' names.
This would be a consistent naming convention, but would stray from the initial vision of a rust Result port.

- Result -> Res
- Okay -> Ok
- Error -> Err

### Minimize unnecessary api details

We could remove parameters in `Ok` and `Err` that are not relevant.
This would mean `Result`s that we know are `Err` could not call `Err.map` with parameters.
This could be a good thing because `Err.map` is just an identity function and it shows clients it's kind of useless if we know it is an `Err`.
Could we go any further? Could we hide the `Err.map` function for types we know are `Err` and only expose it through `Result`?

### Non Optional

`NonOptional` is a type designed for anything that isn't undefined. The type errors it shows aren't very easy to understand.
The idea was to prevent clients from creating a `Result<undefined, unknown>` or `Result<unknown, undefined>` type.
In some ways using `undefined` for `ok` or `err` is an indiscriminate value because the TypeScript server cannot differentiate whether `{err: undefined, ok: undefined}`
is an `InnerOk` or `InnerErr` type. In a way, it is neither which breaks the idea of a discriminated union.
However, there's some type gymnastics that goes into adding `NonOptional` types everywhere.
Also, it can be unnecessary because we can still tell which type it is through the polymorphic `isOk` and `isErr` methods.
I'll leave in `NonOptional` for the time being. There are tradeoffs, but removing `NonOptional` isn't a breaking change, while the reverse is.