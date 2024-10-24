export type NonOptional<T> = T extends undefined ? never : T;

export type InnerOk<T> = { ok: NonOptional<T>; err?: never };

export type InnerErr<E> = { ok?: never; err: NonOptional<E> };

export type InnerResult<T, E> = InnerOk<T> | InnerErr<E>;

export interface Resultable<T, E> {
  isOk(): this is Ok<T>;
  isErr(): this is Err<E>;
  unwrap(): T | never;
  unwrapErr(): E | never;
  or(res: Result<T, E>): Result<T, E>;
}

export type Result<T, E> = InnerResult<T, E> & Resultable<T, E>;

export class Ok<T> implements InnerOk<T>, Resultable<T, never> {
  err!: never;

  constructor(public ok: NonOptional<T>) {}

  static from<T>(ok: NonOptional<T>): Ok<T> {
    return new Ok(ok);
  }

  isOk(): this is Ok<T> {
    return true;
  }

  isErr<E>(): this is Err<E> {
    return false;
  }

  unwrap(): T {
    return this.ok;
  }

  unwrapErr(): never {
    throw new Error("unwrapErr called on an Ok value");
  }

  or<E>(_res: Result<T, E>): Ok<T> {
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

  isErr(): this is Err<E> {
    return true;
  }

  unwrap(): never {
    throw new Error("unwrap called on an Err value");
  }

  unwrapErr(): E {
    return this.err;
  }

  or<T>(res: Result<T, E>): Result<T, E> {
    return res;
  }
}
