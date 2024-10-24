import { assertStrictEquals } from "jsr:@std/assert";
import { Ok } from "./mod.ts";

Deno.test("is_ok", () => {
  const result = new Ok(1);
  assertStrictEquals(result.is_ok(), true);
});

Deno.test("is_err", () => {
  const result = new Ok(1);
  assertStrictEquals(result.is_err(), false);
});

Deno.test("unwrap", () => {
  const result = new Ok(1);
  assertStrictEquals(result.unwrap(), 1);
});
