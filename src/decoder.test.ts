import { Buffer } from "node:buffer"

import { describe, expect, it } from "vitest"

import { Decoder } from "./decoder"

describe(".currentOffset", () => {
  it("example works as described", () => {
    const buffer = Buffer.from([0x01, 0x01, 0x00, 0x00])
    const decoder = new Decoder(buffer)
    expect(decoder.readUint32()).toBe(257)
    expect(decoder.currentOffset).toBe(4)
  })
})

describe(".endianness", () => {
  it("example works as described", () => {
    const buffer = Buffer.from([0x00, 0x00, 0x01, 0x01])
    const decoder = new Decoder(buffer)
    decoder.endianness("big")
    expect(decoder.readUint32()).toBe(257)
  })
})

describe(".seek", () => {
  it("example works as described", () => {
    const buffer = Buffer.from([0xff, 0xff, 0x01, 0x00])
    const decoder = new Decoder(buffer)
    expect(decoder.seek(2)).toBe(0)
    expect(decoder.readUint16()).toBe(1)
  })
})

describe(".goto", () => {
  it("example works as described", () => {
    const buffer = Buffer.from([0xff, 0xff, 0x01, 0x00])
    const decoder = new Decoder(buffer)
    expect(decoder.readUint16()).toBe(65535)
    expect(decoder.goto(0)).toBe(2)
    expect(decoder.currentOffset).toBe(0)
    expect(decoder.readUint16()).toBe(65535)
  })
})

describe(".alignTo", () => {
  it("skips forwards correctly if diff if positive", () => {
    const decoder = new Decoder(Buffer.alloc(10))
    decoder.seek(12)
    decoder.alignTo(16)
    expect(decoder.currentOffset).toBe(16)
  })

  it("skips forwards correctly if diff if negative", () => {
    const decoder = new Decoder(Buffer.alloc(10))
    decoder.seek(4)
    decoder.alignTo(16)
    expect(decoder.currentOffset).toBe(16)
  })

  it("example works as described", () => {
    // prettier-ignore
    // Assume we have a header 5 bytes long, then 3 bytes of padding up to 8 bytes in, then more data
    const buffer = Buffer.from([
      0x74, 0xee, 0xb2, 0x36, 0x0c, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ])
    const decoder = new Decoder(buffer)
    // First we move the offset past the header
    expect(decoder.seek(5)).toBe(0)
    // Then we can align to the next 8 byte boundary
    decoder.alignTo(8)
    expect(decoder.currentOffset).toBe(8)
    expect(decoder.readUint64()).toBe(1n)
  })
})

describe("integers", () => {
  describe(".readInt8", () => {
    it("example works as described", () => {
      const decoder = new Decoder(Buffer.from([0xff]))
      expect(decoder.readInt8()).toBe(-1)
    })

    it("pointer example works as described", () => {
      //                                      (3   + 0)  | pad | -1
      const decoder = new Decoder(Buffer.from([0x03, 0x00, 0x00, 0xff]))
      const pointer = decoder.readUint16()
      expect(pointer).toBe(3)
      expect(decoder.readInt8({ pointer })).toBe(-1)
    })
  })

  describe(".readUint8", () => {
    it("example works as described", () => {
      const decoder = new Decoder(Buffer.from([0xff]))
      expect(decoder.readUint8()).toBe(255)
    })

    it("pointer example works as described", () => {
      //                                      (3   + 0)  | pad | -1
      const decoder = new Decoder(Buffer.from([0x03, 0x00, 0x00, 0xff]))
      const pointer = decoder.readUint16()
      expect(pointer).toBe(3)
      expect(decoder.readUint8({ pointer })).toBe(255)
    })
  })

  describe(".readInt16", () => {
    it("example works as described", () => {
      const decoder = new Decoder(Buffer.from([0xff, 0xff]))
      expect(decoder.readInt16()).toBe(-1)
    })

    it("pointer example works as described", () => {
      const decoder = new Decoder(Buffer.from([0x03, 0x00, 0x00, 0xff, 0xff]))
      const pointer = decoder.readUint16()
      expect(pointer).toBe(3)
      expect(decoder.readInt16({ pointer })).toBe(-1)
    })
  })

  describe(".readUint16", () => {
    it("decodes a value correctly", () => {
      const decoder = new Decoder(Buffer.from([0xff, 0xff]))
      expect(decoder.readUint16()).toBe(65535)
    })

    it("decodes a value via a pointer correctly", () => {
      //                                      (3   + 0)  | pad | -1
      const decoder = new Decoder(Buffer.from([0x03, 0x00, 0x00, 0xff, 0xff]))
      const pointer = decoder.readUint16()
      expect(pointer).toBe(3)
      expect(decoder.readUint16({ pointer })).toBe(65535)
    })
  })
})

describe(".readString", () => {
  it("should parse strings correctly", () => {
    const data = Buffer.from("testhelloworld")

    const decoder = new Decoder(data)
    expect(decoder.readString({ length: 4 })).toBe("test")
    expect(decoder.readString({ length: 5 })).toBe("hello")
    expect(decoder.readString({ length: 5 })).toBe("world")
  })

  it("should parse zeroed strings correctly", () => {
    const data = Buffer.from("test\x00hello\x00world\x00")

    const decoder = new Decoder(data)
    expect(decoder.readString({ zeroed: true })).toBe("test")
    expect(decoder.readString({ zeroed: true })).toBe("hello")
    expect(decoder.readString({ zeroed: true })).toBe("world")
  })
})

it("should parse the README example", () => {
  const data = Buffer.from([
    0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x2c, 0x20, 0x57, 0x6f, 0x72, 0x6c, 0x64, 0x21,
  ])
  const decoder = new Decoder(data)

  // You can use it to just read data straight from the buffer
  expect(decoder.readString({ length: 5 })).toBe("Hello")
  expect(decoder.readString({ length: 7 })).toBe(", World")

  // Or you can use it more ergonomically when possible
  const decoder2 = new Decoder(Buffer.alloc(2, 2))
  const result = {
    a: decoder2.readUint8(),
    b: decoder2.readUint8(),
  }

  expect(result).toEqual({ a: 2, b: 2 })
})

it("should allow parsing simple data", () => {
  const testBuffer = Buffer.alloc(17)
  const values = [3257, 3263, 6483, 9773]
  const view = new DataView(testBuffer.buffer)
  view.setInt8(0, 4)

  view.setInt8(1, 5)
  view.setInt8(5, 11)
  view.setInt16(11, values[0], true)

  view.setInt8(2, 6)
  view.setInt8(6, 9)
  view.setInt16(9, values[1], true)

  view.setInt8(3, 7)
  view.setInt8(7, 15)
  view.setInt16(15, values[2], true)

  view.setInt8(4, 8)
  view.setInt8(8, 13)
  view.setInt16(13, values[3], true)

  const parser = new Decoder(testBuffer)

  const entryCount = parser.readUint8()
  expect(entryCount).toBe(4)

  const entryOffsets = []
  for (let i = 0; i < entryCount; i++) {
    const entryOffset = parser.readUint8()
    entryOffsets.push(entryOffset)
    expect(entryOffset).toBe(5 + i)
  }

  const valueOffsets = []
  for (let i = 0; i < entryCount; i++) {
    const valueOffset = parser.readUint8({ pointer: entryOffsets[i] })
    valueOffsets.push(valueOffset)
  }
  parser.seek(4)

  for (let i = 0; i < entryCount; i++) {
    const value = parser.readUint16({ pointer: valueOffsets[i] })
    expect(value).toBe(values[i])
  }
  parser.seek(8)

  expect(parser.currentOffset).toBe(17)
})
