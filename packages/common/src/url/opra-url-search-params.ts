import { IntegerCodec } from '../http/codecs/integer-codec.js';
import { HttpParams } from '../http/http-params.js';

export class OpraURLSearchParams extends HttpParams {

  constructor(init?: HttpParams.Initiator, options?: HttpParams.Options) {
    super(init, {
      ...options,
      params: {
        '$filter': {codec: 'filter'},
        '$limit': {codec: new IntegerCodec({min: 0})},
        '$skip': {codec: new IntegerCodec({min: 0})},
        '$pick': {codec: 'string', array: 'strict'},
        '$omit': {codec: 'string', array: 'strict'},
        '$include': {codec: 'string', array: 'strict'},
        '$sort': {codec: 'string', array: 'strict'},
        '$distinct': {codec: 'boolean'},
        '$count': {codec: 'boolean'},
        ...options?.params
      }
    });
  }

  get [Symbol.toStringTag]() {
    return 'URLSearchParams';
  }

}
