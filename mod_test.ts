import { describe, it } from "@std/testing/bdd";
import {
  assertEquals,
  assertStrictEquals,
  assertThrows,
  unreachable,
} from "@std/assert";
import { Err, fromIter, Ok, Result } from "./mod.ts";

describe("iter", () => {
  [
    { name: "ok", result: Ok.from(1), expected: [1] },
    { name: "err", result: Err.from(1), expected: [] },
  ].forEach(({ name, result, expected }) => {
    it(`${name} iterator`, () => {
      const actual = [...result];
      assertEquals(actual, expected);
    });

    it(`${name} iterator iterable`, () => {
      const it = result[Symbol.iterator]();
      const actual = [...it];
      assertEquals(actual, expected);
    });
  });
});

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

  it("type guard", () => {
    const res: Ok<number | bigint> = Ok.from(1);
    if (res.isOkAnd((x) => typeof x === "number")) {
      assertStrictEquals(res.ok + 0, 1);
    } else {
      unreachable();
    }
  });

  it("non-type guard", () => {
    const res: Ok<number | bigint> = Ok.from(1);
    if (res.isOkAnd((_x) => true)) {
      if (typeof res.ok === "number") {
        assertStrictEquals(res.ok + 0, 1);
      } else {
        unreachable();
      }
    } else {
      unreachable();
    }
  });
});

