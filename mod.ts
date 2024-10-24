export type NonOptional<T> = T extends undefined ? never : T;

interface Resultable<T, E> {
  is_ok(): this is Ok<T>;
  is_err(): this is Err<E>;
}

export type InnerOk<T> = { ok: NonOptional<T>; err?: never };

export type InnerErr<E> = { ok?: never; err: NonOptional<E> };

export type InnerResult<T, E> = Ok<T> | Err<E>;

export type Result<T, E> = InnerResult<T, E> & Resultable<T, E>;

export class Ok<T> implements InnerOk<T>, Resultable<T, never> {
  err!: never;

  constructor(public ok: NonOptional<T>) {}

  is_ok(): this is Ok<T> {
    return true;
  }

  is_err<E>(): this is Err<E> {
    return false;
  }
}

export function ok<T>(value: NonOptional<T>): Ok<T> {
  return new Ok(value);
}

export class Err<E> implements InnerErr<E>, Resultable<never, E> {
  ok!: never;

  constructor(public err: NonOptional<E>) {}

  is_ok<T>(): this is Ok<T> {
    return false;
  }

  is_err(): this is Err<E> {
    return true;
  }
}

export function err<E>(value: NonOptional<E>): Err<E> {
  return new Err(value);
}
