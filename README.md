# tiny-vlq

Base64 VLQ encoding for signed 32-bit integers.

## About

`tiny-vlq` encodes and decodes base64 VLQ—the variable-length integer format of source maps—with zero dependencies. Each character of the base64 alphabet carries five value bits plus a continuation bit; the sign occupies the least significant bit of the decoded quantity, so signed values ride the same digit stream. A 32-bit integer takes at most seven characters.

`decode` reads one value at an offset and returns the offset past it, so source-map field segments parse without slicing; `decodeAll` restores the classic whole-string behavior, and `encode`/`encodeAll` split the legacy package's polymorphic `number | number[]` input into two functions. Invalid characters, truncated input, overlong digit runs, and quantities beyond 32 bits throw instead of wrapping—the legacy implementation accepts unbounded sequences and lets bit shifts wrap silently. The base64 padding character `=` is not a VLQ digit and is rejected; the legacy alphabet accepts it and decodes it as zero. `-2147483648` round-trips through the format's negative-zero convention.

## Usage

```ts
import { encode, decode, encodeAll, decodeAll } from "tiny-vlq";

encode(123); // "2H"
decode("2H"); // { value: 123, offset: 2 }
encode(-1); // "D"
encodeAll([1, -1, 0]); // "CDA"
decodeAll("CDA"); // [1, -1, 0]
encode(2147483647); // "+/////D"
decode(encode(-2147483648)); // { value: -2147483648, offset: 1 }
```
