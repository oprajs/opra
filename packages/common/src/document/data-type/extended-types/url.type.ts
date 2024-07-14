import { Validator, vg } from 'valgen';
import { DECODER, ENCODER } from '../../constants.js';
import { SimpleType } from '../simple-type.js';

@(SimpleType({
  description: 'A Uniform Resource Identifier Reference (RFC 3986 icon) value',
  nameMappings: {
    js: 'string',
    json: 'string',
  },
}).Example('http://tempuri.org'))
export class UrlType {
  constructor(attributes?: Partial<UrlType>) {
    if (attributes) Object.assign(this, attributes);
  }

  protected [DECODER](): Validator {
    return vg.isURL({ coerce: true });
  }

  protected [ENCODER](): Validator {
    return vg.isURL({ coerce: true });
  }
}
