import { assertStrictEquals, assertThrows } from "jsr:@std/assert";
import { Err } from "./mod.ts";

Deno.test("isOk", () => {
  const result = new Err(1);
  assertStrictEquals(result.isOk(), false);
});

Deno.test("isErr", () => {
  const result = new Err(1);
  assertStrictEquals(result.isErr(), true);
});

Deno.test("unwrap", () => {
  const result = new Err(1);
  assertThrows(() => {
    result.unwrap();
  });
});
