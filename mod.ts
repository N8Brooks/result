export type NonOptional<T> = T extends undefined ? never : T;

export type InnerOk<T> = { ok: NonOptional<T>; err?: never };

export type InnerErr<E> = { ok?: never; err: NonOptional<E> };

export type InnerResult<T, E> = InnerOk<T> | InnerErr<E>;

export interface Resultable<T, E> {
  isOk(): this is Ok<T>;
  isOkAnd(fn: (ok: T) => boolean): this is Ok<T>;
  isErr(): this is Err<E>;
  isErrAnd(fn: (err: E) => boolean): this is Err<E>;
  map<U>(fn: (ok: T) => NonOptional<U>): Result<U, E>;
  mapAsync<U>(fn: (ok: T) => Promise<NonOptional<U>>): Promise<Result<U, E>>;
  mapOr<U>(or: U, fn: (ok: T) => U): U;
  mapOrElse<U>(orElse: (err: E) => U, fn: (ok: T) => U): U;
  mapErr<F>(fn: (err: E) => NonOptional<F>): Result<T, F>;
  unwrap(): T | never;
  unwrapErr(): E | never;
  and(res: Result<T, E>): Result<T, E>;
  or(res: Result<T, E>): Result<T, E>;
}

export class Ok<T> implements InnerOk<T>, Resultable<T, never> {
  err!: never;

  constructor(public ok: NonOptional<T>) {}

  static from<T>(ok: NonOptional<T>): Ok<T> {
    return new Ok(ok);
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

  unwrap(): T {
    return this.ok;
  }

  unwrapErr(): never {
    throw new Error("unwrapErr called on an Ok value");
  }

  and<E>(res: Result<T, E>): Result<T, E> {
    return res;
  }

  or(): this {
    return this;
  }
}

export class Err<E> implements InnerErr<E>, Resultable<never, E> {
  ok!: never;

  constructor(public err: NonOptional<E>) {}

  static from<E>(err: NonOptional<E>): Err<E> {
    return new Err(err);
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

  unwrap(): never {
    throw new Error("unwrap called on an Err value");
  }

  unwrapErr(): E {
    return this.err;
  }

  and(): this {
    return this;
  }

  or<T>(res: Result<T, E>): Result<T, E> {
    return res;
  }
}

export type Result<T, E> = Ok<T> | Err<E>;
