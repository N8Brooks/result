export type Result<T, E> = Ok<T> | Err<E>;

/** Takes each element in the `Iterable`: if it is an `Err`, no further elements are taken, and the `Err` is returned.
 * Should no `Err` occur, an `Array` with the `ok` of each `Result` is returned.
 *
 * Here is an example:
 * ```ts
 * import { Ok, fromIter } from "./mod.ts";
 * import { assertEquals } from "@std/assert";
 *
 * const results = [Ok.from(1), Ok.from(2)];
 * const result = fromIter(results);
 * assertEquals(result, Ok.from([1, 2]));
 * ```
 *
 * Here is another example that shows that the first `Err` is returned:
 * ```ts
 * import { Ok, Err, fromIter } from "./mod.ts";
 * import { assertEquals } from "@std/assert";
 *
 * const results = [Ok.from(1), Err.from("error"), Err.from("error 2")];
 * const result = fromIter(results);
 * assertEquals(result, Err.from("error"));
 * ```
 */
export function fromIter<T, E>(
  results: Iterable<Result<T, E>>,
): Result<T[], E> {
  const oks = [];
  for (const res of results) {
    if (res.isErr()) {
      return res;
    }
    oks.push(res.ok);
  }
  return Ok.from(oks);
}

/** Contains the success value of a `Result`. */
export class Ok<T> implements InnerOk<T>, Resultable<T, never> {
  readonly err!: never;

  constructor(public readonly ok: T) {}

  static from<T>(ok: T): Ok<T> {
    return new Ok(ok);
  }

