import { TextEncoder } from "node:util"

type BaseOptions = {
  into?: number
}

type StringOptions = BaseOptions & {
  encoding?: "utf8"
}

type WriteNumberFunction<Value extends number | bigint = number | bigint> = (
  value: Value,
  opts?: BaseOptions,
) => void

export class Encoder {
  #buffer: Uint8Array
  #view: DataView
  #currentOffset = 0
  #littleEndian = true

  constructor(length: number = 0) {
    this.#buffer = new Uint8Array(length)
    this.#view = new DataView(this.#buffer.buffer)
  }

  get currentOffset(): number {
    return this.#currentOffset
  }

  get currentSize(): number {
    return this.#buffer.length
  }

  get buffer(): Uint8Array {
    const newBuffer = new Uint8Array(this.#buffer.length)
    newBuffer.set(this.#buffer)
    return newBuffer
  }

  endianness(endianness: "big" | "little"): void {
    this.#littleEndian = endianness === "little"
  }

  grow(size: number): void {
    const newBuffer = new Uint8Array(this.#buffer.length + size)
    newBuffer.set(this.#buffer)
    this.#buffer = newBuffer
    this.#view = new DataView(this.#buffer.buffer)
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

  setInt8: WriteNumberFunction<number> = (value, opts) => {
    if (opts?.into == null || opts.into + 1 > this.#buffer.length) {
      this.growIfNeeded(1)
    }
    this.#view.setInt8(opts?.into ?? this.#currentOffset, value)
    if (opts?.into == null) {
      this.#currentOffset += 1
    }
  }

  setUint8: WriteNumberFunction<number> = (value, opts) => {
    if (opts?.into == null || opts.into + 1 > this.#buffer.length) {
      this.growIfNeeded(1)
    }
    this.#view.setUint8(opts?.into ?? this.#currentOffset, value)
    if (opts?.into == null) {
      this.#currentOffset += 1
    }
  }

  setInt16: WriteNumberFunction<number> = (value, opts) => {
    if (opts?.into == null || opts.into + 2 > this.#buffer.length) {
      this.growIfNeeded(2)
    }
    this.#view.setInt16(opts?.into ?? this.#currentOffset, value, this.#littleEndian)
    if (opts?.into == null) {
      this.#currentOffset += 2
    }
  }

  setUint16: WriteNumberFunction<number> = (value, opts) => {
    if (opts?.into == null || opts.into + 2 > this.#buffer.length) {
      this.growIfNeeded(2)
    }
    this.#view.setUint16(opts?.into ?? this.#currentOffset, value, this.#littleEndian)
    if (opts?.into == null) {
      this.#currentOffset += 2
    }
  }

  setInt32: WriteNumberFunction<number> = (value, opts) => {
    if (opts?.into == null || opts.into + 4 > this.#buffer.length) {
      this.growIfNeeded(4)
    }
    this.#view.setInt32(opts?.into ?? this.#currentOffset, value, this.#littleEndian)
    if (opts?.into == null) {
      this.#currentOffset += 4
    }
  }

  setUint32: WriteNumberFunction<number> = (value, opts) => {
    if (opts?.into == null || opts.into + 4 > this.#buffer.length) {
      this.growIfNeeded(4)
    }
    this.#view.setUint32(opts?.into ?? this.#currentOffset, value, this.#littleEndian)
    if (opts?.into == null) {
      this.#currentOffset += 4
    }
  }

  setInt64: WriteNumberFunction<bigint> = (value, opts) => {
    if (opts?.into == null || opts.into + 8 > this.#buffer.length) {
      this.growIfNeeded(8)
    }
    this.#view.setBigInt64(opts?.into ?? this.#currentOffset, value, this.#littleEndian)
    if (opts?.into == null) {
      this.#currentOffset += 8
    }
  }

  setUint64: WriteNumberFunction<bigint> = (value, opts) => {
    if (opts?.into == null || opts.into + 8 > this.#buffer.length) {
      this.growIfNeeded(8)
    }
    this.#view.setBigUint64(opts?.into ?? this.#currentOffset, value, this.#littleEndian)
    if (opts?.into == null) {
      this.#currentOffset += 8
    }
  }

  setFloat: WriteNumberFunction<number> = (value, opts) => {
    if (opts?.into == null || opts.into + 4 > this.#buffer.length) {
      this.growIfNeeded(4)
    }
    this.#view.setFloat32(opts?.into ?? this.#currentOffset, value, this.#littleEndian)
    if (opts?.into == null) {
      this.#currentOffset += 4
    }
  }

  setDouble: WriteNumberFunction<number> = (value, opts) => {
    if (opts?.into == null || opts.into + 8 > this.#buffer.length) {
      this.growIfNeeded(8)
    }
    this.#view.setFloat64(opts?.into ?? this.#currentOffset, value, this.#littleEndian)
    if (opts?.into == null) {
      this.#currentOffset += 8
    }
  }

  setString(value: string, opts?: StringOptions): void {
    this.#textEncoder ??= new TextEncoder()
    const data = this.#textEncoder.encode(`${value}\x00`)

    this.growIfNeeded(data.byteLength)
    this.#buffer.set(data, opts?.into ?? this.#currentOffset)

    if (opts?.into == null) {
      this.#currentOffset += data.byteLength
    }
  }

  setBuffer(value: Uint8Array, opts?: BaseOptions): void {
    this.growIfNeeded(value.length)

    this.#buffer.set(value, opts?.into ?? this.#currentOffset)
    if (opts?.into == null) {
      this.#currentOffset += value.length
    }
  }

  #textEncoder!: TextEncoder
}
