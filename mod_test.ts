import { describe, it } from "@std/testing/bdd";
import { assertStrictEquals, assertThrows } from "@std/assert";
import { Err, Ok } from "./mod.ts";

describe("isOk", () => {
  [
    { name: "ok", result: Ok.from(1), isOk: true },
    { name: "err", result: Err.from(1), isOk: false },
  ].forEach(({ name, result, isOk }) => {
    it(name, () => {
      assertStrictEquals(result.isOk(), isOk);
    });
  });
});

describe("isErr", () => {
  [
    { name: "ok", result: Ok.from(1), isErr: false },
    { name: "err", result: Err.from(1), isErr: true },
  ].forEach(({ name, result, isErr }) => {
    it(name, () => {
      assertStrictEquals(result.isErr(), isErr);
    });
  });
});

describe("unwrap", () => {
  it("ok", () => {
    const ok = Ok.from(1);
    assertStrictEquals(ok.unwrap(), 1);
  });

  it("err", () => {
    const err = Err.from(1);
    assertThrows(() => err.unwrap());
  });
});

describe("unwrapErr", () => {
  it("ok", () => {
    const ok = Ok.from(1);
    assertThrows(() => ok.unwrapErr());
  });

  it("err", () => {
    const err = Err.from(1);
    assertStrictEquals(err.unwrapErr(), 1);
  });
});

describe("and", () => {
  [
    { name: "ok ok", a: Ok.from(1), b: Ok.from(2), key: "b" },
    { name: "ok err", a: Ok.from(1), b: Err.from("b"), key: "b" },
    { name: "err ok", a: Err.from("a"), b: Ok.from(2), key: "a" },
    { name: "err err", a: Err.from("a"), b: Err.from("b"), key: "a" },
  ].forEach(({ name, a, b, key }) => {
    it(name, () => {
      const actual = a.and(b);
      const expected = key === "a" ? a : b;
      assertStrictEquals(actual, expected);
    });
  });
});

describe("or", () => {
  [
    { name: "ok ok", a: Ok.from(1), b: Ok.from(2), key: "a" },
    { name: "ok err", a: Ok.from(1), b: Err.from("b"), key: "a" },
    { name: "err ok", a: Err.from("a"), b: Ok.from(2), key: "b" },
    { name: "err err", a: Err.from("a"), b: Err.from("b"), key: "b" },
  ].forEach(({ name, a, b, key }) => {
    it(name, () => {
      const actual = a.or(b);
      const expected = key === "a" ? a : b;
      assertStrictEquals(actual, expected);
    });
  });
});
