# BM - ByteMap protocol

The ByteMap protocol is a typed, JSON-ish byte-format (a more close resemblence is Named Binary Tag). It converts between the BM type (listed below) and a Buffer, with the option of inputting and outputting BM arrays.

This way, you can encode any number of typed key/value pairs into a byte array that is accepted by all kinds of data transfer libraries.

---
## Types and API
---
Supported data types:
```ts
type BMtype =
export type BMtype =
/** Single value types **/
  'bool' | 'char' |               // Basic

  'u8' | 'u16' | 'u32' |          // Unsigned integer
  'i8' | 'i16' | 'i32' |          // Signed integer
  'float' | 'double' |            // Float

/** Fixed size array types **/
  'hsv' | 'rgb' | 'rgbw' |        // Predefined size arrays
  'date' | 'time' | 'datetime' |  // Date/time

/** Variable size array types **/
  'bool[]' | 'string' | 'json' |  // Basic

  'u8[]' | 'u16[]' | 'u32[]' |    // Unsigned integer array
  'i8[]' | 'i16[]' | 'i32[]' |    // Signed integer array
  'float[]' | 'double[]'          // Float array
```

ByteMap input/output format:
```ts
export interface BM {
  cls?: BMclass
  key: string
  data: any
  type: BMtype
  size?: number
}
```
The `cls` is an optional parameter that currently represents the 'kind' of information sent, aimed towards home automation (so that the 'goal' of the data can be marked).
The `key` is simply the map index (comparable to an object key). The `data` contains the actual payload to be sent; expected input formats differ per type. Most are straightforward; for the date/time types, a date is a `YYYY-MM-DD` formatted string, while time is `hh:mm:ss.SSS`. Datetime combines the two with a space inbetween.

Exported API functions:
```ts
bm2buf(bm: BM) => Buffer
bms2buf(bms: BM[]) => Buffer

buf2bm(buf: Buffer) => BM
buf2bms(buf: Buffer) => BM[]
```

---
## Under the hood
---
The provided, typed BM data is split into a header and a data part. The header contains the key length, data type and - if necessary - the data size (data size is only necessary for variable-length types; the protocol itself infers the data size either directly from the type, or from the input length). 

This header is followed by the actual payload. Since each typed key/value pair has known sizes, a `BM` array can simply be produced by concatenating the individual buffers for each key/value pair.

Given a key with length `keyLength`, type `bm_type` with fixed data size and payload `data`, the encoded `Buffer` looks like this:
```
[0x00, keyLength, "key", byteCode(bm_type), data]
```
In case of a variable data size type, the buffer is extended with one `uint32` indicating this size. In this case, the `Buffer` looks like this:
```
[0x00, keyLength, "key", byteCode(bm_type), size, data]
```
The `byteCode()` is a pseudo-function, simply meaning that each `BMtype` string has a corresponding, single-byte value in the `Buffer` (found in `types.ts`)
