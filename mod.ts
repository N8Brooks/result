/** A namespace to simulate `static` methods for the `Result` type. */
// deno-lint-ignore no-namespace
export namespace Result {
  /**
   * Takes each element in the `Iterable`: if it is an `Err`, no further elements are taken, and the `Err` is returned.
   * Should no `Err` occur, an `Array` with the `ok` of each `Result` is returned.
   *
   * @param `results` the `Iterable` of `Result`s to collect.
   * @returns an `Ok` with an `Array` of the `ok` values if no `Err` occurs, otherwise the first `Err` is returned.
   *
   * @typeParam `T`, the type of the `ok` values.
   * @typeParam `E`, the type of the `err` values.
   *
   * @example
   * ```ts
   * import { Result } from "./mod.ts";
   * import { assertEquals } from "@std/assert";
   *
   * const results = [Result.ok(1), Result.ok(2)];
   * const result = Result.fromIter(results);
   * assertEquals(result, Result.ok([1, 2]));
   * ```
   *
   * @example
   * Here is another example that shows that the first `Err` is returned:
   * ```ts
   * import { Result } from "./mod.ts";
   * import { assertEquals } from "@std/assert";
   *
   * const results = [Result.ok(1), Result.err("error"), Result.err("error 2")];
   * const result = Result.fromIter(results);
   * assertEquals(result, Result.err("error"));
   * ```
   *
   * @privateRemarks Perhaps less flexible typing than methods with extends typing like `and` and `or`
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
    return new Ok(oks);
  }

  /**
   * Creates a new `Ok` value.
   *
   * @param ok the value to wrap in an `Ok`.
   * @returns a new `Ok<T>` value.
   *
   * @typeParam `T`, the type of the value.
   *
   * @remarks This is a convenience method to avoid the `new` keyword.
   *
   * @see {@link err} for the `Err` variant.
   *
   * @example
   * ```ts
   * import { Result } from "./mod.ts";
   * import { assertEquals } from "@std/assert";
   *
   * const x = Result.ok(2);
   * assertEquals(x, new Result.Ok(2));
   * ```
   */
  export function ok<T>(ok: T): Ok<T> {
    return new Ok(ok);
  }

  /** Contains the success value of a `Result`. */
  export class Ok<T> implements InnerOk<T>, Resultable<T, never> {
    readonly err!: never;

    constructor(public readonly ok: T) {}

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

    isOkAndAsync(and: (ok: T) => Promise<boolean>): Promise<boolean> {
      return and(this.ok);
    }

    isErr(): this is Err<never> {
      return false;
    }

    isErrAnd(): this is Err<never> {
      return false;
    }

    isErrAndAsync(): Promise<boolean> {
      return Promise.resolve(false);
    }

    map<U>(fn: (ok: T) => U): Ok<U> {
      return new Ok(fn(this.ok));
    }

