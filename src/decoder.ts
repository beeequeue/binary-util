import type { Buffer } from "node:buffer"

type BaseOptions = {
  pointer?: number
}

type BaseStringOptions = {
  wrap?: (str: Buffer) => Buffer
  encoding?: "utf8"
}

type BufferOptions = BaseOptions & { length: number }

type StringOptions = BaseStringOptions & ({ length: number } | { zeroed: boolean })

export class Decoder {
  #buffer: Buffer
  #currentOffset = 0
  #littleEndian = true

  constructor(buffer: Buffer) {
    this.#buffer = buffer
  }

  get currentOffset(): number {
    return this.#currentOffset
  }

  endianness(endianness: "big" | "little"): void {
    this.#littleEndian = endianness === "little"
  }

  seek(offset: number): number {
    const previous = this.#currentOffset
    this.#currentOffset += offset
    return previous
  }

  goto(offset: number): number {
    const previous = this.#currentOffset
    this.#currentOffset = offset
    return previous
  }

  alignTo(alignment: number): void {
    this.#currentOffset += this.#currentOffset % alignment
  }

  readInt8(opts?: BaseOptions): number {
    const view = new DataView(
      this.#buffer.buffer,
      opts?.pointer ?? this.#currentOffset,
      1,
    )

    if (opts?.pointer == null) {
      this.#currentOffset += 1
    }
    return view.getInt8(0)
  }

  readUint8(opts?: BaseOptions): number {
    const view = new DataView(
      this.#buffer.buffer,
      opts?.pointer ?? this.#currentOffset,
      1,
    )

    if (opts?.pointer == null) {
      this.#currentOffset += 1
    }
    return view.getUint8(0)
  }

  readInt16(opts?: BaseOptions): number {
    const view = new DataView(
      this.#buffer.buffer,
      opts?.pointer ?? this.#currentOffset,
      2,
    )

    if (opts?.pointer == null) {
      this.#currentOffset += 2
    }
    return view.getInt16(0, this.#littleEndian)
  }

  readUint16(opts?: BaseOptions): number {
    const view = new DataView(
      this.#buffer.buffer,
      opts?.pointer ?? this.#currentOffset,
      2,
    )

    if (opts?.pointer == null) {
      this.#currentOffset += 2
    }
    return view.getUint16(0, this.#littleEndian)
  }

  readInt32(opts?: BaseOptions): number {
    const view = new DataView(
      this.#buffer.buffer,
      opts?.pointer ?? this.#currentOffset,
      4,
    )

    if (opts?.pointer == null) {
      this.#currentOffset += 4
    }
    return view.getInt32(0, this.#littleEndian)
  }

  readUint32(opts?: BaseOptions): number {
    const view = new DataView(
      this.#buffer.buffer,
      opts?.pointer ?? this.#currentOffset,
      4,
    )

    if (opts?.pointer == null) {
      this.#currentOffset += 4
    }
    return view.getUint32(0, this.#littleEndian)
  }

  readInt64(opts?: BaseOptions): bigint {
    const view = new DataView(
      this.#buffer.buffer,
      opts?.pointer ?? this.#currentOffset,
      8,
    )

    if (opts?.pointer == null) {
      this.#currentOffset += 8
    }
    return view.getBigInt64(0, this.#littleEndian)
  }

  readUint64(opts?: BaseOptions): bigint {
    const view = new DataView(
      this.#buffer.buffer,
      opts?.pointer ?? this.#currentOffset,
      8,
    )

    if (opts?.pointer == null) {
      this.#currentOffset += 8
    }
    return view.getBigUint64(0, this.#littleEndian)
  }

  readFloat(opts?: BaseOptions): number {
    const view = new DataView(
      this.#buffer.buffer,
      opts?.pointer ?? this.#currentOffset,
      4,
    )

    if (opts?.pointer == null) {
      this.#currentOffset += 4
    }
    return view.getFloat32(0, this.#littleEndian)
  }

  readDouble(opts?: BaseOptions): number {
    const view = new DataView(
      this.#buffer.buffer,
      opts?.pointer ?? this.#currentOffset,
      8,
    )

    if (opts?.pointer == null) {
      this.#currentOffset += 8
    }
    return view.getFloat64(0, this.#littleEndian)
  }

  readBuffer(opts: BufferOptions): Buffer {
    const result = this.#buffer.subarray(
      this.#currentOffset,
      this.#currentOffset + opts.length,
    )

    if (opts.pointer == null) {
      this.#currentOffset += opts.length
    }
    return result
  }

  readString(options: StringOptions): string {
    let buffer: Buffer

    if ("length" in options) {
      buffer = this.readBuffer(options)
    }

    if ("zeroed" in options) {
      const view = new DataView(this.#buffer.buffer, this.#currentOffset)

      let size = 0
      while (view.getUint8(this.#currentOffset + size) !== 0) {
        size++
      }
      buffer = this.#buffer.subarray(0, size)

      this.#currentOffset += size
    }

    return new TextDecoder().decode(buffer!)
  }
}
