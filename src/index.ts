const ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const INT32_MIN = -0x80000000;

function digitOf(code: number): number {
  if (code >= 65 && code <= 90) return code - 65;
  if (code >= 97 && code <= 122) return code - 71;
  if (code >= 48 && code <= 57) return code + 4;
  if (code === 43) return 62;
  if (code === 47) return 63;
  return -1;
}

function encodeInt(value: number): string {
  if ((value | 0) !== value) {
    throw new RangeError("vlq: value must be a 32-bit signed integer");
  }
  let num = value < 0 ? (-value << 1) | 1 : value << 1;
  let out = "";
  do {
    let digit = num & 31;
    num >>>= 5;
    if (num !== 0) digit |= 32;
    out += ALPHABET[digit]!;
  } while (num !== 0);
  return out;
}

export function encode(value: number | readonly number[]): string {
  if (typeof value === "number") {
    return encodeInt(value);
  }
  let out = "";
  for (let i = 0; i < value.length; i++) {
    out += encodeInt(value[i]!);
  }
  return out;
}

export function decode(input: string): number[] {
  const result: number[] = [];
  let value = 0;
  let shift = 0;

  for (let i = 0; i < input.length; i++) {
    const digit = digitOf(input.charCodeAt(i));
    if (digit < 0) {
      throw new Error(`Invalid character (${input[i]})`);
    }
    if (shift === 30 && digit > 3) {
      throw new RangeError("vlq: value exceeds 32-bit range");
    }

    value |= (digit & 31) << shift;

    if (digit & 32) {
      shift += 5;
    } else {
      const shouldNegate = value & 1;
      value >>>= 1;
      result.push(shouldNegate ? (value === 0 ? INT32_MIN : -value) : value);
      value = shift = 0;
    }
  }

  if (shift !== 0) {
    throw new Error("vlq: truncated input");
  }

  return result;
}
