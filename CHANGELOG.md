# binary-util

## 2.0.0

### Major Changes

- [`10ca59f`](https://github.com/beeequeue/binary-util/commit/10ca59f5ca3a2b759a8909d2c236f4d049b77d43) - The package is now ESM-only.

- [`10ca59f`](https://github.com/beeequeue/binary-util/commit/10ca59f5ca3a2b759a8909d2c236f4d049b77d43) - Now requires Node 20.19+.

- [`0c68636`](https://github.com/beeequeue/binary-util/commit/0c686367b4f9f14bb4583d91f88c94943bf96505) - Removed `wrap` option from `.readString()`.

### Minor Changes

- [`cf60926`](https://github.com/beeequeue/binary-util/commit/cf60926d1aafd8889518b80f88650105213aa7ac) - Added documentation for every function in `Decoder`.

### Patch Changes

- [`7f2bc2b`](https://github.com/beeequeue/binary-util/commit/7f2bc2b042be23a060aa3ac9d3e903f575f6be4e) - Fixed `.alignTo` not working as intended.

## 1.1.1

### Patch Changes

- [`9f885d8`](https://github.com/beeequeue/binary-util/commit/9f885d81996811092c9b135215e32061e9c25b82) Thanks [@beeequeue](https://github.com/beeequeue)! - Fixed writing strings containing multi-byte characters

## 1.1.0

### Minor Changes

- [`22f3920`](https://github.com/beeequeue/binary-util/commit/22f3920a9be145b9e86ff5e9a9c9a08828900f6f) Thanks [@beeequeue](https://github.com/beeequeue)! - Added `encoding` options to `readString` and `setString` functions

### Patch Changes

- [`22f3920`](https://github.com/beeequeue/binary-util/commit/22f3920a9be145b9e86ff5e9a9c9a08828900f6f) Thanks [@beeequeue](https://github.com/beeequeue)! - Fixed `setString` not adding a null (`\x00`) byte at end of strings

- [`22f3920`](https://github.com/beeequeue/binary-util/commit/22f3920a9be145b9e86ff5e9a9c9a08828900f6f) Thanks [@beeequeue](https://github.com/beeequeue)! - Fixed `zeroed` option on `parseString` not working correctly

## 1.0.0

### Major Changes

- [`40d2ae7`](https://github.com/beeequeue/binary-util/commit/40d2ae7410c8d752b3b76d18309d49dd3636953e) Thanks [@beeequeue](https://github.com/beeequeue)! - Initial release
