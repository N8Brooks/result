export type NonOptional<T> = T extends undefined ? never : T;

export type InnerOk<T> = { ok: NonOptional<T>; err?: never };

export type InnerErr<E> = { ok?: never; err: NonOptional<E> };

export type InnerResult<T, E> = InnerOk<T> | InnerErr<E>;

export interface Resultable<T, E> {
  isOk(): this is Ok<T>;
  isOkAnd(fn: (valud: T) => boolean): this is Ok<T>;
  isErr(): this is Err<E>;
  isErrAnd(fn: (value: E) => boolean): this is Err<E>;
  map<U>(fn: (value: T) => NonOptional<U>): Result<U, E>;
  mapAsync<U>(fn: (value: T) => Promise<NonOptional<U>>): Promise<Result<U, E>>;
  mapOr<U>(default_: U, fn: (value: T) => U): U;
  mapOrElse<U>(default_: (value: E) => U, fn: (value: T) => U): U;
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

  isOk(): this is Ok<T> {
    return true;
  }

  isOkAnd(fn: (value: T) => boolean): this is Ok<T> {
    return fn(this.ok);
  }

  isErr<E>(): this is Err<E> {
    return false;
  }

  isErrAnd<E>(_fn: (value: E) => boolean): this is Err<E> {
    return false;
  }

  map<U>(fn: (value: T) => NonOptional<U>): Ok<U> {
    return Ok.from(fn(this.ok));
  }

  async mapAsync<U>(fn: (value: T) => Promise<NonOptional<U>>): Promise<Ok<U>> {
    return Ok.from(await fn(this.ok));
  }

  mapOr<U>(_default: U, fn: (value: T) => U): U {
    return fn(this.ok);
  }

  mapOrElse<U>(_default: (value: never) => U, fn: (value: T) => U): U {
    return fn(this.ok);
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

  or<E>(_res: Result<T, E>): this {
    return this;
  }
}

export class Err<E> implements InnerErr<E>, Resultable<never, E> {
  ok!: never;

  constructor(public err: NonOptional<E>) {}

  static from<E>(err: NonOptional<E>): Err<E> {
    return new Err(err);
  }

  isOk<T>(): this is Ok<T> {
    return false;
  }

  isOkAnd<T>(_fn: (value: T) => boolean): this is Ok<T> {
    return false;
  }

  isErr(): this is Err<E> {
    return true;
  }

  isErrAnd(fn: (value: E) => boolean): this is Err<E> {
    return fn(this.err);
  }

  map<U>(_fn: (value: never) => NonOptional<U>): this {
    return this;
  }

  mapAsync(): Promise<this> {
    return Promise.resolve(this); // Promise.resolve is unecessary, but fixes the type
  }

  mapOr<U>(default_: U, _fn: (value: never) => U): U {
    return default_;
  }

  mapOrElse<U>(default_: (value: E) => U, _fn: (value: never) => U): U {
    return default_(this.err);
  }

  unwrap(): never {
    throw new Error("unwrap called on an Err value");
  }

  unwrapErr(): E {
    return this.err;
  }

  and<T>(_res: Result<T, E>): this {
    return this;
  }

  or<T>(res: Result<T, E>): Result<T, E> {
    return res;
  }
}

export type Result<T, E> = Ok<T> | Err<E>;
