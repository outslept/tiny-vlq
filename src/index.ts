export interface DecodeResult {
  value: number;
  offset: number;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const INT32_MIN = -0x80000000;
const INT32_MAX = 0x7fffffff;
const MAX_CODE = 0x100000001;
const MAX_DIGITS = 7;

const assertOffset = (offset: number): void => {
  if (!Number.isInteger(offset) || offset < 0) {
    throw new Error("vlq: offset must be a non-negative integer");
  }
};

const assertInt32 = (value: number): void => {
  if (!Number.isInteger(value) || value < INT32_MIN || value > INT32_MAX) {
    throw new Error("vlq: value must be a 32-bit integer");
  }
};

const digitOf = (code: number): number => {
  if (code >= 65 && code <= 90) return code - 65;
  if (code >= 97 && code <= 122) return code - 97 + 26;
  if (code >= 48 && code <= 57) return code - 48 + 52;
  if (code === 43) return 62;
  if (code === 47) return 63;
  return -1;
};

export function encode(value: number): string {
  assertInt32(value);
  const negative = value < 0 || Object.is(value, -0);
  let rest = negative ? -value * 2 + 1 : value * 2;
  let out = "";
  do {
    const digit = rest % 32;
    rest = Math.floor(rest / 32);
    out += ALPHABET.charAt(rest > 0 ? digit | 32 : digit);
  } while (rest > 0);
  return out;
}

export function encodeAll(values: readonly number[]): string {
  return values.map(encode).join("");
}

export function decode(input: string, offset = 0): DecodeResult {
  assertOffset(offset);
  let value = 0;
  let scale = 1;
  let i = offset;
  for (;;) {
    if (i >= input.length) {
      throw new Error("vlq: truncated input");
    }
    if (i - offset >= MAX_DIGITS) {
      throw new Error("vlq: value exceeds 32-bit range");
    }
    const digit = digitOf(input.charCodeAt(i));
    if (digit < 0) {
      throw new Error("vlq: invalid character");
    }
    i += 1;
    value += (digit & 31) * scale;
    if (value > MAX_CODE) {
      throw new Error("vlq: value exceeds 32-bit range");
    }
    if ((digit & 32) === 0) {
      const negative = value % 2 === 1;
      const magnitude = (value - (negative ? 1 : 0)) / 2;
      if (!negative && magnitude > INT32_MAX) {
        throw new Error("vlq: value exceeds 32-bit range");
      }
      return { value: negative ? -magnitude : magnitude, offset: i };
    }
    scale *= 32;
  }
}

export function decodeAll(input: string, offset = 0): number[] {
  assertOffset(offset);
  const values: number[] = [];
  let i = offset;
  while (i < input.length) {
    const result = decode(input, i);
    values.push(result.value);
    i = result.offset;
  }
  return values;
}