  [Symbol.iterator](): IterableIterator<T> {
    let ran = false;
    return {
      next: () => {
        return ran
          ? { value: undefined, done: true }
          : (ran = true, { value: this.ok });
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }

  isOk(): this is Ok<T> {
    return true;
  }

  isOkAnd<U extends T>(and: (ok: T) => ok is U): this is Ok<U>;
  isOkAnd(and: (ok: T) => boolean): this is Ok<T>;
  isOkAnd(and: (ok: T) => boolean) {
    return and(this.ok);
  }

  isErr(): this is Err<never> {
    return false;
  }

  isErrAnd(): this is Err<never> {
    return false;
  }

  map<U>(fn: (ok: T) => U): Ok<U> {
    return Ok.from(fn(this.ok));
  }

  async mapAsync<U>(fn: (ok: T) => Promise<U>): Promise<Ok<U>> {
    return Ok.from(await fn(this.ok));
  }

  mapOr<U>(_or: U, fn: (ok: T) => U): U {
    return fn(this.ok);
  }

  mapOrElse<U>(_else: (err: never) => U, fn: (ok: T) => U): U {
    return fn(this.ok);
  }

  mapErr(): this {
    return this;
  }

  mapErrAsync(): Promise<this> {
    return Promise.resolve(this);
  }

  inspect(fn: (ok: T) => void): this {
    fn(this.ok);
    return this;
  }

  async inspectAsync(fn: (ok: T) => Promise<void>): Promise<this> {
    await fn(this.ok);
    return this;
  }

  inspectErr(): this {
    return this;
  }

  inspectErrAsync(): Promise<this> {
    return Promise.resolve(this);
  }

  expect(): T {
    return this.ok;
  }

  unwrap(): T {
    return this.ok;
  }

  expectErr(msg: string): never {
    throw new Error(`${msg}: expectErr called on an Ok value`);
  }

  unwrapErr(): never {
    throw new Error("unwrapErr called on an Ok value");
  }

  and<R2 extends Result<unknown, unknown>>(res: R2): R2 {
    return res;
  }

  andThen<R2 extends Result<unknown, unknown>>(then: (ok: T) => R2): R2 {
    return then(this.ok);
  }

  andThenAsync<R2 extends Result<unknown, unknown>>(
    then: (ok: T) => Promise<R2>,
  ): Promise<R2> {
    return then(this.ok);
  }

  or(): this {
    return this;
  }

  orElse(): this {
    return this;
  }

  orElseAsync(): Promise<this> {
    return Promise.resolve(this);
  }

  unwrapOr(): T {
    return this.ok;
  }

  unwrapOrElse(): T {
    return this.ok;
  }

  transpose(): Err<T> {
    return Err.from(this.ok);
  }

  clone(): Ok<T> {
    return Ok.from(this.ok);
  }
}

type InnerOk<T> = Readonly<{ ok: T; err?: never }>;

/** Contains the error value of a `Result`. */
export class Err<E> implements InnerErr<E>, Resultable<never, E> {
  readonly ok!: never;

  constructor(public readonly err: E) {}

  static from<E>(err: E): Err<E> {
    return new Err(err);
  }

  [Symbol.iterator](): IterableIterator<never> {
    return {
      next: () => ({ value: undefined, done: true }),
      [Symbol.iterator]() {
        return this;
      },
    };
  }

  isOk(): this is Ok<never> {
    return false;
  }

  isOkAnd(): this is Ok<never> {
    return false;
  }

  isErr(): this is Err<E> {
    return true;
  }

  isErrAnd<F extends E>(and: (err: E) => err is F): this is Err<F>;
  isErrAnd(and: (err: E) => boolean): this is Err<E>;
  isErrAnd(and: (err: E) => boolean) {
    return and(this.err);
  }

  map(): this {
    return this;
  }

  mapAsync(): Promise<this> {
    return Promise.resolve(this);
  }

  mapOr<U>(or: U): U {
    return or;
  }

  mapOrElse<U>(_else: (err: E) => U): U {
    return _else(this.err);
  }

  mapErr<F>(fn: (err: E) => F): Err<F> {
    return Err.from(fn(this.err));
  }

  async mapErrAsync<F>(fn: (err: E) => Promise<F>): Promise<Err<F>> {
    return Err.from(await fn(this.err));
  }

  inspect(): this {
    return this;
  }

  inspectAsync(): Promise<this> {
    return Promise.resolve(this);
  }

  inspectErr(fn: (err: E) => void): this {
    fn(this.err);
    return this;
  }

  async inspectErrAsync(fn: (err: E) => Promise<void>): Promise<this> {
    await fn(this.err);
    return this;
  }

  expect(msg: string): never {
    throw new Error(`${msg}: expect called on an Err value`);
  }

  unwrap(): never {
    throw new Error("unwrap called on an Err value");
  }

  expectErr(): E {
    return this.err;
  }

  unwrapErr(): E {
    return this.err;
  }

  and(): this {
    return this;
  }

  andThen(): this {
    return this;
  }

  andThenAsync(): Promise<this> {
    return Promise.resolve(this);
  }

  or<R2 extends Result<unknown, unknown>>(res: R2): R2 {
    return res;
  }

  orElse<R2 extends Result<unknown, unknown>>(_else: (err: E) => R2): R2 {
    return _else(this.err);
  }

  orElseAsync<R2 extends Result<unknown, unknown>>(
    _else: (err: E) => Promise<R2>,
  ): Promise<R2> {
    return _else(this.err);
  }

  unwrapOr<T>(or: T): T {
    return or;
  }

  unwrapOrElse<T>(_else: (err: E) => T): T {
    return _else(this.err);
  }

  transpose(): Ok<E> {
    return Ok.from(this.err);
  }

  clone(): Err<E> {
    return Err.from(this.err);
  }
}

type InnerErr<E> = Readonly<{ ok?: never; err: E }>;

interface Resultable<T, E> extends Iterable<T> {
  [Symbol.iterator](): IterableIterator<T | never>;

  /**
   * @returns `true` if the `Result` is `Ok`.
   *
   * @remarks This provides a type guard for the `Ok` variant.
   *
   * @see {@link isErr} for the complementary `Err` method.
   * @see {@link isOkAnd} for a more flexible version of this method.
   *
   * @example
   * ```ts
   * import * as Result from "./mod.ts";
   * import { assertEquals } from "@std/assert";
   *
   * const x = Result.Ok.from(2);
   * assertEquals(x.isOk(), true);;
   *
   * const y = Result.Err.from("error");
   * assertEquals(y.isOk(), false);
   * ```
   */
  isOk(): this is Ok<T>;

  /**
   * @returns `true` if the `Result` is `Ok` and the `ok` value satisfies the predicate.
   *
   * @remarks This provides a  type guard for a specific `Ok` variant.
   *
   * @see {@link isOk} for a more general version of this method.
   * @see {@link isErrAnd} for the complementary `Err` method.
   *
   * @example
   * ```ts
   * import * as Result from "./mod.ts";
   * import { assertEquals } from "@std/assert";
   *
   * const x = Result.Ok.from<number | bigint>(2);
   * assertEquals(x.isOkAnd((ok) => typeof ok === "number"), true);
   *
   * const y = Result.Err.from("error") as Result.Result<number | bigint, string>;
   * assertEquals(y.isOkAnd((ok) => typeof ok === "number"), false);
   * ```
   */
  isOkAnd<U extends T>(and: (ok: T) => ok is U): this is Ok<U>;

  /**
   * @returns `true` if the `Result` is `Ok` and the `ok` value satisfies the predicate.
   *
   * @see {@link isOk} for a more general version of this method.
   * @see {@link isErrAnd} for the complementary `Err` method.
   *
   * @example
   * ```ts
   * import * as Result from "./mod.ts";
   * import { assertEquals } from "@std/assert";
   *
   * const x = Result.Ok.from(2);
   * assertEquals(x.isOkAnd((ok) => ok > 1), true);
   * assertEquals(x.isOkAnd((ok) => ok > 5), false);
   *
   * const y = Result.Err.from("error") as Result.Result<number, string>;
   * assertEquals(y.isOkAnd((ok) => ok > 1), false);
   * ```
   */
  isOkAnd(and: (ok: T) => boolean): this is Ok<T>;

  // TODO: isOkAndAsync, alpha

  /**
   * @returns `true` if the `Result` is `Err`.
   *
   * @remarks This provides a type guard for the `Err` variant.
   *
   * @see {@link isOk} for the complementary `Ok` method.
   * @see {@link isErrAnd} for a more flexible version of this method.
   *
   * @example
   * ```ts
   * import * as Result from "./mod.ts";
   * import { assertEquals } from "@std/assert";
   *
   * const x = Result.Err.from("error");
   * assertEquals(x.isErr(), true);;
   *
   * const y = Result.Ok.from(1);
   * assertEquals(y.isErr(), false);
   * ```
   */
  isErr(): this is Err<E>;

  /**
   * @returns `true` if the `Result` is `Err` and the `err` value satisfies the predicate.
   *
   * @remarks This provides a type guard for a specific `Err` variant.
   *
   * @see {@link isErr} for a more general version of this method.
   * @see {@link isOkAnd} for the complementary `Ok` method.
   *
   * @example
   * ```ts
   * import * as Result from "./mod.ts";
   * import { assertEquals } from "@std/assert";
   *
   * const x = Result.Err.from<number | bigint>(2);
   * assertEquals(x.isErrAnd((err) => typeof err === "number"), true);
   *
   * const y = Result.Ok.from("error") as Result.Result<string, number | bigint>;
   * assertEquals(y.isErrAnd((err) => typeof err === "number"), false);
   * ```
   */
  isErrAnd<F extends E>(and: (err: E) => err is F): this is Err<F>;

  /**
   * @returns `true` if the `Result` is `Err` and the `err` value satisfies the predicate.
   *
   * @see {@link isErr} for a more general version of this method.
   * @see {@link isOkAnd} for the complementary `Ok` method.
   *
   * @example
   * ```ts
   * import * as Result from "./mod.ts";
   * import { assertEquals } from "@std/assert";
   *
   * const x = Result.Err.from("error");
   * assertEquals(x.isErrAnd((err) => err === "error"), true);
   * assertEquals(x.isErrAnd((err) => err === "error 2"), false);
   *
   * const y = Result.Ok.from(1) as Result.Result<number, string>;
   * assertEquals(y.isErrAnd((err) => err === "error"), false);
   * ```
   */
  isErrAnd(and: (err: E) => boolean): this is Err<E>;

  // TODO: `isErrAndAsync`, alpha

  /**
   * Maps a `Result<T, E>` to `Result<U, E>` by applying a function to a contained `Ok<U>` value, leaving an `Err<E>` value untouched.
   *
   * @param `fn`, the function to apply to the `ok` value.
   * @typeParam `U`, the type of the new `ok` value.
   * @returns a new `Result<U, E>` value.
   *
   * @remarks This method can be used to compose the results of two functions.
   *
   * @see {@link mapAsync} the asynchronous version of this method.
   * @see {@link mapOr} for providing a default value for the `Err` variant.
   * @see {@link mapErr} to transform the `err` value.
   *
   * @example
   * ```ts
   * import * as Result from "./mod.ts";
   * import { assertEquals } from "@std/assert";
   *
   * const x = Result.Ok.from(2);
   * assertEquals(x.map((ok) => `${ok}`), Result.Ok.from("2"));
   *
   * const y = Result.Err.from("error") as Result.Result<number, string>;
   * assertEquals(y.map((ok) => 2 * ok), Result.Err.from("error"));
   * ```
   */
  map<U>(fn: (ok: T) => U): Result<U, E>;

  /**
   * Maps a `Result<T, E>` to `Result<U, E>` by applying an asynchronous function to a contained `Ok<U>` value, leaving an `Err<E>` value untouched.
   *
   * @param `fn`, the asynchronous function to apply to the `ok` value.
   * @typeParam `U`, the type of the new `ok` value.
   * @returns a `Promise` with the new `Result<U, E>` value.
   *
   * @remarks This method can be used to compose the results of two functions.
   *
   * @see {@link map} the synchronous version of this method.
   * @see {@link mapErrAsync} to transform the `err` value asynchronously.
   *
   * @example
   * ```ts
   * import * as Result from "./mod.ts";
   * import { assertEquals } from "@std/assert";
   *
   * const x = Result.Ok.from(2);
   * const y = await x.mapAsync((ok) => Promise.resolve(`${ok}`));
   * assertEquals(y, Result.Ok.from("2"));
   *
   * const a = Result.Err.from("error") as Result.Result<number, string>;
   * const b = await a.mapAsync((ok) => Promise.resolve(2 * ok));
   * assertEquals(b, Result.Err.from("error"));
   * ```
   */
  mapAsync<U>(fn: (ok: T) => Promise<U>): Promise<Result<U, E>>;

  /**
   * @param `or`, the default value to return if the `Result` is `Err`.
   * @param `fn`, the function to apply to the `ok` value.
   * @typeParam `U`, the type of the return value.
   * @returns the provided default, `or`, (if `Err`), or applies a function to the contained value (if `Ok`).
   *
   * @remarks The `or` parameter is eagerly evaluated; if you are passing the result of a function call, it is recommended to use {@link mapOrElse} instead.
   *
   * @see {@link map} for the returning a `Result` instead of a value.
   * @see {@link mapOrElse} for providing a function to apply to the `err` value.
   *
   * @example
   * ```ts
   * import * as Result from "./mod.ts";
   * import { assertEquals } from "@std/assert";
   *
   * const x = Result.Ok.from(2);
   * assertEquals(x.mapOr(0, (ok) => ok * 2), 4);
   *
   * const y = Result.Err.from("error") as Result.Result<number, string>;
   * assertEquals(y.mapOr(0, (ok) => ok * 2), 0);
   * ```
   */
  mapOr<U>(or: U, fn: (ok: T) => U): U;

  /**
   * Maps a `Result<T, E>` to `U` by applying the fallback function `_else` to a contained `err`, or a function `fn` to a contained `ok`.
   *
   * @param `_else`, the function to apply to the `err` value.
   * @param `fn`, the function to apply to the `ok` value.
   * @typeParam `U`, the type of the return value.
   * @returns the result of applying the appropriate function to the contained value.
   *
   * @remarks
   * - This method can be used with asynchronous functions.
   * - This method can be used to unpack a successful result while handling an error.
   *
   * @see {@link map} for mapping the `ok` to a new value.
   * @see {@link mapOr} for providing a default value for the `Err` variant.
   *
   * @example
   * ```ts
   * import * as Result from "./mod.ts";
   * import { assertEquals } from "@std/assert";
   *
   * const x = Result.Ok.from(2);
   * assertEquals(x.mapOrElse((err) => 0, (ok) => ok * 2), 4);
   *
   * const y = Result.Err.from("error") as Result.Result<number, string>;
   * assertEquals(y.mapOrElse((err) => 0, (ok) => ok * 2), 0);
   * ```
   */
  mapOrElse<U>(_else: (err: E) => U, fn: (ok: T) => U): U;

  /**
   * Maps a `Result<T, E>` to `Result<T, F>` by applying a function to a contained `Err<F>` value, leaving an `Ok<T>` value untouched.
   *
   * @param `fn`, the function to apply to the `err` value.
   * @typeParam `F`, the type of the new `err` value.
   * @returns a new `Result<T, F>` value.
   *
   * @remarks This method can be used to pass through a successful result while handling an error.
   *
   * @see {@link mapErrAsync} for the asynchronous version of this method.
   * @see {@link map} for transforming the `ok` value.
   *
   * @example
   * ```ts
   * import * as Result from "./mod.ts";
   * import { assertEquals } from "@std/assert";
   *
   * const x = Result.Ok.from(2) as Result.Result<number, number>;
   * assertEquals(x.mapErr((err) => `${err}`), Result.Ok.from(2));
   *
   * const y = Result.Err.from(3);
   * assertEquals(y.mapErr((err) => `${err}`), Result.Err.from("3"));
   * ```
   */
  mapErr<F>(fn: (err: E) => F): Result<T, F>;

  /**
   * Mpas a `Result<T, E>` to `Result<T, F>` by applying an asynchronous function to a contained `Err<F>` value, leaving an `Ok<T>` value untouched.
   *
   * @param `fn`, the asynchronous function to apply to the `err` value.
   * @typeParam `F`, the type of the new `err` value.
   * @returns a `Promise` with the new `Result<T, F>` value.
   *
   * @remarks This method can be used to pass through a successful result while handling an error.
   *
   * @see {@link mapErr} for the synchronous version of this method.
   * @see {@link mapAsync} for transforming the `ok` value asynchronously.
   *
   * @example
   * ```ts
   * import * as Result from "./mod.ts";
   * import { assertEquals } from "@std/assert";
   *
   * const x = Result.Ok.from(2) as Result.Result<number, number>;
   * const y = await x.mapErrAsync((err) => Promise.resolve(`${err}`));
   * assertEquals(y, Result.Ok.from(2));
   *
   * const a = Result.Err.from(3);
   * const b = await a.mapErrAsync((err) => Promise.resolve(`${err}`));
   * assertEquals(b, Result.Err.from("3"));
   * ```
   */
  mapErrAsync<F>(fn: (err: E) => Promise<F>): Promise<Result<T, F>>;

  /**
   * Calls a function with a parameter to the contained `ok` value.
   *
   * @param `fn`, the function to call with the `ok` value.
   * @returns the original `Result` value.
   *
   * @see {@link inspectAsync} for the asynchronous version of this method.
   * @see {@link inspectErr} for calling a function with the `err` value.
   *
   * @example
   * ```ts
   * import * as Result from "./mod.ts";
   * import { assertEquals } from "@std/assert";
   *
   * const x = Result.Ok.from(2);
   * x.inspect((ok) => assertEquals(ok, 2));
   * ```
   */
  inspect(fn: (ok: T) => void): this;

  /**
   * Calls an asynchronous function with a parameter to the contained `ok` value.
   *
   * @param `fn`, the asynchronous function to call with the `ok` value.
   * @returns a `Promise` with the original `Result` value.
   *
   * @see {@link inspect} for the synchronous version of this method.
   * @see {@link inspectErrAsync} for calling an asynchronous function with the `err` value.
   *
   * @example
   * ```ts
   * import * as Result from "./mod.ts";
   * import { assertEquals } from "@std/assert";
   *
   * const x = Result.Ok.from(2);
   * await x.inspectAsync((ok) => Promise.resolve(assertEquals(ok, 2)));
   * ```
   */
  inspectAsync(fn: (ok: T) => Promise<void>): Promise<this>;

  /**
   * Calls a function with a parameter to the contained `err` value.
   *
   * @param `fn`, the function to call with the `err` value.
   * @returns the original `Result` value.
   *
   * @see {@link inspectAsync} for the asynchronous version of this method.
   * @see {@link inspect} for calling a function with the `ok` value.
   *
   * @example
   * ```ts
   * import * as Result from "./mod.ts";
   * import { assertEquals } from "@std/assert";
   *
   * const x = Result.Err.from("error");
   * x.inspectErr((err) => assertEquals(err, "error"));
   * ```
   */
  inspectErr(fn: (err: E) => void): this;

  /**
   * Calls an asynchronous function with a parameter to the contained `err` value.
   *
   * @param `fn`, the asynchronous function to call with the `err` value.
   * @returns a `Promise` with the original `Result` value.
   *
   * @see {@link inspectErr} for the synchronous version of this method.
   * @see {@link inspectAsync} for calling an asynchronous function with the `ok` value.
   *
   * @example
   * ```ts
   * import * as Result from "./mod.ts";
   * import { assertEquals } from "@std/assert";
   *
   * const x = Result.Err.from("error");
   * x.inspectErrAsync((err) => Promise.resolve(assertEquals(err, "error")));
   * ```
   */
  inspectErrAsync(fn: (err: E) => Promise<void>): Promise<this>;

  /**
   * @params `msg`, the error message to display if this is an `Err`.
   * @returns the `ok` value.
   * @throws an error with the provided message if this is an `Err`.
   *
   * @see {@link unwrap} for retrieving `ok` without providing an error message.
   * @see {@link expectErr} for the complementary method for `err`.
   *
   * @example
   * ```ts
   * import * as Result from "./mod.ts";
   * import { assertEquals, assertThrows } from "@std/assert";
   *
   * const x = Result.Ok.from(2) as Result.Result<number, string>;
   * assertEquals(x.expect("error"), 2);
   *
   * const y = Result.Err.from("error");
   * assertThrows(() => y.expect("error"));
   * ```
   */
  expect(msg: string): T | never;

  /**
   * @returns the `ok` value.
   * @throws an `Error` if this is an `Err`.
   *
   * @see {@link expect} for providing an error message.
   * @see {@link unwrapErr} for retrieving the `err` value.
   *
   * @example
   * ```ts
   * import * as Result from "./mod.ts";
   * import { assertEquals, assertThrows } from "@std/assert";
   *
   * const x = Result.Ok.from(2);
   * assertEquals(x.unwrap(), 2);
   *
   * const y = Result.Err.from("error");
   * assertThrows(() => y.unwrap());
   * ```
   *
   * @privateRemarks This could be combined with {@link expect} with an optional parameter to provide an error message.
   */
  unwrap(): T | never;

  /**
   * @params `msg`, the error message to display if this is an `Ok`.
   * @returns the `err` value.
   * @throws an `Error` with the provided message if this is an `Ok`.
   *
   * @see {@link unwrapErr} for retrieving `err` without providing an error message.
   * @see {@link expect} for the complementary method for `ok`.
   *
   * @example
   * ```ts
   * import * as Result from "./mod.ts";
   * import { assertEquals, assertThrows } from "@std/assert";
   *
   * const x = Result.Err.from("error") as Result.Result<number, string>;
   * assertEquals(x.expectErr("error"), "error");
   *
   * const y = Result.Ok.from(2);
   * assertThrows(() => y.expectErr("error"));
   * ```
   */
  expectErr(msg: string): E | never;

  /**
   * @returns the `err` value.
   * @throws an `Error` if this is an `Ok`.
   *
   * @see {@link expectErr} for providing an error message.
   * @see {@link unwrap} for retrieving the `ok` value.
   *
   * @example
   * ```ts
   * import * as Result from "./mod.ts";
   * import { assertEquals, assertThrows } from "@std/assert";
   *
   * const x = Result.Err.from("error");
   * assertEquals(x.unwrapErr(), "error");
   *
   * const y = Result.Ok.from(2);
   * assertThrows(() => y.unwrapErr());
   * ```
   *
   * @privateRemarks This could be combined with {@link expectErr} with an optional parameter to provide an error message.
   */
  unwrapErr(): E | never;

  /**
   * @returns `res` if the result is `Ok`, otherwise returns the `Err` value of `this`.
   * @param `res`, the `Result` to return if this is `Ok`.
   * @typeParam `R2`, the type of the `Result` to return if this is `Ok`.
   *
   * @remarks Arguments passed to `and` are eagerly evaluated; if you are passing the result of a function call, it is recommended to use {@link andThen}, which is lazily evaluated.
   *
   * @see {@link andThen} for the lazily evaluated version of this method.
   * @see {@link or} for returning `this` if `this` is `Ok`.
   *
   * @example
   * ```ts
   * import * as Result from "./mod.ts";
   * import { assertEquals } from "@std/assert";
   *
   * const a1 = Result.Ok.from(2);
   * const b1 = Result.Err.from("late error");
   * assertEquals(a1.and(b1), Result.Err.from("error"));
   *
   * const a2 = Result.Err.from("early error") as Result.Result<string, string>;
   * const b2 = Result.Ok.from("foo");
   * assertEquals(a2.and(b2), Result.Err.from("early error"));
   *
   * const a3 = Result.Err.from("not a 2") as Result.Result<number, string>;;
   * const b3 = Result.Err.from("late error");
   * assertEquals(a3.and(b3), Result.Err.from("not a 2"));
   *
   * const a4 = Result.Ok.from(2);
   * const b4 = Result.Ok.from("different result");
   * ```
   *
   * @privateRemarks This method and its sister methods has a return type that allows combining different `err` types.
   */
  and<R2 extends Result<unknown, unknown>>(res: R2): R2 | Err<E>;

  /**
   * @returns the result of calling `then` if this is `Ok`, otherwise returns the `Err` value of `this`.
   * @param `then`, the function to call with the `ok` value if this is `Ok`.
   * @typeParam `R2`, the type of the `Result` to return if this is `Ok`.
   *
   * @remarks This method can be used for control flow based on `Result` values.
   *
   * @see {@link and} for the eagerly evaluated version of this method.
   * @see {@link andThenAsync} for the asynchronous version of this method.
   * @see {@link orElse} to return `this` if `this` is `Ok` or call a function if `this` is `Err`.
   *
   * @example
   * ```ts
   * import * as Result from "./mod.ts";
   * import { assertEquals } from "@std/assert";
   *
   * const sq_to_string = (ok: number) => ok * ok >= 2 ** 31 ? Result.Err.from("overflow") : Result.Ok.from(`${ok * ok}`);
   *
   * assertEquals(Result.Ok.from(2).andThen(sq_to_string), Result.Ok.from("4"));
   * assertEquals(Result.Ok.from(1_000_000).andThen(sq_to_string), Result.Err.from("overflow"));
   * assertEquals((Result.Err.from("error") as Result.Result<number, string>).andThen(sq_to_string), Result.Err.from("error"));
   * ```
   */
  andThen<R2 extends Result<unknown, unknown>>(
    then: (ok: T) => R2,
  ): R2 | Err<E>;

  /**
   * @returns the asynchronous result of calling `then` if this is `Ok`, otherwise returns the `Err` value of `this`.
   * @param `then`, the asynchronous function to call with the `ok` value if this is `Ok`.
   * @typeParam `R2`, the type of the `Result` to return if this is `Ok`.
   *
   * @remarks This method can be used for control flow based on `Result` values.
   *
   * @see {@link andThen} for the synchronous version of this method.
   * @see {@link andThenAsync} for the asynchronous version of this method.}
   * @see {@link orElse}
   *
   * @example
   * ```ts
   * import * as Result from "./mod.ts";
   * import { assertEquals } from "@std/assert";
   *
   * const sq_to_string = async (ok: number) => ok * ok >= 2 ** 31
   *  ? Promise.resolve(Result.Err.from("overflow"))
   *  : Promise.resolve(Result.Ok.from(`${ok * ok}`));
   *
   * assertEquals(await Result.Ok.from(2).andThenAsync(sq_to_string), Result.Ok.from("4"));
   * assertEquals(await Result.Ok.from(1_000_000).andThenAsync(sq_to_string), Result.Err.from("overflow"));
   * assertEquals(await (Result.Err.from("error") as Result.Result<number, string>).andThenAsync(sq_to_string), Result.Err.from("error"));
   * ```
   */
  andThenAsync<R2 extends Result<unknown, unknown>>(
    then: (ok: T) => Promise<R2>,
  ): Promise<R2 | Err<E>>;

  /**
   * @returns `res` if the result is `Err`, otherwise returns `this`.
   * @param `res`, the `Result` to return if this is `Err`.
   * @typeParam `R2`, the type of the `Result` to return if this is `Err`.
   *
   * @remarks Arguments passed to `or` are eagerly evaluated; if you are passing the result of a function call, it is recommended to use {@link orElse}, which is lazily evaluated.
   *
   * @see {@link and} for returning `res` if `this` is `Ok`.
   * @see {@link orElse} for the lazily evaluated version of this method.
   *
   * @example
   * ```ts
   * import * as Result from "./mod.ts";
   * import { assertEquals } from "@std/assert";
   *
   * const a1 = Result.Ok.from(2) as Result.Result<number, string>;
   * const b1 = Result.Err.from("late error");
   * assertEquals(a1.or(b1), Result.Ok.from(2));
   *
   * const a2 = Result.Err.from("early error") as Result.Result<string, string>;
   * const b2 = Result.Ok.from("foo");
   * assertEquals(a2.or(b2), Result.Ok.from("foo"));
   *
   * const a3 = Result.Err.from("not a 2") as Result.Result<number, string>;;
   * const b3 = Result.Err.from("late error");
   * assertEquals(a3.or(b3), Result.Err.from("late error"));
   *
   * const a4 = Result.Ok.from(2) as Result.Result<number, string>;
   * const b4 = Result.Ok.from(100);
   * assertEquals(a4.or(b4), Result.Ok.from(2));
   * ```
   *
   * @privateRemarks This method and its sister methods has a return type that allows combining different `ok` types.
   */
  or<R2 extends Result<unknown, unknown>>(res: R2): Ok<T> | R2;

  /**
   * Calls op if the result is `Err`, otherwise returns the `Ok` value of `this`.
   *
   * @param `_else`, the function to call with the `err` value.
   * @typeParam `R2`, the type of the `Result` to return if this is `Err`.
   * @returns the result of applying the appropriate function to the contained value.
   *
   * @remarks This function can be used for control flow based on `Result` values.
   *
   * @see {@link or} for the eagerly evaluated version of this method.
   * @see {@link orElseAsync} for the asynchronous version of this method.
   * @see {@link andThen} to return `this` if `this` is `Err` or call a function if `this` is `Ok`.
   *
   * @example
   * ```ts
   * import * as Result from "./mod.ts";
   * import { assertEquals } from "@std/assert";
   *
   * const sq = (err: number): Result.Result<number, number> => Result.Ok.from(err ** 2);
   * const err = Result.Err.from;
   *
   * const ok2 = Result.Ok.from(2) as Result.Result<number, number>;
   * assertEquals(ok2.orElse(sq).orElse(sq), Result.Ok.from(2));
   * assertEquals(ok2.orElse(err).orElse(sq), Result.Ok.from(2));
   *
   * const err3 = Result.Err.from(3) as Result.Result<number, number>;
   * assertEquals(err3.orElse(sq).orElse(err), Result.Ok.from(9));
   * assertEquals(err3.orElse(err).orElse(err), Result.Err.from(3));
   * ```
   */
  orElse<R2 extends Result<unknown, unknown>>(
    _else: (err: E) => R2,
  ): Ok<T> | R2;

  /**
   * Calls an asynchronous function with a parameter to the contained `err` value.
   *
   * @param `_else`, the asynchronous function to call with the `err` value.
   * @typeParam `R2`, the type of the `Result` to return if this is `Err`.
   * @returns the result of applying the appropriate function to the contained value.
   *
   * @remarks This method can be used for control flow based on `Result` values.
   *
   * @see {@link orElse} for the synchronous version of this method.
   * @see {@link or} for the eagerly evaluated version of this method.
   * @see {@link andThenAsync} to return `this` if `this` is `Err` or call a function if `this` is `Ok`.
   *
   * @example
   * ```ts
   * import * as Result from "./mod.ts";
   * import { assertEquals } from "@std/assert";
   *
   * const sq = async (err: number) => Result.Ok.from(err ** 2);
   *
   * const x = Result.Ok.from(2) as Result.Result<number, number>;
   * assertEquals(await x.orElseAsync(sq), Result.Ok.from(2));
   *
   * const y = Result.Err.from(3) as Result.Result<number, number>;
   * assertEquals(await y.orElseAsync(sq), Result.Ok.from(9));
   * ```
   */
  orElseAsync<R2 extends Result<unknown, unknown>>(
    _else: (err: E) => Promise<R2>,
  ): Promise<Ok<T> | R2>;

  // TODO: move `unwrap` and unwrapOrElse` by the other unwrap methods

  /**
   * @returns the contained `ok` or a provided default.
   * @param `or`, the default value to return if this is an `Err`.
   *
   * @remarks Arguments passed to `unwrapOr` are eagerly evaluated; if you are passing the result of a function call, it is recommended to use {@link unwrapOrElse}, which is lazily evaluated.
   *
   * @see {@link unwrapOrElse} for the lazily evaluated version of this method.
   * @see {@link unwrap} for retrieving the `ok` value or throwing an error.
   *
   * @example
   * ```ts
   * import * as Result from "./mod.ts";
   * import { assertEquals } from "@std/assert";
   *
   * const x = Result.Ok.from(2) as Result.Result<number, string>;
   * assertEquals(x.unwrapOr(0), 2);
   *
   * const y = Result.Err.from("error");
   * assertEquals(y.unwrapOr(0), 0);
   * ```
   */
  unwrapOr(ok: T): T;

  /**
   * @returns the contained `ok` or computes it from a closure.
   * @param `_else`, the function to call to compute the default value if this is an `Err`.
   *
   * @remarks This method can be used with asynchronous functions.
   *
   * @see {@link unwrapOr} for the eagerly evaluated version of this method.
   *
   * @example
   * ```ts
   * import * as Result from "./mod.ts";
   * import { assertEquals } from "@std/assert";
   *
   * const count = (err: string) => err.length;
   *
   * assertEquals((Result.Ok.from(2) as Result.Result<number, string>).unwrapOrElse(count), 2);
   * assertEquals(Result.Err.from("error").unwrapOrElse(count), 5);
   * ```
   */
  unwrapOrElse(_else: (err: E) => T): T;

  // TODO: fix transpose
  transpose(): Result<E, T>;

  /**
   * @returns a shallow clone of the `Result`.
   *
   * @example
   * ```ts
   * import * as Result from "./mod.ts";
   * import { assertEquals } from "@std/assert";
   *
   * const x = Result.Ok.from("hello");
   * assertEquals(x.clone(), x);
   *
   * const y = Result.Err.from("error");
   * assertEquals(y.clone(), y);
   * ```
   *
   * @privateRemarks This could have callbacks to clone the `ok` and `err` values.
   * Or, we could move this to a `Clone` trait with a method `Symbol`.
   */
  clone(): Result<T, E>;

  // TODO: flatten, experimental
}
