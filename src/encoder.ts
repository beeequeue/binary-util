import { Buffer } from "node:buffer"

type StartsWith<E extends keyof Buffer, P extends string> = E extends `${P}${string}`
  ? E
  : never

type EndsWith<E extends keyof Buffer, P extends string> = E extends `${string}${P}`
  ? E
  : never

type BaseOptions = {
  into: number
}

type StringOptions = BaseOptions & {
  encoding?: BufferEncoding
}

type WriteNumberFunction<Value extends number | bigint = number | bigint> = (
  value: Value,
  opts?: BaseOptions,
) => void

type BufferWriteFunction = EndsWith<StartsWith<keyof Buffer, "write">, "BE" | "LE" | "8">

export class Encoder {
  #buffer: Buffer
  #currentOffset = 0
  #littleEndian = true

  constructor(length: number = 0) {
    this.#buffer = Buffer.alloc(length)
  }

  get currentOffset(): number {
    return this.#currentOffset
  }

  get currentSize(): number {
    return this.#buffer.length
  }

  get buffer(): Buffer {
    const newBuffer = Buffer.alloc(this.#buffer.length)
    this.#buffer.copy(newBuffer)
    return newBuffer
  }

  endianness(endianness: "big" | "little"): void {
    this.#littleEndian = endianness === "little"
  }

  grow(size: number): void {
    this.#buffer = Buffer.concat([this.#buffer, Buffer.alloc(size)])
  }

  growIfNeeded(incomingSize: number): void {
    if (this.#currentOffset + incomingSize > this.#buffer.length) {
      this.grow(this.#currentOffset + incomingSize - this.#buffer.length)
    }
  }

  seek(offset: number): number {
    const previous = this.#currentOffset

    this.growIfNeeded(offset)

    this.#currentOffset += offset
    return previous
  }

  goto(offset: number): number {
    const previous = this.#currentOffset

    this.growIfNeeded(this.currentOffset - offset)
    this.#currentOffset = offset

    return previous
  }

  alignTo(alignment: number): void {
    const diff = this.#currentOffset % alignment
    if (diff === 0) return

    this.growIfNeeded(alignment - diff)

    this.#currentOffset += alignment - diff
  }

  #createSetMethod =
    <Value extends number | bigint = number>(
      size: number,
      littleEndianFunction: BufferWriteFunction,
      bigEndianFunction?: BufferWriteFunction,
    ): WriteNumberFunction<Value> =>
    (value, opts) => {
      if (opts?.into == null || opts.into + size > this.#buffer.length) {
        this.growIfNeeded(size)
      }

      this.#buffer[
        !this.#littleEndian && bigEndianFunction != null
          ? bigEndianFunction
          : littleEndianFunction
      ](value as never, opts?.into ?? this.#currentOffset, size)

      if (opts?.into == null) {
        this.#currentOffset += size
      }
    }

  setInt8: WriteNumberFunction = this.#createSetMethod(1, "writeInt8")

  setUint8: WriteNumberFunction = this.#createSetMethod(1, "writeUInt8")

  setInt16: WriteNumberFunction = this.#createSetMethod(2, "writeInt16LE", "writeInt16BE")

  setUint16: WriteNumberFunction = this.#createSetMethod(
    2,
    "writeUInt16LE",
    "writeUInt16BE",
  )

  setInt32: WriteNumberFunction = this.#createSetMethod(4, "writeInt32LE", "writeInt32BE")

  setUint32: WriteNumberFunction = this.#createSetMethod(
    4,
    "writeUInt32LE",
    "writeUInt32BE",
  )

  setInt64: WriteNumberFunction<bigint> = this.#createSetMethod(
    8,
    "writeBigInt64LE",
    "writeBigInt64BE",
  )

  setUint64: WriteNumberFunction<bigint> = this.#createSetMethod(
    8,
    "writeBigUInt64LE",
    "writeBigUInt64BE",
  )

  setFloat: WriteNumberFunction = this.#createSetMethod(4, "writeFloatLE", "writeFloatBE")

  setDouble: WriteNumberFunction = this.#createSetMethod(
    8,
    "writeDoubleLE",
    "writeDoubleBE",
  )

  setString(value: string, opts?: StringOptions): void {
    this.growIfNeeded(value.length + 1)

    this.#buffer.write(
      `${value}\x00`,
      opts?.into ?? this.#currentOffset,
      opts?.encoding ?? "utf8",
    )

    if (opts?.into == null) {
      this.#currentOffset += value.length + 1
    }
  }

  setBuffer(value: Buffer, opts?: BaseOptions): void {
    this.growIfNeeded(value.length)

    value.copy(this.#buffer, opts?.into ?? this.#currentOffset)
    if (opts?.into == null) {
      this.#currentOffset += value.length
    }
  }
}
