import { assertFails, assertStrictEquals } from "jsr:@std/assert";
import { Ok } from "./mod.ts";

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
  assertStrictEquals(result.unwrapErr(), 1);
});
