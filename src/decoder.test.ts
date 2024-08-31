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
