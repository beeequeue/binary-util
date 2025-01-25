import { Buffer } from "node:buffer"

import { expect, it } from "vitest"

import { Decoder } from "./decoder"

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

it("should allow parsing simple data", () => {
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

it("should parse zeroed strings correctly", () => {
  const data = Buffer.concat([
    Buffer.from([0x01]),
    Buffer.from("test\x00hello\x00world\x00"),
  ])

  const decoder = new Decoder(data)
  expect(decoder.readUint8()).toBe(1)
  expect(decoder.readString({ zeroed: true })).toBe("test")
  expect(decoder.readString({ zeroed: true })).toBe("hello")
  expect(decoder.readString({ zeroed: true })).toBe("world")
})

it("should parse the README example", () => {
  const data = Buffer.from([
    // eslint-disable-next-line unicorn/number-literal-case
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
