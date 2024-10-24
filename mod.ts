// deno-lint-ignore no-empty-interface
interface Resultable {}

type innerOk<T> = { ok: T; err?: never };

type innerErr<E> = { ok?: never; err: E };

export type Ok<T> = innerOk<T> & Resultable;

export type Err<E> = innerErr<E> & Resultable;

export type Result<T, E> = Ok<T> | Err<E>;

export function ok<T>(value: T): Ok<T> {
  return { ok: value };
}

export function err<E>(error: E): Err<E> {
  return { err: error };
}
