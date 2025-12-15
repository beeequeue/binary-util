import type { Buffer } from "node:buffer"

type BaseOptions = {
  pointer?: number
}

type BaseStringOptions = {
  encoding?: BufferEncoding
}

type BufferOptions = BaseOptions & { length: number }

type StringOptions = BaseStringOptions & ({ length: number } | { zeroed: boolean })

export class Decoder {
  #buffer: Buffer
  #currentOffset = 0
  #littleEndian = true

  // TODO: add initial endianness argument
  /**
   * Creates a new decoder instance for parsing binary data.
   *
   * Defaults to little endian.
   */
  constructor(buffer: Buffer) {
    this.#buffer = buffer
  }

  /**
   * Returns the current offset in the decoder's buffer.
   *
   * @example
   * ```ts
   * //                          1   + 256 + 0   + 0
   * const buffer = Buffer.from([0x01, 0x01, 0x00, 0x00])
   * const decoder = new Decoder(buffer)
   * decoder.readUint32() // 257
   * decoder.currentOffset // 4
   * ```
   */
  get currentOffset(): number {
    return this.#currentOffset
  }

  /**
   * Changes the current endianness of the decoder.
   * @param endianness - `big` or `little`
   * @example
   * ```ts
   * //                          0   + 0   + 256 + 1
   * const buffer = Buffer.from([0x00, 0x00, 0x01, 0x01])
   * const decoder = new Decoder(buffer)
   * decoder.endianness("big")
   * decoder.readUint32() // 257
   * ```
   */
  endianness(endianness: "big" | "little"): void {
    this.#littleEndian = endianness === "little"
  }

  /**
   * Move the current offset by an amount relative to the current offset.
   * @param offset - The amount to move the offset.
   * @returns The previous offset.
   * @example
   * ```ts
   * //                         (max + max)|(1   + 0)
   * const buffer = Buffer.from([0xFF, 0xFF, 0x01, 0x00])
   * const decoder = new Decoder(buffer)
   * decoder.seek(2) // 0
   * decoder.readUint16() // 1
   * ```
   */
  seek(offset: number): number {
    const previous = this.#currentOffset
    this.#currentOffset += offset
    return previous
  }

  /**
   * Move the current offset to an absolute position.
   * @param offset - The absolute position to move the offset to.
   * @returns The previous offset.
   * @example
   * ```ts
   * //                         (max + max)|(1   + 0)
   * const buffer = Buffer.from([0xff, 0xff, 0x01, 0x00])
   * const decoder = new Decoder(buffer)
   * decoder.readUint16() // 65535
   * decoder.goto(0) // 2
   * decoder.currentOffset // 0
   * decoder.readUint16() // 65535
   * ```
   */
  goto(offset: number): number {
    const previous = this.#currentOffset
    this.#currentOffset = offset
    return previous
  }

  // TODO: return previous offset
  /**
   * Skips the current offset forwards until the next alignment boundary.
   *
   * Useful for skipping padding between structures.
   *
   * @param alignment - The alignment boundary to skip to.
   * @example
   * ```ts
   * // Assume we have a header 5 bytes long, then 3 bytes of padding up to 8 bytes in, then more data
   * const buffer = Buffer.from([
   *   0x74, 0xee, 0xb2, 0x36, 0x0c, 0x00, 0x00, 0x00,
   *   0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
   * ])
   * const decoder = new Decoder(buffer)
   * // First we move the offset past the header
   * decoder.seek(5) // 0
   * // Then we can align to the next 8 byte boundary
   * decoder.alignTo(8)
   * decoder.currentOffset // 8
   * decoder.readUint64() // 1n
   * ```
   * @example
   */
  alignTo(alignment: number): void {
    this.#currentOffset += alignment - (this.#currentOffset % alignment)
  }

