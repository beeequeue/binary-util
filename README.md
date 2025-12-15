# binary-util

[![npm](https://img.shields.io/npm/v/binary-util)](https://www.npmjs.com/package/binary-util)
[![npm unpacked size](https://img.shields.io/npm/unpacked-size/binary-util)](https://npmgraph.js.org/?q=binary-util#zoom=w&select=binary-util%401.1.1)
[![npm bundle size](https://img.shields.io/badge/bundled%20size-3.8%20kB-blue)](https://bundlejs.com/?bundle&q=binary-util&treeshake=[*])
![node-current](https://img.shields.io/node/v/binary-util)

A utility library for working with binary data in.

It does not have full support for all types of data, but it does have the ones I needed. :^)

## Usage

A full example of how to use this library can be found in my [RE MSG library](https://github.com/beeequeue/remsg).

Here are some non-exhaustive examples:

### Decoder

```typescript
import { Decoder } from "binary-util"

const data = Buffer.from([
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