    async mapAsync<U>(fn: (ok: T) => Promise<U>): Promise<Ok<U>> {
      return new Ok(await fn(this.ok));
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

    unwrapOr(): T {
      return this.ok;
    }

    unwrapOrElse(): T {
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

    transpose(): undefined | Ok<NonNullable<T>> {
      return this.ok === undefined || this.ok === null
        ? undefined
        : new Ok(this.ok);
    }

    flatten<U, F>(this: Result<Result<U, F>, unknown>): Result<U, F> {
      return this.ok;
    }

    clone(): Ok<T> {
      return new Ok(this.ok);
    }
  }
  /**
   * Implemented by `Ok` values which contains the `ok` value.
   *
   * @typeParam `T`, the type of the `ok` value.
   *
   * @sealed Not meant to be implemented or extended by users.
   */
  export interface InnerOk<T> {
    /**
     * Access `T | undefined` from `Result<T, E>`.
     *
     * @remarks doesn't work well will optional `T` types.
     */
    readonly ok: T;
    /**
     * Access `E | undefined` from `Result<T, E>`.
     *
     * @remarks doesn't work well will optional `E` types.
     */
    readonly err?: never;
  }

  /**
   * Creates a new `Err` value.
   *
   * @param err the value to wrap in an `Err`.
   * @returns a new `Err<E>` value.
   *
   * @typeParam `E`, the type of the value.
   *
   * @remarks This is a convenience method to avoid the `new` keyword.
   *
   * @see {@link Result.ok} for the `Ok` variant.
   *
   * @example
   * ```ts
   * import { Result } from "./mod.ts";
   * import { assertEquals } from "@std/assert";
   *
   * const x = Result.err("error");
   * assertEquals(x, new Result.Err("error"));
   * ```
   */
  export function err<E>(err: E): Err<E> {
    return new Err(err);
  }

  /** Contains the error value of a `Result`. */
  export class Err<E> implements InnerErr<E>, Resultable<never, E> {
    readonly ok!: never;

    constructor(public readonly err: E) {}

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

    isOkAndAsync(): Promise<boolean> {
      return Promise.resolve(false);
    }

    isErr(): this is Err<E> {
      return true;
    }

    isErrAnd<F extends E>(and: (err: E) => err is F): this is Err<F>;
    isErrAnd(and: (err: E) => boolean): this is Err<E>;
    isErrAnd(and: (err: E) => boolean) {
      return and(this.err);
    }

    isErrAndAsync(and: (err: E) => Promise<boolean>): Promise<boolean> {
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
      return new Err(fn(this.err));
    }

    async mapErrAsync<F>(fn: (err: E) => Promise<F>): Promise<Err<F>> {
      return new Err(await fn(this.err));
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

    unwrapOr<T>(or: T): T {
      return or;
    }

    unwrapOrElse<T>(_else: (err: E) => T): T {
      return _else(this.err);
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

    transpose(): this {
      return this;
    }

    flatten(): this {
      return this;
    }

    clone(): Err<E> {
      return new Err(this.err);
    }
  }

  /**
   * Implemented by `Err` values which contain the `err` value.
   *
   * @typeParam `E`, the type of the `err` value.
   *
   * @sealed Not meant to be implemented or extended by users.
   */
  export interface InnerErr<E> {
    /**
     * Access `T | undefined` from `Result<T, E>`.
     *
     * @remarks doesn't work well will optional `T` types.
     */
    readonly ok?: never;
    /**
     * Access `E | undefined` from `Result<T, E>`.
     *
     * @remarks doesn't work well will optional `E` types.
     */
    readonly err: E;
  }

  /**
   * The common `interface` for `Ok` and `Err` values.
   *
   * @typeParam `T`, the type of the `ok` value.
   * @typeParam `E`, the type of the `err` value.
   *
   * @sealed Not meant to be implemented or extended by users.
   */
  export interface Resultable<T, E> extends Iterable<T> {
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
     * import { Result } from "./mod.ts";
     * import { assertEquals } from "@std/assert";
     *
     * const x = Result.ok(2);
     * assertEquals(x.isOk(), true);
     *
     * const y = Result.err("error");
     * assertEquals(y.isOk(), false);
     * ```
     */
    isOk(): this is Ok<T>;

    /**
     * @returns `true` if the `Result` is `Ok` and the `ok` value satisfies the predicate.
     * @param `and`, the predicate to apply to the `ok` value.
     *
     * @remarks This provides a  type guard for a specific `Ok` variant.
     *
     * @see {@link isOk} for a more general version of this method.
     * @see {@link isErrAnd} for the complementary `Err` method.
     *
     * @example
     * ```ts
     * import { Result } from "./mod.ts";
     * import { assertEquals } from "@std/assert";
     *
     * const x = Result.ok<number | bigint>(2);
     * assertEquals(x.isOkAnd((ok) => typeof ok === "number"), true);
     *
     * const y = Result.err("error") as Result<number | bigint, string>;
     * assertEquals(y.isOkAnd((ok) => typeof ok === "number"), false);
     * ```
     */
    isOkAnd<U extends T>(and: (ok: T) => ok is U): this is Ok<U>;

    /**
     * @returns `true` if the `Result` is `Ok` and the `ok` value satisfies the predicate.
     * @param `and`, the predicate to apply to the `ok` value.
     *
     * @see {@link isOk} for a more general version of this method.
     * @see {@link isErrAnd} for the complementary `Err` method.
     *
     * @example
     * ```ts
     * import { Result } from "./mod.ts";
     * import { assertEquals } from "@std/assert";
     *
     * const x = Result.ok(2);
     * assertEquals(x.isOkAnd((ok) => ok > 1), true);
     * assertEquals(x.isOkAnd((ok) => ok > 5), false);
     *
     * const y = Result.err("error") as Result<number, string>;
     * assertEquals(y.isOkAnd((ok) => ok > 1), false);
     * ```
     */
    isOkAnd(and: (ok: T) => boolean): this is Ok<T>;

    /**
     * @returns `Promise<true>` if the `Result` is `Ok` and the `ok` value satisfies the predicate.
     * @param `and`, the async predicate to apply to the `ok` value.
     *
     * @remarks This does not provide a type guard.
     *
     * @see {@link isOk} for a more general version of this method with a type guard.
     * @see {@link isOkAnd} for a type guard version of this method.
     * @see {@link isErrAnAsync} for the complementary `Err` method.
     *
     * @example
     * ```
     * import { Result } from "./mod.ts";
     * import { assertEquals } from "@std/assert";}
     *
     * const x = Result.ok(2);
     * assertEquals(await x.isOkAndAsync((ok) => Promise.resolve(ok > 1)), true);
     * assertEquals(await x.isOkAndAsync((ok) => Promise.resolve(ok > 5)), false);
     *
     * const y: Result<number, string> = Result.err("error");
     * assertEquals(await y.isOkAndAsync((ok) => Promise.resolve(ok > 1)), false);
     * ```
     */
    isOkAndAsync(and: (ok: T) => Promise<boolean>): Promise<boolean>;

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
     * import { Result } from "./mod.ts";
     * import { assertEquals } from "@std/assert";
     *
     * const x = Result.err("error");
     * assertEquals(x.isErr(), true);
     *
     * const y = Result.ok(1);
     * assertEquals(y.isErr(), false);
     * ```
     */
    isErr(): this is Err<E>;

    /**
     * @returns `true` if the `Result` is `Err` and the `err` value satisfies the predicate.
     * @param `and`, the predicate to apply to the `err` value.
     *
     * @remarks This provides a type guard for a specific `Err` variant.
     *
     * @see {@link isErr} for a more general version of this method.
     * @see {@link isOkAnd} for the complementary `Ok` method.
     *
     * @example
     * ```ts
     * import { Result } from "./mod.ts";
     * import { assertEquals } from "@std/assert";
     *
     * const x = Result.err<number | bigint>(2);
     * assertEquals(x.isErrAnd((err) => typeof err === "number"), true);
     *
     * const y = Result.ok("error") as Result<string, number | bigint>;
     * assertEquals(y.isErrAnd((err) => typeof err === "number"), false);
     * ```
     */
    isErrAnd<F extends E>(and: (err: E) => err is F): this is Err<F>;

    /**
     * @returns `true` if the `Result` is `Err` and the `err` value satisfies the predicate.
     * @param `and`, the predicate to apply to the `err` value.
     *
     * @see {@link isErr} for a more general version of this method.
     * @see {@link isOkAnd} for the complementary `Ok` method.
     *
     * @example
     * ```ts
     * import { Result } from "./mod.ts";
     * import { assertEquals } from "@std/assert";
     *
     * const x = Result.err("error");
     * assertEquals(x.isErrAnd((err) => err === "error"), true);
     * assertEquals(x.isErrAnd((err) => err === "error 2"), false);
     *
     * const y = Result.ok(1) as Result<number, string>;
     * assertEquals(y.isErrAnd((err) => err === "error"), false);
     * ```
     */
    isErrAnd(and: (err: E) => boolean): this is Err<E>;

    /**
     * @returns `Promise<true>` if the `Result` is `Err` and the `err` value satisfies the predicate.
     * @param `and`, the async predicate to apply to the `err` value.
     *
     * @remarks This does not provide a type guard.
     *
     * @see {@link isErr} for a more general version of this method with a type guard.
     * @see {@link isErrAnd} for a type guard version of this method.
     * @see {@link isOkAndAsync} for the complementary `Ok` method.
     *
     * @example
     * ```
     * import { Result } from "./mod.ts";
     * import { assertEquals } from "@std/assert";}
     *
     * const x = Result.err("error");
     * assertEquals(await x.isErrAndAsync((err) => Promise.resolve(err === "error")), true);
     * assertEquals(await x.isErrAndAsync((err) => Promise.resolve(err === "error 2")), false);
     *
     * const y: Result<number, string> = Result.ok(1);
     * assertEquals(await y.isErrAndAsync((err) => Promise.resolve(err === "error")), false);
     * ```
     */
    isErrAndAsync(and: (err: E) => Promise<boolean>): Promise<boolean>;

    /**
     * Maps a `Result<T, E>` to `Result<U, E>` by applying a function to a contained `Ok<U>` value, leaving an `Err<E>` value untouched.
     *
     * @returns a new `Result<U, E>` value.
     * @param `fn`, the function to apply to the `ok` value.
     *
     * @typeParam `U`, the type of the new `ok` value.
     *
     * @remarks This method can be used to compose the results of two functions.
     *
     * @see {@link mapAsync} the asynchronous version of this method.
     * @see {@link mapOr} for providing a default value for the `Err` variant.
     * @see {@link mapErr} to transform the `err` value.
     *
     * @example
     * ```ts
     * import { Result } from "./mod.ts";
     * import { assertEquals } from "@std/assert";
     *
     * const x = Result.ok(2);
     * assertEquals(x.map((ok) => `${ok}`), Result.ok("2"));
     *
     * const y = Result.err("error") as Result<number, string>;
     * assertEquals(y.map((ok) => 2 * ok), Result.err("error"));
     * ```
     */
    map<U>(fn: (ok: T) => U): Result<U, E>;

    /**
     * Maps a `Result<T, E>` to `Result<U, E>` by applying an asynchronous function to a contained `Ok<U>` value, leaving an `Err<E>` value untouched.
     *
     * @returns a `Promise` with the new `Result<U, E>` value.
     * @param `fn`, the asynchronous function to apply to the `ok` value.
     *
     * @typeParam `U`, the type of the new `ok` value.
     *
     * @remarks This method can be used to compose the results of two functions.
     *
     * @see {@link map} the synchronous version of this method.
     * @see {@link mapErrAsync} to transform the `err` value asynchronously.
     *
     * @example
     * ```ts
     * import { Result } from "./mod.ts";
     * import { assertEquals } from "@std/assert";
     *
     * const x = Result.ok(2);
     * const y = await x.mapAsync((ok) => Promise.resolve(`${ok}`));
     * assertEquals(y, Result.ok("2"));
     *
     * const a = Result.err("error") as Result<number, string>;
     * const b = await a.mapAsync((ok) => Promise.resolve(2 * ok));
     * assertEquals(b, Result.err("error"));
     * ```
     */
    mapAsync<U>(fn: (ok: T) => Promise<U>): Promise<Result<U, E>>;

    /**
     * @returns the provided default, `or`, (if `Err`), or applies a function to the contained value (if `Ok`).
     * @param `or`, the default value to return if the `Result` is `Err`.
     * @param `fn`, the function to apply to the `ok` value.
     *
     * @typeParam `U`, the type of the return value.
     *
     * @remarks
     * - The `or` parameter is eagerly evaluated; if you are passing the result of a function call, it is recommended to use {@link mapOrElse} instead.
     * - This method can be used with asynchronous functions.
     *
     * @see {@link map} for the returning a `Result` instead of a value.
     * @see {@link mapOrElse} for providing a function to apply to the `err` value.
     *
     * @example
     * ```ts
     * import { Result } from "./mod.ts";
     * import { assertEquals } from "@std/assert";
     *
     * const x = Result.ok(2);
     * assertEquals(x.mapOr(0, (ok) => ok * 2), 4);
     *
     * const y = Result.err("error") as Result<number, string>;
     * assertEquals(y.mapOr(0, (ok) => ok * 2), 0);
     * ```
     */
    mapOr<U>(or: U, fn: (ok: T) => U): U;

    /**
     * Maps a `Result<T, E>` to `U` by applying the fallback function `_else` to a contained `err`, or a function `fn` to a contained `ok`.
     *
     * @returns the result of applying the appropriate function to the contained value.
     * @param `_else`, the function to apply to the `err` value.
     * @param `fn`, the function to apply to the `ok` value.
     *
     * @typeParam `U`, the type of the return value.
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
     * import { Result } from "./mod.ts";
     * import { assertEquals } from "@std/assert";
     *
     * const x = Result.ok(2);
     * assertEquals(x.mapOrElse((err) => 0, (ok) => ok * 2), 4);
     *
     * const y = Result.err("error") as Result<number, string>;
     * assertEquals(y.mapOrElse((err) => 0, (ok) => ok * 2), 0);
     * ```
     */
    mapOrElse<U>(_else: (err: E) => U, fn: (ok: T) => U): U;

    /**
     * Maps a `Result<T, E>` to `Result<T, F>` by applying a function to a contained `Err<F>` value, leaving an `Ok<T>` value untouched.
     *
     * @returns a new `Result<T, F>` value.
     * @param `fn`, the function to apply to the `err` value.
     *
     * @typeParam `F`, the type of the new `err` value.
     *
     * @remarks This method can be used to pass through a successful result while handling an error.
     *
     * @see {@link mapErrAsync} for the asynchronous version of this method.
     * @see {@link map} for transforming the `ok` value.
     *
     * @example
     * ```ts
     * import { Result } from "./mod.ts";
     * import { assertEquals } from "@std/assert";
     *
     * const x = Result.ok(2) as Result<number, number>;
     * assertEquals(x.mapErr((err) => `${err}`), Result.ok(2));
     *
     * const y = Result.err(3);
     * assertEquals(y.mapErr((err) => `${err}`), Result.err("3"));
     * ```
     */
    mapErr<F>(fn: (err: E) => F): Result<T, F>;

    /**
     * Maps a `Result<T, E>` to `Result<T, F>` by applying an asynchronous function to a contained `Err<F>` value, leaving an `Ok<T>` value untouched.
     *
     * @returns a `Promise` with the new `Result<T, F>` value.
     * @param `fn`, the asynchronous function to apply to the `err` value.
     *
     * @typeParam `F`, the type of the new `err` value.
     *
     * @remarks This method can be used to pass through a successful result while handling an error.
     *
     * @see {@link mapErr} for the synchronous version of this method.
     * @see {@link mapAsync} for transforming the `ok` value asynchronously.
     *
     * @example
     * ```ts
     * import { Result } from "./mod.ts";
     * import { assertEquals } from "@std/assert";
     *
     * const x = Result.ok(2) as Result<number, number>;
     * const y = await x.mapErrAsync((err) => Promise.resolve(`${err}`));
     * assertEquals(y, Result.ok(2));
     *
     * const a = Result.err(3);
     * const b = await a.mapErrAsync((err) => Promise.resolve(`${err}`));
     * assertEquals(b, Result.err("3"));
     * ```
     */
    mapErrAsync<F>(fn: (err: E) => Promise<F>): Promise<Result<T, F>>;

    /**
     * Calls a function with a parameter to the contained `ok` value.
     *
     * @returns the original `Result` value.
     * @param `fn`, the function to call with the `ok` value.
     *
     * @see {@link inspectAsync} for the asynchronous version of this method.
     * @see {@link inspectErr} for calling a function with the `err` value.
     *
     * @example
     * ```ts
     * import { Result } from "./mod.ts";
     * import { assertEquals } from "@std/assert";
     *
     * const x = Result.ok(2);
     * x.inspect((ok) => assertEquals(ok, 2));
     * ```
     */
    inspect(fn: (ok: T) => void): this;

    /**
     * Calls an asynchronous function with a parameter to the contained `ok` value.
     *
     * @returns a `Promise` with the original `Result` value.
     * @param `fn`, the asynchronous function to call with the `ok` value.
     *
     * @see {@link inspect} for the synchronous version of this method.
     * @see {@link inspectErrAsync} for calling an asynchronous function with the `err` value.
     *
     * @example
     * ```ts
     * import { Result } from "./mod.ts";
     * import { assertEquals } from "@std/assert";
     *
     * const x = Result.ok(2);
     * await x.inspectAsync((ok) => Promise.resolve(assertEquals(ok, 2)));
     * ```
     */
    inspectAsync(fn: (ok: T) => Promise<void>): Promise<this>;

    /**
     * Calls a function with a parameter to the contained `err` value.
     *
     * @returns the original `Result` value.
     * @param `fn`, the function to call with the `err` value.
     *
     * @see {@link inspectAsync} for the asynchronous version of this method.
     * @see {@link inspect} for calling a function with the `ok` value.
     *
     * @example
     * ```ts
     * import { Result } from "./mod.ts";
     * import { assertEquals } from "@std/assert";
     *
     * const x = Result.err("error");
     * x.inspectErr((err) => assertEquals(err, "error"));
     * ```
     */
    inspectErr(fn: (err: E) => void): this;

    /**
     * Calls an asynchronous function with a parameter to the contained `err` value.
     *
     * @returns a `Promise` with the original `Result` value.
     * @param `fn`, the asynchronous function to call with the `err` value.
     *
     * @see {@link inspectErr} for the synchronous version of this method.
     * @see {@link inspectAsync} for calling an asynchronous function with the `ok` value.
     *
     * @example
     * ```ts
     * import { Result } from "./mod.ts";
     * import { assertEquals } from "@std/assert";
     *
     * const x = Result.err("error");
     * x.inspectErrAsync((err) => Promise.resolve(assertEquals(err, "error")));
     * ```
     */
    inspectErrAsync(fn: (err: E) => Promise<void>): Promise<this>;

    /**
     * @returns the `ok` value.
     * @params `msg`, the error message to display if this is an `Err`.
     * @throws an error with the provided message if this is an `Err`.
     *
     * @see {@link unwrap} for retrieving `ok` without providing an error message.
     * @see {@link expectErr} for the complementary method for `err`.
     *
     * @example
     * ```ts
     * import { Result } from "./mod.ts";
     * import { assertEquals, assertThrows } from "@std/assert";
     *
     * const x = Result.ok(2) as Result<number, string>;
     * assertEquals(x.expect("error"), 2);
     *
     * const y = Result.err("error");
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
     * import { Result } from "./mod.ts";
     * import { assertEquals, assertThrows } from "@std/assert";
     *
     * const x = Result.ok(2);
     * assertEquals(x.unwrap(), 2);
     *
     * const y = Result.err("error");
     * assertThrows(() => y.unwrap());
     * ```
     *
     * @privateRemarks This could be combined with {@link expect} with an optional parameter to provide an error message.
     */
    unwrap(): T | never;

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
     * import { Result } from "./mod.ts";
     * import { assertEquals } from "@std/assert";
     *
     * const x = Result.ok(2) as Result<number, string>;
     * assertEquals(x.unwrapOr(0), 2);
     *
     * const y = Result.err("error");
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
     * import { Result } from "./mod.ts";
     * import { assertEquals } from "@std/assert";
     *
     * const count = (err: string) => err.length;
     *
     * assertEquals((Result.ok(2) as Result<number, string>).unwrapOrElse(count), 2);
     * assertEquals(Result.err("error").unwrapOrElse(count), 5);
     * ```
     */
    unwrapOrElse(_else: (err: E) => T): T;

    /**
     * @returns the `err` value.
     * @params `msg`, the error message to display if this is an `Ok`.
     * @throws an `Error` with the provided message if this is an `Ok`.
     *
     * @see {@link unwrapErr} for retrieving `err` without providing an error message.
     * @see {@link expect} for the complementary method for `ok`.
     *
     * @example
     * ```ts
     * import { Result } from "./mod.ts";
     * import { assertEquals, assertThrows } from "@std/assert";
     *
     * const x = Result.err("error") as Result<number, string>;
     * assertEquals(x.expectErr("error"), "error");
     *
     * const y = Result.ok(2);
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
     * import { Result } from "./mod.ts";
     * import { assertEquals, assertThrows } from "@std/assert";
     *
     * const x = Result.err("error");
     * assertEquals(x.unwrapErr(), "error");
     *
     * const y = Result.ok(2);
     * assertThrows(() => y.unwrapErr());
     * ```
     *
     * @privateRemarks This could be combined with {@link expectErr} with an optional parameter to provide an error message.
     */
    unwrapErr(): E | never;

    /**
     * @returns `res` if the result is `Ok`, otherwise returns the `Err` value of `this`.
     * @param `res`, the `Result` to return if this is `Ok`.
     *
     * @typeParam `U`, the `ok` type of the `Result`.
     * @typeParam `F`, the `err` type of the `Result`.
     *
     * @remarks Arguments passed to `and` are eagerly evaluated; if you are passing the result of a function call, it is recommended to use {@link andThen}, which is lazily evaluated.
     *
     * @see {@link andThen} for the lazily evaluated version of this method.
     * @see {@link or} for returning `this` if `this` is `Ok`.
     *
     * @example
     * ```ts
     * import { Result } from "./mod.ts";
     * import { assertEquals } from "@std/assert";
     *
     * const a1 = Result.ok(2);
     * const b1 = Result.err("late error");
     * assertEquals(a1.and(b1), Result.err("late error"));
     *
     * const a2 = Result.err("early error") as Result<string, string>;
     * const b2 = Result.ok("foo");
     * assertEquals(a2.and(b2), Result.err("early error"));
     *
     * const a3 = Result.err("not a 2") as Result<number, string>;
     * const b3 = Result.err("late error");
     * assertEquals(a3.and(b3), Result.err("not a 2"));
     *
     * const a4 = Result.ok(2);
     * const b4 = Result.ok("different result");
     * ```
     *
     * @privateRemarks This method and its sister methods has a return type that allows combining different `err` types.
     */
    and<U, F>(res: Result<U, F>): Result<U, E | F>;

    /**
     * @returns the result of calling `then` if this is `Ok`, otherwise returns the `Err` value of `this`.
     * @param `then`, the function to call with the `ok` value if this is `Ok`.
     *
     * @typeParam `U`, the `ok` type from the function.
     * @typeParam `F`, the `err` type from the function.
     *
     * @remarks This method can be used for control flow based on `Result` values.
     *
     * @see {@link and} for the eagerly evaluated version of this method.
     * @see {@link andThenAsync} for the asynchronous version of this method.
     * @see {@link orElse} to return `this` if `this` is `Ok` or call a function if `this` is `Err`.
     *
     * @example
     * ```ts
     * import { Result } from "./mod.ts";
     * import { assertEquals } from "@std/assert";
     *
     * const sq_to_string = (ok: number) => ok * ok >= 2 ** 31 ? Result.err("overflow") : Result.ok(`${ok * ok}`);
     *
     * assertEquals(Result.ok(2).andThen(sq_to_string), Result.ok("4"));
     * assertEquals(Result.ok(1_000_000).andThen(sq_to_string), Result.err("overflow"));
     * assertEquals((Result.err("error") as Result<number, string>).andThen(sq_to_string), Result.err("error"));
     * ```
     */
    andThen<U, F>(then: (ok: T) => Result<U, F>): Result<U, E | F>;

    /**
     * @returns the asynchronous result of calling `then` if this is `Ok`, otherwise returns the `Err` value of `this`.
     * @param `then`, the asynchronous function to call with the `ok` value if this is `Ok`.
     *
     * @typeParam `U`, the `ok` type from the asynchronous function.
     * @typeParam `F`, the `err` type from the asynchronous function.
     *
     * @remarks This method can be used for control flow based on `Result` values.
     *
     * @see {@link andThen} for the synchronous version of this method.
     * @see {@link andThenAsync} for the asynchronous version of this method.}
     * @see {@link orElse}
     *
     * @example
     * ```ts
     * import { Result } from "./mod.ts";
     * import { assertEquals } from "@std/assert";
     *
     * const sq_to_string = async (ok: number) => ok * ok >= 2 ** 31
     *  ? Promise.resolve(Result.err("overflow"))
     *  : Promise.resolve(Result.ok(`${ok * ok}`));
     *
     * assertEquals(await Result.ok(2).andThenAsync(sq_to_string), Result.ok("4"));
     * assertEquals(await Result.ok(1_000_000).andThenAsync(sq_to_string), Result.err("overflow"));
     * assertEquals(await (Result.err("error") as Result<number, string>).andThenAsync(sq_to_string), Result.err("error"));
     * ```
     */
    andThenAsync<U, F>(
      then: (ok: T) => Promise<Result<U, F>>,
    ): Promise<Result<U, E | F>>;

    /**
     * @returns `res` if the result is `Err`, otherwise returns `this`.
     * @param `res`, the `Result` to return if this is `Err`.
     *
     * @typeParam `U`, the `ok` type of the `Result`.
     * @typeParam `F`, the `err` type of the `Result`.
     *
     * @remarks Arguments passed to `or` are eagerly evaluated; if you are passing the result of a function call, it is recommended to use {@link orElse}, which is lazily evaluated.
     *
     * @see {@link and} for returning `res` if `this` is `Ok`.
     * @see {@link orElse} for the lazily evaluated version of this method.
     *
     * @example
     * ```ts
     * import { Result } from "./mod.ts";
     * import { assertEquals } from "@std/assert";
     *
     * const a1 = Result.ok(2) as Result<number, string>;
     * const b1 = Result.err("late error");
     * assertEquals(a1.or(b1), Result.ok(2));
     *
     * const a2 = Result.err("early error") as Result<string, string>;
     * const b2 = Result.ok("foo");
     * assertEquals(a2.or(b2), Result.ok("foo"));
     *
     * const a3 = Result.err("not a 2") as Result<number, string>;
     * const b3 = Result.err("late error");
     * assertEquals(a3.or(b3), Result.err("late error"));
     *
     * const a4 = Result.ok(2) as Result<number, string>;
     * const b4 = Result.ok(100);
     * assertEquals(a4.or(b4), Result.ok(2));
     * ```
     *
     * @privateRemarks This method and its sister methods has a return type that allows combining different `ok` types.
     */
    or<U, F>(res: Result<U, F>): Result<T | U, F>;

    /**
     * Calls op if the result is `Err`, otherwise returns the `Ok` value of `this`.
     *
     * @returns the result of applying the appropriate function to the contained value.
     * @param `_else`, the function to call with the `err` value.
     *
     * @typeParam `U`, the type of `ok` from the function.
     * @typeParam `F`, the type of `err` from the function.
     *
     * @remarks This function can be used for control flow based on `Result` values.
     *
     * @see {@link or} for the eagerly evaluated version of this method.
     * @see {@link orElseAsync} for the asynchronous version of this method.
     * @see {@link andThen} to return `this` if `this` is `Err` or call a function if `this` is `Ok`.
     *
     * @example
     * ```ts
     * import { Result } from "./mod.ts";
     * import { assertEquals } from "@std/assert";
     *
     * const sq = (err: number): Result<number, number> => Result.ok(err ** 2);
     * const err = Result.err;
     *
     * const ok2 = Result.ok(2) as Result<number, number>;
     * assertEquals(ok2.orElse(sq).orElse(sq), Result.ok(2));
     * assertEquals(ok2.orElse(err).orElse(sq), Result.ok(2));
     *
     * const err3 = Result.err(3) as Result<number, number>;
     * assertEquals(err3.orElse(sq).orElse(err), Result.ok(9));
     * assertEquals(err3.orElse(err).orElse(err), Result.err(3));
     * ```
     */
    orElse<U, F>(_else: (err: E) => Result<U, F>): Result<T | U, F>;

    /**
     * Calls an asynchronous function with a parameter to the contained `err` value.
     *
     * @returns the result of applying the appropriate function to the contained value.
     * @param `_else`, the asynchronous function to call with the `err` value.
     *
     * @typeParam `U`, the `ok` type from the asynchronous function.
     * @typeParam `F`, the `err` type from the asynchronous function.
     *
     * @remarks This method can be used for control flow based on `Result` values.
     *
     * @see {@link orElse} for the synchronous version of this method.
     * @see {@link or} for the eagerly evaluated version of this method.
     * @see {@link andThenAsync} to return `this` if `this` is `Err` or call a function if `this` is `Ok`.
     *
     * @example
     * ```ts
     * import { Result } from "./mod.ts";
     * import { assertEquals } from "@std/assert";
     *
     * const sq = async (err: number) => Result.ok(err ** 2);
     *
     * const x = Result.ok(2) as Result<number, number>;
     * assertEquals(await x.orElseAsync(sq), Result.ok(2));
     *
     * const y = Result.err(3) as Result<number, number>;
     * assertEquals(await y.orElseAsync(sq), Result.ok(9));
     * ```
     */
    orElseAsync<U, F>(
      _else: (err: E) => Promise<Result<U, F>>,
    ): Promise<Result<U | T, F>>;

    /**
     * Transposes a `Result` of an `Option` into an `Option` of a `Result`.
     *
     * @returns a new `Result<T, E> | undefined` value where `T` is defined and non-null
     *
     * @example
     * ```ts
     * import { Result } from "./mod.ts";
     * import { assertEquals } from "@std/assert";
     *
     * const x = Result.ok(3);
     * assertEquals(x.transpose(), Result.ok(3));
     *
     * const y: Result.Ok<number | undefined> = Result.ok(undefined);
     * assertEquals(y.transpose(), undefined);
     *
     * const z: Result<number, string> = Result.err("error");
     * assertEquals(z.transpose(), Result.err("error"));
     * ```
     *
     * @privateRemarks
     *  - The input type could be required to be nullish
     *  - Alternatively, the result type could only be optional if the `ok` is nullish
     *  - The `NonNullable` could be more strict with just `| undefined` or less strict by checking for `falsy` values
     */
    transpose(): Result<NonNullable<T>, E> | undefined;

    /**
     * Converts from `Result<Result<U, F>, E>` to `Result<U, E | F>`
     *
     * @returns a new `Result<T, E>` value.
     *
     * @typeParam `U`, the type of the inner `ok` value.
     * @typeParam `F`, the type of the inner `err` value.
     *
     * ```ts
     * import { Result } from "./mod.ts";
     * import { assertEquals } from "@std/assert";
     *
     * const x = Result.ok(Result.ok(2));
     * assertEquals(x.flatten(), Result.ok(2));
     *
     * const y = Result.ok(Result.err("error"));
     * assertEquals(y.flatten(), Result.err("error"));
     *
     * const z= Result.err("error");
     * assertEquals(z.flatten(), Result.err("error"));
     * ```
     *
     * @privateRemarks This is method's return type allows combining different `err` types.
     *
     * @experimental Rust's `flatten` method is nightly-only
     */
    flatten<U, F>(this: Result<Result<U, F>, E>): Result<U, E | F>;

    /**
     * @returns a shallow clone of the `Result`.
     *
     * @example
     * ```ts
     * import { Result } from "./mod.ts";
     * import { assertEquals } from "@std/assert";
     *
     * const x = Result.ok("hello");
     * assertEquals(x.clone(), x);
     *
     * const y = Result.err("error");
     * assertEquals(y.clone(), y);
     * ```
     *
     * @privateRemarks This could have callbacks to clone the `ok` and `err` values.
     * Or, we could move this to a `Clone` trait with a method `Symbol`.
     */
    clone(): Result<T, E>;
  }
}

/** `Result` is a type that represents either success (`Ok`) or failure (`Err`). */
export type Result<T, E> = Result.Ok<T> | Result.Err<E>;
