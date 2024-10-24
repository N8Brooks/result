import { describe, it } from "@std/testing/bdd";
import { assertEquals, assertStrictEquals, assertThrows } from "@std/assert";
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

describe("isOkAnd", () => {
  [
    { name: "ok and 1 equals 1", result: Ok.from(1), expected: true },
    { name: "ok and 2 equals 1", result: Ok.from(2), expected: false },
    { name: "err and 1 equals 1", result: Err.from(1), expected: false },
    { name: "err and 2 equals 1", result: Err.from(2), expected: false },
  ].forEach(({ name, result, expected }) => {
    it(name, () => {
      const actual = result.isOkAnd((value) => value === 1);
      assertStrictEquals(actual, expected);
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

describe("isErrAnd", () => {
  [
    { name: "ok and 1 equals 1", result: Ok.from(1), expected: false },
    { name: "ok and 2 equals 1", result: Ok.from(2), expected: false },
    { name: "err and 1 equals 1", result: Err.from(1), expected: true },
    { name: "err and 2 equals 1", result: Err.from(2), expected: false },
  ].forEach(({ name, result, expected }) => {
    it(name, () => {
      const actual = result.isErrAnd((value) => value === 1);
      assertStrictEquals(actual, expected);
    });
  });
});

describe("map", () => {
  [
    { name: "ok", result: Ok.from(1), expected: Ok.from(2) },
    { name: "err", result: Err.from(1), expected: Err.from(1) },
  ].forEach(({ name, result, expected }) => {
    it(name, () => {
      const actual = result.map((value) => value + 1);
      assertEquals(actual, expected);
    });
  });
});

describe("mapAsync", () => {
  [
    { name: "ok", result: Ok.from(1), expected: Ok.from(2) },
    { name: "err", result: Err.from(1), expected: Err.from(1) },
  ].forEach(({ name, result, expected }) => {
    it(name, async () => {
      const actual = await result.mapAsync((value) =>
        Promise.resolve(value + 1)
      );
      assertEquals(actual, expected);
    });
  });
});

describe("mapOr", () => {
  [
    { name: "ok", result: Ok.from(1), expected: 2 },
    { name: "err", result: Err.from(1), expected: 3 },
  ].forEach(({ name, result, expected }) => {
    it(name, () => {
      const actual = result.mapOr((value) => value + 1, 3);
      assertStrictEquals(actual, expected);
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
