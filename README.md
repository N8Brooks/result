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
For now, I'll remove the extraneous parameters. This cannot be done for things like the first argument. Adding them will be a non-breaking change.

### Async sister methods

You can use methods that do not return a `Result` with strategies that return a `Promise`. However, methods that return a `Result` can become a little hairy.
To help with these situations there are async sister methods for methods like `map`, such as `mapAsync`. These return a `Promise<Result>`.
~~It would be nice if TypeScript was a bit more leniant. Some of the implementations do not require `await`. Since using `await` on things that are not a `Promise`
resolve immediately, we could use operator overloading to minimize the surface area of the API.~~ These promises have additional features, like `.then` syntax.
Methods that return `U`, can be a `Promise`, so no async sister method is required.

## Design guide

- Use this types when returning a type that can include a type from the other variant:

  - And
  - This way, we preserve type information when transforming types
  - Other situations, we can just use `never`

- Remove unecessary parameters

  - It's usually useless to call these when we know the variant
  - The downside is, the toy examples in docs will be cast using as

- `isOkAndAsync` and `isErrAndAsync` aren't in the API (yet), because you cannot return a `Promise<this is X>`.

## Differing API

- We can remove `expect` and use `unwrap` with an optional `msg` parameter.
