import { buf2bs } from './buf2bs'
import { bs2buf } from './bs2buf'
import { BsSchema } from './types'

export const Bs = (initialSchema: BsSchema = {}) => {
  const schema = initialSchema;

  const setSchema = (newSchema: BsSchema) => {
    for (const k of Object.keys(schema)) {
      delete schema[k];
    }
    for (const entry of Object.entries(newSchema)) {
      const [ key, value ] = entry;
      schema[key] = value;
    }
  }

  return {
    getSchema: () => schema,
    setSchema,
    decode: buf2bs(schema),
    encode: bs2buf(schema)
  }
}
