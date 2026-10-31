const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const INT32_MIN = -0x80000000;
const INT32_MAX = 0x7fffffff;
const TWO_POW_32 = 0x100000000;

const digitOf = (code: number): number => {
  if (code >= 65 && code <= 90) return code - 65;
  if (code >= 97 && code <= 122) return code - 71;
  if (code >= 48 && code <= 57) return code + 4;
  if (code === 43) return 62;
  if (code === 47) return 63;
  return -1;
};

export function encode(value: number): string {
  if (!Number.isInteger(value) || value < INT32_MIN || value > INT32_MAX) {
    throw new Error("vlq: value must be a 32-bit integer");
  }
  let rest = value < 0 ? -value * 2 + 1 : value * 2;
  if (rest > 0xffffffff) rest -= TWO_POW_32;
  let out = "";
  do {
    const digit = rest % 32;
    rest = (rest - digit) / 32;
    out += ALPHABET.charAt(rest > 0 ? digit | 32 : digit);
  } while (rest > 0);
  return out;
}

export function encodeAll(values: readonly number[]): string {
  let out = "";
  for (const v of values) out += encode(v);
  return out;
}

export function decodeAll(input: string, offset = 0): number[] {
  const values: number[] = [];
  let value = 0;
  let scale = 1;
  for (let i = offset; i < input.length; i++) {
    const digit = digitOf(input.charCodeAt(i));
    if (digit < 0) throw new Error("vlq: invalid character");
    value += (digit & 31) * scale;
    if (value >= TWO_POW_32) throw new Error("vlq: value exceeds 32-bit range");
    if (digit & 32) {
      scale = Math.min(scale * 32, TWO_POW_32);
      continue;
    }
    const negative = value % 2 === 1;
    const magnitude = (value - (negative ? 1 : 0)) / 2;
    values.push(negative ? (magnitude === 0 ? INT32_MIN : -magnitude) : magnitude);
    value = 0;
    scale = 1;
  }
  if (scale !== 1) throw new Error("vlq: truncated input");
  return values;
}

export function decode(input: string, offset = 0): number {
  const values = decodeAll(input, offset);
  if (values.length !== 1) throw new Error("vlq: expected exactly one value");
  return values[0];
}
