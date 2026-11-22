import { describe, expect, it } from "vitest";
import { decode, encode } from "./index.ts";

const suites: Array<[number[], string]> = [
  [[0, 0, 0, 0], "AAAA"],
  [[0, 0, 16, 1], "AAgBC"],
  [[-1], "D"],
  [[-2147483648], "B"],
  [[2147483647], "+/////D"],
  [[-2147483647], "//////D"],
];

describe("tiny-vlq", () => {
  it("encodes single numbers and arrays", () => {
    expect(encode(0)).toBe("A");
    expect(encode(16)).toBe("gB");
    expect(encode(-1)).toBe("D");
    expect(encode(-2147483648)).toBe("B");
    expect(encode(2147483647)).toBe("+/////D");

    for (const [values, encoded] of suites) {
      expect(encode(values)).toBe(encoded);
    }
  });

  it("decodes VLQ strings into number arrays", () => {
    expect(decode("")).toEqual([]);

    for (const [values, encoded] of suites) {
      expect(decode(encoded)).toEqual(values);
    }
  });

  it("throws on invalid characters, truncated sequences, and 32-bit overflow", () => {
    expect(() => encode(1.5)).toThrow(RangeError);
    expect(() => encode(2147483648)).toThrow(RangeError);
    expect(() => encode(-2147483649)).toThrow(RangeError);

    expect(() => decode("!")).toThrow("Invalid character (!)");
    expect(() => decode("g")).toThrow("truncated input");
    expect(() => decode("//////E")).toThrow(RangeError);
  });
});
