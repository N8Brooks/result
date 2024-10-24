import { assertStrictEquals, assertThrows } from "jsr:@std/assert";
import { Err, Ok } from "./mod.ts";

Deno.test("isOk", () => {
  const result = new Ok(1);
  assertStrictEquals(result.isOk(), true);
});

Deno.test("isErr", () => {
  const result = new Ok(1);
  assertStrictEquals(result.isErr(), false);
});

Deno.test("unwrap", () => {
  const result = new Ok(1);
  assertStrictEquals(result.unwrap(), 1);
});

Deno.test("unwrapErr", () => {
  const result = new Ok(1);
  assertThrows(() => result.unwrapErr());
});

Deno.test("or", () => {
  const expected = new Ok(1);
  const error = new Err("b");
  const actual = expected.or(error);
  assertStrictEquals(actual, expected);
});