describe("isOkAndAsync", () => {
  [
    { name: "ok and 1 equals 1", result: Ok.from(1), expected: true },
    { name: "ok and 2 equals 1", result: Ok.from(2), expected: false },
    { name: "err and 1 equals 1", result: Err.from(1), expected: false },
    { name: "err and 2 equals 1", result: Err.from(2), expected: false },
  ].forEach(({ name, result, expected }) => {
    it(name, async () => {
      const actual = await result.isOkAndAsync((value) =>
        Promise.resolve(value === 1)
      );
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

  it("type guard", () => {
    const res: Err<number | bigint> = Err.from(1);
    if (res.isErrAnd((x) => typeof x === "number")) {
      assertStrictEquals(res.err + 0, 1);
    } else {
      unreachable();
    }
  });

  it("non-type guard", () => {
    const res: Err<number | bigint> = Err.from(1);
    if (res.isErrAnd((_x) => true)) {
      if (typeof res.err === "number") {
        assertStrictEquals(res.err + 0, 1);
      } else {
        unreachable();
      }
    } else {
      unreachable();
    }
  });
});

describe("isErrAndAsync", () => {
  [
    { name: "ok and 1 equals 1", result: Ok.from(1), expected: false },
    { name: "ok and 2 equals 1", result: Ok.from(2), expected: false },
    { name: "err and 1 equals 1", result: Err.from(1), expected: true },
    { name: "err and 2 equals 1", result: Err.from(2), expected: false },
  ].forEach(({ name, result, expected }) => {
    it(name, async () => {
      const actual = await result.isErrAndAsync((value) =>
        Promise.resolve(value === 1)
      );
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
      const actual = result.mapOr(3, (value) => value + 1);
      assertStrictEquals(actual, expected);
    });
  });
});

describe("mapOrElse", () => {
  [
    { name: "ok", result: Ok.from(1), expected: 2 },
    { name: "err", result: Err.from(1), expected: 3 },
  ].forEach(({ name, result, expected }) => {
    it(name, () => {
      const actual = result.mapOrElse(() => 3, () => 2);
      assertStrictEquals(actual, expected);
    });
  });
});

describe("mapOrElseAsync", () => {
  [
    { name: "ok", result: Ok.from(1), expected: 2 },
    { name: "err", result: Err.from(1), expected: 3 },
  ].forEach(({ name, result, expected }) => {
    it(name, async () => {
      const actual = await result.mapOrElse(
        () => Promise.resolve(3),
        () => Promise.resolve(2),
      );
      assertStrictEquals(actual, expected);
    });
  });
});

describe("mapErr", () => {
  [
    { name: "ok", result: Ok.from(1), expected: Ok.from(1) },
    { name: "err", result: Err.from(1), expected: Err.from(2) },
  ].forEach(({ name, result, expected }) => {
    it(name, () => {
      const actual = result.mapErr(() => 2);
      assertEquals(actual, expected);
    });
  });
});

describe("mapErrAsync", () => {
  [
    { name: "ok", result: Ok.from(1), expected: Ok.from(1) },
    { name: "err", result: Err.from(1), expected: Err.from(2) },
  ].forEach(({ name, result, expected }) => {
    it(name, async () => {
      const actual = await result.mapErrAsync(() => Promise.resolve(2));
      assertEquals(actual, expected);
    });
  });
});

describe("inspect", () => {
  [
    { name: "ok", result: Ok.from(1), expected: 1 },
    { name: "err", result: Err.from(1), expected: 0 },
  ].forEach(({ name, result, expected }) => {
    it(name, () => {
      let actual = 0;
      result.inspect((value) => {
        actual = value;
      });
      assertStrictEquals(actual, expected);
    });
  });
});

describe("inpsectAsync", () => {
  [
    { name: "ok", result: Ok.from(1), expected: 1 },
    { name: "err", result: Err.from(1), expected: 0 },
  ].forEach(({ name, result, expected }) => {
    it(name, async () => {
      let actual = 0;
      await result.inspectAsync((value) => {
        actual = value;
        return Promise.resolve();
      });
      assertStrictEquals(actual, expected);
    });
  });
});

describe("inspectErr", () => {
  [
    { name: "ok", result: Ok.from(1), expected: 0 },
    { name: "err", result: Err.from(1), expected: 1 },
  ].forEach(({ name, result, expected }) => {
    it(name, () => {
      let actual = 0;
      result.inspectErr(() => {
        actual = 1;
      });
      assertStrictEquals(actual, expected);
    });
  });
});

describe("inspectErrAsync", () => {
  [
    { name: "ok", result: Ok.from(1), expected: 0 },
    { name: "err", result: Err.from(1), expected: 1 },
  ].forEach(({ name, result, expected }) => {
    it(name, async () => {
      let actual = 0;
      await result.inspectErrAsync(() => {
        actual = 1;
        return Promise.resolve();
      });
      assertStrictEquals(actual, expected);
    });
  });
});

describe("expect", () => {
  it("ok", () => {
    const ok = Ok.from(1) as Result<number, never>;
    assertStrictEquals(ok.expect("message"), 1);
  });

  it("err", () => {
    const err = Err.from(1);
    const message = "message";
    const error = assertThrows(() => err.expect(message));
    const actual = error instanceof Error ? error.message : undefined;
    const expected = `${message}: expect called on an Err value`;
    assertStrictEquals(actual, expected);
  });
});

describe("unwrap", () => {
  it("ok", () => {
    const ok = Ok.from(1);
    assertStrictEquals(ok.unwrap(), 1);
  });

  it("err", () => {
    const err = Err.from(1);
    const error = assertThrows(() => err.unwrap());
    const actual = error instanceof Error ? error.message : undefined;
    const expected = "unwrap called on an Err value";
    assertStrictEquals(actual, expected);
  });
});

describe("expectErr", () => {
  it("ok", () => {
    const ok = Ok.from(1);
    const message = "message";
    const error = assertThrows(() => ok.expectErr(message));
    const actual = error instanceof Error ? error.message : undefined;
    const expected = `${message}: expectErr called on an Ok value`;
    assertStrictEquals(actual, expected);
  });

  it("err", () => {
    const err = Err.from(1) as Result<never, number>;
    assertStrictEquals(err.expectErr("message"), 1);
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

describe("andThen", () => {
  [
    { name: "ok ok", a: Ok.from(1), b: Ok.from("b"), key: "b" },
    { name: "ok err", a: Ok.from(1), b: Err.from(2), key: "b" },
    { name: "err ok", a: Err.from(1), b: Ok.from("b"), key: "a" },
    { name: "err err", a: Err.from(1), b: Err.from(2), key: "a" },
  ].forEach(({ name, a, b, key }) => {
    it(name, () => {
      const actual = a.andThen((_a) => b);
      const expected = key === "a" ? a : b;
      assertStrictEquals(actual, expected);
    });
  });
});

describe("andThenAsync", () => {
  [
    { name: "ok ok", a: Ok.from(1), b: Ok.from("b"), key: "b" },
    { name: "ok err", a: Ok.from(1), b: Err.from(2), key: "b" },
    { name: "err ok", a: Err.from(1), b: Ok.from("b"), key: "a" },
    { name: "err err", a: Err.from(1), b: Err.from(2), key: "a" },
  ].forEach(({ name, a, b, key }) => {
    it(name, async () => {
      const actual = await a.andThenAsync((_a) => Promise.resolve(b));
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

describe("orElse", () => {
  [
    { name: "ok ok", a: Ok.from(1), b: Ok.from(2), key: "a" },
    { name: "ok err", a: Ok.from(1), b: Err.from("b"), key: "a" },
    { name: "err ok", a: Err.from(1), b: Ok.from(2), key: "b" },
    { name: "err err", a: Err.from(1), b: Err.from("b"), key: "b" },
  ].forEach(({ name, a, b, key }) => {
    it(name, () => {
      const actual = a.orElse((_a) => b);
      const expected = key === "a" ? a : b;
      assertStrictEquals(actual, expected);
    });
  });
});

describe("orElseAsync", () => {
  [
    { name: "ok ok", a: Ok.from(1), b: Ok.from(2), key: "a" },
    { name: "ok err", a: Ok.from(1), b: Err.from("b"), key: "a" },
    { name: "err ok", a: Err.from(1), b: Ok.from(2), key: "b" },
    { name: "err err", a: Err.from(1), b: Err.from("b"), key: "b" },
  ].forEach(({ name, a, b, key }) => {
    it(name, async () => {
      const actual = await a.orElseAsync((_a) => Promise.resolve(b));
      const expected = key === "a" ? a : b;
      assertStrictEquals(actual, expected);
    });
  });
});

// TODO: move by unwrap group
describe("unwrapOr", () => {
  [
    { name: "ok", result: Ok.from(1), expected: 1 },
    { name: "err", result: Err.from(1), expected: 2 },
  ].forEach(({ name, result, expected }) => {
    it(name, () => {
      const actual = result.unwrapOr(2);
      assertStrictEquals(actual, expected);
    });
  });
});

describe("unwrapOrElse", () => {
  [
    { name: "ok", result: Ok.from(1), expected: 1 },
    { name: "err", result: Err.from(1), expected: 2 },
  ].forEach(({ name, result, expected }) => {
    it(name, () => {
      const actual = result.unwrapOrElse((err) => err + 1);
      assertStrictEquals(actual, expected);
    });
  });
});

describe("transpose", () => {
  [
    { name: "ok number", result: Ok.from(1), expected: Ok.from(1) },
    { name: "ok undefined", result: Ok.from(undefined), expected: undefined },
    { name: "ok null", result: Ok.from(null), expected: undefined },
    { name: "err", result: Err.from("error"), expected: Err.from("error") },
  ].forEach(({ name, result, expected }) => {
    it(name, () => {
      const actual = result.transpose();
      assertEquals(actual, expected);
    });
  });
});

describe("flatten", () => {
  [
    { name: "ok ok", result: Ok.from(Ok.from(1)), expected: Ok.from(1) },
    {
      name: "ok err",
      result: Ok.from(Err.from("error")),
      expected: Err.from("error"),
    },
    {
      name: "err",
      result: Err.from("error"),
      expected: Err.from("error"),
    },
  ].forEach(
    ({ name, result, expected }) => {
      it(name, () => {
        const actual = result.flatten();
        assertEquals(actual, expected);
      });
    },
  );
});

describe("clone", () => {
  [
    { name: "ok", expected: Ok.from(1) },
    { name: "err", expected: Err.from(1) },
  ].forEach(({ name, expected }) => {
    it(name, () => {
      const actual = expected.clone();
      assertEquals(actual, expected);
    });
  });
});

// TODO: move to top
describe("fromIter", () => {
  [
    { name: "ok empty", results: [], expected: Ok.from([]) },
    {
      name: "ok",
      results: [Ok.from(1), Ok.from(2)],
      expected: Ok.from([1, 2]),
    },
    { name: "err", results: [Ok.from(1), Err.from(2)], expected: Err.from(2) },
    {
      name: "first err",
      results: [Err.from(1), Ok.from(2)],
      expected: Err.from(1),
    },
  ].forEach(({ name, results, expected }) => {
    it(name, () => {
      const actual = fromIter(results);
      assertEquals(actual, expected);
    });
  });
});
