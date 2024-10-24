export type NonOptional<T> = T extends undefined ? never : T;

export type InnerOk<T> = { ok: NonOptional<T>; err?: never };

export type InnerErr<E> = { ok?: never; err: NonOptional<E> };

export type InnerResult<T, E> = InnerOk<T> | InnerErr<E>;

export interface Resultable<T, E> {
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
  inspect(fn: (ok: T) => void): this;
  inspectErr(fn: (err: E) => void): this;
  expect(msg: string): T | never;
  unwrap(): T | never;
  expectErr(msg: string): E | never;
  unwrapErr(): E | never;
  and(res: Result<T, E>): Result<T, E>;
  andThen<U>(fn: (ok: T) => Result<U, E>): Result<U, E>;
  or(res: Result<T, E>): Result<T, E>;
  orElse<F>(fn: (err: E) => Result<T, F>): Result<T, F>;
}

export class Ok<T> implements InnerOk<T>, Resultable<T, never> {
  err!: never;

  constructor(public ok: NonOptional<T>) {}

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

  isOk(): this is this {
    return true;
  }

  isOkAnd(fn: (ok: T) => boolean): this is this {
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

  inspect(fn: (ok: T) => void): this {
    fn(this.ok);
    return this;
  }

  inspectErr(): this {
    return this;
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

  and<E>(res: Result<T, E>): Result<T, E> {
    return res;
  }

  andThen<U, E>(fn: (ok: T) => Result<U, E>): Result<U, E> {
    return fn(this.ok);
  }

  or(): this {
    return this;
  }

  orElse(): this {
    return this;
  }
}

export class Err<E> implements InnerErr<E>, Resultable<never, E> {
  ok!: never;

  constructor(public err: NonOptional<E>) {}

  static from<E>(err: NonOptional<E>): Err<E> {
    return new Err(err);
  }

  [Symbol.iterator](): IterableIterator<never> {
    return {
      next: () => {
        return { value: undefined, done: true };
      },
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
    return Promise.resolve(this); // Promise.resolve is unecessary, but fixes the type
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

  inspect(): this {
    return this;
  }

  inspectErr(fn: (err: E) => void): this {
    fn(this.err);
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

  or<T>(res: Result<T, E>): Result<T, E> {
    return res;
  }

  orElse<T, F>(fn: (err: E) => Result<T, F>): Result<T, F> {
    return fn(this.err);
  }
}

export type Result<T, E> = Ok<T> | Err<E>;