  /**
   * Reads a signed 8-bit integer from the buffer (1 byte)
   *
   * @param opts
   * @param opts.pointer {number} - Read from a specific offset instead of the current offset, useful for pointers. Does not advance the current offset.
   * @returns Value between -128 and 127.
   * @example
   * ```ts
   * const decoder = new Decoder(Buffer.from([0xff]))
   * expect(decoder.readInt8()).toBe(-1)
   * ```
   * @example Read via pointer offset
   * ```ts
   * //                                      (3   + 0)  | pad | -1
   * const decoder = new Decoder(Buffer.from([0x03, 0x00, 0x00, 0xff]))
   * const pointer = decoder.readUint16() // 3
   * decoder.readInt8({ pointer }) // -1
   * ```
   */
  readInt8(opts?: BaseOptions): number {
    const view = new DataView(
      this.#buffer.buffer,
      this.#buffer.byteOffset + (opts?.pointer ?? this.#currentOffset),
      1,
    )

    if (opts?.pointer == null) {
      this.#currentOffset += 1
    }
    return view.getInt8(0)
  }

  /**
   * Reads an unsigned 8-bit integer from the buffer (1 byte)
   *
   * @param opts
   * @param opts.pointer {number} - Read from a specific offset instead of the current offset, useful for pointers. Does not advance the current offset.
   * @returns Value between 0 and 255.
   * @example
   * ```ts
   * const decoder = new Decoder(Buffer.from([0xff]))
   * expect(decoder.readInt8()).toBe(255)
   * ```
   * @example Read via pointer offset
   * ```ts
   * //                                      (3   + 0)  | pad | -1
   * const decoder = new Decoder(Buffer.from([0x03, 0x00, 0x00, 0xff]))
   * const pointer = decoder.readUint16() // 3
   * decoder.readInt8({ pointer }) // 255
   * ```
   */
  readUint8(opts?: BaseOptions): number {
    const view = new DataView(
      this.#buffer.buffer,
      this.#buffer.byteOffset + (opts?.pointer ?? this.#currentOffset),
      1,
    )

    if (opts?.pointer == null) {
      this.#currentOffset += 1
    }
    return view.getUint8(0)
  }

