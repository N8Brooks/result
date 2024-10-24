import { assertStrictEquals } from "jsr:@std/assert";
import { Err } from "./mod.ts";

Deno.test("is_ok", () => {
  const result = new Err(1);
  assertStrictEquals(result.is_ok(), false);
});

Deno.test("is_err", () => {
  const result = new Err(1);
  assertStrictEquals(result.is_err(), true);
});