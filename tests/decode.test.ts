import { assert, describe, it } from "vite-plus/test";
import { decodeAll } from "../src/index.js";

describe("vlq.decode", () => {
  const tests: [string, number[]][] = [
    ["AAAA", [0, 0, 0, 0]],
    ["AAgBC", [0, 0, 16, 1]],
    ["D", [-1]],
    ["B", [-2147483648]],
    ["+/////D", [2147483647]],
  ];

  tests.forEach(function (test) {
    it(`${test[0]} -> ${JSON.stringify(test[1])}`, () => {
      assert.deepEqual(decodeAll(test[0]), test[1]);
    });
  });
});
