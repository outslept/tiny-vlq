# tiny-vlq

Base64 VLQ encoding for signed 32-bit integers. See https://tc39.es/ecma426/#sec-base64-vlq

## Usage

```ts
import { encode, decode, encodeAll, decodeAll } from "tiny-vlq";

encode(123); // "2H"
decode("2H"); // 123

encodeAll([1, -1, 0]); // "CDA"
decodeAll("CDA"); // [1, -1, 0]
```
