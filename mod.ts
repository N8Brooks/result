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

  constructor(public readonly ok: NonOptional<T>) {}

  static from<T>(ok: NonOptional<T>): Ok<T> {
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

  isOkAnd(fn: (ok: T) => boolean): this is Ok<T> {
    return fn(this.ok);
  }

  isErr(): this is Err<never> {
    return false;
  }

  isErrAnd(): this is Err<never> {
    return false;
  }

  map<U>(fn: (ok: T) => NonOptional<U>): Ok<U> {
    return Ok.from(fn(this.ok));
  }

  async mapAsync<U>(fn: (ok: T) => Promise<NonOptional<U>>): Promise<Ok<U>> {
    return Ok.from(await fn(this.ok));
  }

  mapOr<U>(_or: U, fn: (ok: T) => U): U {
    return fn(this.ok);
  }

  mapOrElse<U>(_orElse: (err: never) => U, fn: (ok: T) => U): U {
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

  andThen<R2 extends Result<unknown, unknown>>(fn: (ok: T) => R2): R2 {
    return fn(this.ok);
  }

  andThenAsync<R2 extends Result<unknown, unknown>>(
    fn: (ok: T) => Promise<R2>,
  ): Promise<R2> {
    return fn(this.ok);
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

type InnerOk<T> = Readonly<{ ok: NonOptional<T>; err?: never }>;

/** Contains the error value of a `Result`. */
export class Err<E> implements InnerErr<E>, Resultable<never, E> {
  readonly ok!: never;

  constructor(public readonly err: NonOptional<E>) {}

  static from<E>(err: NonOptional<E>): Err<E> {
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

  isErrAnd(fn: (err: E) => boolean): this is Err<E> {
    return fn(this.err);
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

  mapOrElse<U>(orElse: (err: E) => U): U {
    return orElse(this.err);
  }

  mapErr<F>(fn: (err: E) => NonOptional<F>): Err<F> {
    return Err.from(fn(this.err));
  }

  async mapErrAsync<F>(
    fn: (err: E) => Promise<NonOptional<F>>,
  ): Promise<Err<F>> {
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

  orElse<R2 extends Result<unknown, unknown>>(fn: (err: E) => R2): R2 {
    return fn(this.err);
  }

  orElseAsync<R2 extends Result<unknown, unknown>>(
    fn: (err: E) => Promise<R2>,
  ): Promise<R2> {
    return fn(this.err);
  }

  unwrapOr<T>(or: T): T {
    return or;
  }

  unwrapOrElse<T>(fn: (err: E) => T): T {
    return fn(this.err);
  }

  transpose(): Ok<E> {
    return Ok.from(this.err);
  }

  clone(): Err<E> {
    return Err.from(this.err);
  }
}

type InnerErr<E> = Readonly<{ ok?: never; err: NonOptional<E> }>;

interface Resultable<T, E> {
  [Symbol.iterator](): IterableIterator<T | never>;
  isOk(): this is Ok<T>;
  isOkAnd(fn: (ok: T) => boolean): this is Ok<T>;
  isErr(): this is Err<E>;
  isErrAnd(fn: (err: E) => boolean): this is Err<E>;
  map<U>(fn: (ok: T) => NonOptional<U>): Result<U, E>;
  mapAsync<U>(fn: (ok: T) => Promise<NonOptional<U>>): Promise<Result<U, E>>;
  mapOr<U>(or: U, fn: (ok: T) => U): U;
  mapOrElse<U>(orElse: (err: E) => U, fn: (ok: T) => U): U;
  mapErr<F>(fn: (err: E) => NonOptional<F>): Result<T, F>;
  mapErrAsync<F>(
    fn: (err: E) => Promise<NonOptional<F>>,
  ): Promise<Result<T, F>>;
  inspect(fn: (ok: T) => void): this;
  inspectAsync(fn: (ok: T) => Promise<void>): Promise<this>;
  inspectErr(fn: (err: E) => void): this;
  inspectErrAsync(fn: (err: E) => Promise<void>): Promise<this>;
  expect(msg: string): T | never;
  unwrap(): T | never;
  expectErr(msg: string): E | never;
  unwrapErr(): E | never;
  and<R2 extends Result<unknown, unknown>>(res: R2): R2 | Err<E>;
  andThen<R2 extends Result<unknown, unknown>>(fn: (ok: T) => R2): R2 | Err<E>;
  andThenAsync<R2 extends Result<unknown, unknown>>(
    fn: (ok: T) => Promise<R2>,
  ): Promise<R2 | Err<E>>;
  or<R2 extends Result<unknown, unknown>>(res: R2): Ok<T> | R2;
  orElse<R2 extends Result<unknown, unknown>>(fn: (err: E) => R2): Ok<T> | R2;
  orElseAsync<R2 extends Result<unknown, unknown>>(
    fn: (err: E) => Promise<R2>,
  ): Promise<Ok<T> | R2>;
  unwrapOr(or: T): T;
  unwrapOrElse(fn: (err: E) => T): T;
  transpose(): Result<E, T>;
  clone(): Result<T, E>;
}

export type NonOptional<T> = T extends undefined ? never : T;
