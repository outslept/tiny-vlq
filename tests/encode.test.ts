import { assert, describe, it } from "vite-plus/test";
import { encodeAll } from "../src/index.js";

describe("vlq.encode", () => {
  const tests: [readonly number[], string][] = [
    [[0, 0, 0, 0], "AAAA"],
    [[0, 0, 16, 1], "AAgBC"],
    [[-1], "D"],
    [[-2147483648], "B"],
    [[2147483647], "+/////D"],
  ];

  tests.forEach(function (test) {
    it(`${JSON.stringify(test[0])} -> ${test[1]}`, () => {
      assert.equal(encodeAll(test[0]), test[1]);
    });
  });
});
