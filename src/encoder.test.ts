import { describe, expect, it } from "vitest"

import { Encoder } from "./encoder"

describe(".grow", () => {
  it("should grow by the given size", () => {
    const encoder = new Encoder(4)
    encoder.setInt8(1)
    encoder.setInt8(2)
    encoder.setInt8(3)
    encoder.setInt8(4)
    encoder.grow(4)

    expect(encoder.currentSize).toBe(8)
  })

  it("should grow by the given size 2", () => {
    const encoder = new Encoder(5)
    encoder.grow(8)

    expect(encoder.currentSize).toBe(13)
  })
})

describe(".growIfNeeded", () => {
  it("should not grow the buffer if needed", () => {
    const encoder = new Encoder(4)
    encoder.setInt8(1)
    encoder.setInt8(2)
    encoder.growIfNeeded(2)

    expect(encoder.buffer.length).toBe(4)
  })

  it("should grow the buffer if needed", () => {
    const encoder = new Encoder(0)
    encoder.growIfNeeded(1)

    expect(encoder.buffer.length).toBe(1)
  })

  it("should grow the buffer if needed 2", () => {
    const encoder = new Encoder(2)
    encoder.growIfNeeded(4)

    expect(encoder.buffer.length).toBe(4)
  })

  it("should grow the buffer if needed 3", () => {
    const encoder = new Encoder(4)
    encoder.setInt8(1)
    encoder.setInt8(2)
    encoder.growIfNeeded(4)

    expect(encoder.buffer.length).toBe(6)
  })
})

describe(".seek", () => {
  it("should return the previous offset", () => {
    const encoder = new Encoder(4)
    encoder.setInt8(1)
    encoder.setInt8(2)
    const previous = encoder.seek(2)

    expect(previous).toBe(2)
  })

  it("should grow the buffer if needed", () => {
    const encoder = new Encoder(4)
    encoder.setInt8(1)
    encoder.setInt8(2)
    encoder.seek(4)

    expect(encoder.buffer.length).toBe(6)
  })

  it("should seek the given offset", () => {
    const encoder = new Encoder(4)
    encoder.setInt8(1)
    encoder.setInt8(2)
    encoder.seek(-2)

    expect(encoder.currentOffset).toBe(0)
  })
})

describe(".goto", () => {
  it("should goto the given offset", () => {
    const encoder = new Encoder(4)
    encoder.setInt8(1)
    encoder.setInt8(2)
    encoder.goto(0)

    expect(encoder.currentOffset).toBe(0)
  })

  it("should return the previous offset", () => {
    const encoder = new Encoder(4)
    encoder.setInt8(1)
    encoder.setInt8(2)
    const previous = encoder.goto(2)

    expect(previous).toBe(2)
  })

  it("should grow the buffer if needed", () => {
    const encoder = new Encoder(4)
    encoder.setInt8(1)
    encoder.setInt8(2)
    encoder.goto(4)

    expect(encoder.buffer.length).toBe(4)
  })
})

describe(".alignTo", () => {
  it("should not move if already aligned", () => {
    const encoder = new Encoder(4)
    encoder.alignTo(4)

    expect(encoder.currentOffset).toBe(0)
  })

  it("should not move if already aligned 2", () => {
    const encoder = new Encoder(4)
    encoder.setUint32(1)
    encoder.alignTo(4)

    expect(encoder.currentOffset).toBe(4)
  })

  it("should align to the given byte", () => {
    const encoder = new Encoder(4)
    encoder.setInt8(2)
    encoder.alignTo(4)

    expect(encoder.currentOffset).toBe(4)
  })

  it("should grow the buffer if needed", () => {
    const encoder = new Encoder(5)
    encoder.setInt8(1)
    encoder.setInt8(2)
    encoder.setInt8(3)
    encoder.setInt8(4)
    encoder.setInt8(5)
    encoder.alignTo(8)

    expect(encoder.buffer.length).toBe(8)
  })
})

const cases = [
  ["setInt8", 1, undefined],
  ["setUint8", 1, undefined],
  ["setInt16", 2, undefined],
  ["setUint16", 2, undefined],
  ["setInt32", 4, undefined],
  ["setUint32", 4, undefined],
  ["setInt64", 8, BigInt],
  ["setUint64", 8, BigInt],
  // ["setFloat", 4],
  // ["setDouble", 8],
] as const

describe.each(cases)(".%s", (method, size, convert) => {
  const num = (num: number) => (convert?.(num) as never) ?? num

  it("should write a value", () => {
    const encoder = new Encoder(size)
    encoder[method](num(1))

    expect(encoder.buffer[0]).toBe(1)
  })

  it("should write multiple values", () => {
    const encoder = new Encoder(size * 4)
    encoder[method](num(1))
    encoder[method](num(2))
    encoder[method](num(3))
    encoder[method](num(4))

    expect(encoder.buffer[0]).toBe(1)
  })

  it("should grow the buffer if needed", () => {
    const encoder = new Encoder(size * 2)
    encoder[method](num(1))
    encoder[method](num(2))
    encoder[method](num(3))

    expect(encoder.buffer.length).toBe(size * 3)
  })

  it("should not grow the buffer if pointer is not outside the buffer", () => {
    const encoder = new Encoder(size * 4) // 4
    encoder[method](num(1))
    encoder[method](num(2))
    encoder[method](num(3))
    encoder[method](num(4))
    encoder[method](num(5), { into: 0 })

    const buffer = encoder.buffer
    expect(buffer[0]).toBe(5)
    expect(buffer[size * 3]).toBe(4)
    expect(buffer.length).toBe(size * 4)
  })
})

describe(".setString", () => {
  it("should write the string", () => {
    const encoder = new Encoder(5)
    encoder.setString("test")

    expect(encoder.buffer.toString()).toBe("test\x00")
  })

  it("should grow the buffer if needed", () => {
    const encoder = new Encoder(2)
    encoder.setUint16(1)
    encoder.setString("test")

    const buffer = encoder.buffer
    expect(buffer.length).toBe(7)
    expect(buffer[0]).toBe(1)
    expect(buffer.subarray(2).toString("utf8")).toBe("test\x00")
  })
})
