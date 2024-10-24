import { assertStrictEquals, assertThrows } from "jsr:@std/assert";
import { Err, Ok } from "./mod.ts";

Deno.test("isOk", () => {
  const result = Err.from(1);
  assertStrictEquals(result.isOk(), false);
});

Deno.test("isErr", () => {
  const result = Err.from(1);
  assertStrictEquals(result.isErr(), true);
});

Deno.test("unwrap", () => {
  const result = Err.from(1);
  assertThrows(() => result.unwrap());
});

Deno.test("unwrapErr", () => {
  const result = Err.from(1);
  assertStrictEquals(result.unwrapErr(), 1);
});

Deno.test("or", () => {
  const error = Err.from("a");
  const expected = new Ok(1);
  const actual = error.or(expected);
  assertStrictEquals(actual, expected);
});