  /**
   * Reads a signed 16-bit integer from the buffer (2 bytes)
   *
   * See {@link Decoder#readInt8} for examples.
   *
   * @param opts
   * @param opts.pointer {number} - See {@link Decoder#readInt8}.
   * @returns Value between -32768 and 32767.
   */
  readInt16(opts?: BaseOptions): number {
    const view = new DataView(
      this.#buffer.buffer,
      this.#buffer.byteOffset + (opts?.pointer ?? this.#currentOffset),
      2,
    )

    if (opts?.pointer == null) {
      this.#currentOffset += 2
    }
    return view.getInt16(0, this.#littleEndian)
  }

  /**
   * Reads an unsigned 16-bit integer from the buffer (2 bytes)
   *
   * See {@link Decoder#readUint8} for examples.
   *
   * @param opts
   * @param opts.pointer {number} - See {@link Decoder#readUint8}.
   * @returns Value between 0 and 65535.
   */
  readUint16(opts?: BaseOptions): number {
    const view = new DataView(
      this.#buffer.buffer,
      this.#buffer.byteOffset + (opts?.pointer ?? this.#currentOffset),
      2,
    )

    if (opts?.pointer == null) {
      this.#currentOffset += 2
    }
    return view.getUint16(0, this.#littleEndian)
  }

  /**
   * Reads a signed 32-bit integer from the buffer (4 bytes)
   *
   * See {@link Decoder#readInt8} for examples.
   *
   * @param opts
   * @param opts.pointer {number} - See {@link Decoder#readInt8}.
   * @returns Value between -2147483648 and 2147483647.
   */
  readInt32(opts?: BaseOptions): number {
    const view = new DataView(
      this.#buffer.buffer,
      this.#buffer.byteOffset + (opts?.pointer ?? this.#currentOffset),
      4,
    )

    if (opts?.pointer == null) {
      this.#currentOffset += 4
    }
    return view.getInt32(0, this.#littleEndian)
  }

  /**
   * Reads an unsigned 32-bit integer from the buffer (4 bytes)
   *
   * See {@link Decoder#readUint8} for examples.
   *
   * @param opts
   * @param opts.pointer {number} - See {@link Decoder#readUint8}.
   * @returns Value between 0 and 4294967295.
   */
  readUint32(opts?: BaseOptions): number {
    const view = new DataView(
      this.#buffer.buffer,
      this.#buffer.byteOffset + (opts?.pointer ?? this.#currentOffset),
      4,
    )

    if (opts?.pointer == null) {
      this.#currentOffset += 4
    }
    return view.getUint32(0, this.#littleEndian)
  }

  /**
   * Reads a signed 64-bit integer from the buffer (8 bytes)
   *
   * See {@link Decoder#readInt8} for examples.
   *
   * @param opts
   * @param opts.pointer {number} - See {@link Decoder#readInt8}.
   * @returns {bigint} Value between -9223372036854775808n and 9223372036854775807n.
   */
  readInt64(opts?: BaseOptions): bigint {
    const view = new DataView(
      this.#buffer.buffer,
      this.#buffer.byteOffset + (opts?.pointer ?? this.#currentOffset),
      8,
    )

    if (opts?.pointer == null) {
      this.#currentOffset += 8
    }
    return view.getBigInt64(0, this.#littleEndian)
  }

  /**
   * Reads an unsigned 64-bit integer from the buffer (8 bytes)
   *
   * See {@link Decoder#readUint8} for examples.
   *
   * @param opts
   * @param opts.pointer {number} - See {@link Decoder#readUint8}.
   * @returns {bigint} Value between 0 and 18446744073709551615n.
   */
  readUint64(opts?: BaseOptions): bigint {
    const view = new DataView(
      this.#buffer.buffer,
      this.#buffer.byteOffset + (opts?.pointer ?? this.#currentOffset),
      8,
    )

    if (opts?.pointer == null) {
      this.#currentOffset += 8
    }
    return view.getBigUint64(0, this.#littleEndian)
  }

  /**
   * Reads a floating-point number from the buffer (4 bytes)
   *
   * @param opts
   * @param opts.pointer {number} - See {@link Decoder#readUint8}.
   * @returns {number} Float
   */
  readFloat(opts?: BaseOptions): number {
    const view = new DataView(
      this.#buffer.buffer,
      this.#buffer.byteOffset + (opts?.pointer ?? this.#currentOffset),
      4,
    )

    if (opts?.pointer == null) {
      this.#currentOffset += 4
    }
    return view.getFloat32(0, this.#littleEndian)
  }

  /**
   * Reads a 64-bit floating-point number from the buffer (8 bytes)
   *
   * @param opts
   * @param opts.pointer {number} - See {@link Decoder#readUint8}.
   * @returns {number} Double
   */
  readDouble(opts?: BaseOptions): number {
    const view = new DataView(
      this.#buffer.buffer,
      this.#buffer.byteOffset + (opts?.pointer ?? this.#currentOffset),
      8,
    )

    if (opts?.pointer == null) {
      this.#currentOffset += 8
    }
    return view.getFloat64(0, this.#littleEndian)
  }

  /**
   * Reads a slice from the buffer.
   *
   * @param opts
   * @param opts.length {number} - Length of slice (not inclusive).
   * @param opts.pointer {number} - See {@link Decoder#readUint8}.
   */
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

  /**
   * Reads a string from the buffer. Defaults to `utf8`.
   *
   * @param opts - Requires either `zeroed` or `length`.
   * @param opts.zeroed - Read until a null terminator (`0x00`) is reached.
   * @param opts.length - Bytes to read.
   * @param opts.encoding - Defaults to `utf8`.
   * @example Zeroed
   * ```ts
   * const decoder = new Decoder(Buffer.from([0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x00]))
   * decoder.readString({ zeroed: true }) // "hello"
   * ```
   * @example Length
   * ```ts
   * const decoder = new Decoder(Buffer.from([0x68, 0x65, 0x6c, 0x6c, 0x6f]))
   * decoder.readString({ length: 5 }) // "hello"
   * ```
   */
  readString(opts: StringOptions): string {
    let strBuffer: Buffer | null = null

    if ("length" in opts && opts.length != null) {
      strBuffer = this.readBuffer(opts)
    }

    if ("zeroed" in opts && opts.zeroed) {
      const view = new DataView(
        this.#buffer.buffer,
        this.#buffer.byteOffset + this.#currentOffset,
      )

      let size = 0
      while (view.getUint8(size) !== 0) {
        size++
      }
      strBuffer = this.#buffer.subarray(this.#currentOffset, this.#currentOffset + size)

      this.#currentOffset += size + 1
    }

    if (strBuffer == null) {
      throw new Error("You need to specify either `zeroed` or `length`.")
    }

    return strBuffer.toString(opts.encoding ?? "utf8")
  }
}
