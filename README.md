# binary-util

[![Open on npmx.dev](https://npmx.dev/api/registry/badge/version/binary-util)](https://npmx.dev/package/binary-util)
[![Open on npmx.dev](https://npmx.dev/api/registry/badge/dependencies/binary-util)](https://npmx.dev/package/binary-util)
[![Open on npmx.dev](https://npmx.dev/api/registry/badge/size/binary-util)](https://npmx.dev/package/binary-util)
[![npm bundle size](https://img.shields.io/badge/bundled%20size-3.8%20kB-blue?labelColor=000)](https://teardown.kelinci.dev/?q=npm%3Abinary-util)

A library to simplify parsing and building binary data.

It does not support all types of data, but it does have the ones I needed. :^)

## Usage

A full example of how to use this library can be found in my [RE MSG library](https://github.com/beeequeue/remsg).

Here are some non-exhaustive examples:

### Decoder

```typescript
import { Decoder } from "binary-util"

const data = new Uint8Array([
  0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x2c, 0x20, 0x57, 0x6f, 0x72, 0x6c, 0x64, 0x21,
])
const decoder = new Decoder(data)

// You can use it to just read data straight from the buffer
decoder.readString({ length: 5 }) // Hello
decoder.readString({ length: 7 }) // ", World"

// Utilities
encoder.seek(-1)
encoder.seek(1)
encoder.alignTo(8)

// Or you can use it more ergonomically when possible
const decoder2 = new Decoder(Buffer.alloc(2, 2))
const result = {
  a: decoder2.readUint8(), // 2
  b: decoder2.readUint8(), // 2
}
```

### Encoder

```typescript
import { Encoder } from "binary-util"

const encoder = new Encoder()

encoder.writeString("Hello, World")
encoder.seek(-1)
encoder.seek(1)
encoder.alignTo(8)
encoder.writeUint8(2)

encoder.goto(1)
```
