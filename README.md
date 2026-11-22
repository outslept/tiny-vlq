# tiny-vlq

Tiny, fast Base64 VLQ encoder and decoder for Source Maps in TypeScript

## Usage

```ts
import { decode, encode } from "tiny-vlq";

encode(0); // "A"
encode([0, 0, 16, 1]); // "AAgBC"

decode("AAgBC"); // [0, 0, 16, 1]
```

## API

### `encode(value: number | readonly number[]): string`

Encodes a single 32-bit signed integer or an array of 32-bit signed integers (`-2147483648` to `2147483647`) into a Base64 VLQ string.

### `decode(input: string): number[]`

Decodes a Base64 VLQ string into an array of 32-bit signed integers.

## License

MIT
