import { assertStrictEquals, assertThrows } from "jsr:@std/assert";
import { Err, Ok } from "./mod.ts";

Deno.test("isOk", () => {
  const result = Ok.from(1);
  assertStrictEquals(result.isOk(), true);
});

Deno.test("isErr", () => {
  const result = Ok.from(1);
  assertStrictEquals(result.isErr(), false);
});

Deno.test("unwrap", () => {
  const result = Ok.from(1);
  assertStrictEquals(result.unwrap(), 1);
});

Deno.test("unwrapErr", () => {
  const result = Ok.from(1);
  assertThrows(() => result.unwrapErr());
});

Deno.test("or", () => {
  const expected = Ok.from(1);
  const error = Err.from("a");
  const actual = expected.or(error);
  assertStrictEquals(actual, expected);
});
