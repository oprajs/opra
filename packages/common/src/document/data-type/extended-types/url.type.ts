import { isURL, Validator } from 'valgen';
import { DECODER, ENCODER } from '../../constants';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'A Uniform Resource Identifier Reference (RFC 3986 icon) value'
})
export class UrlType {

  constructor(attributes?: Partial<UrlType>) {
    if (attributes)
      Object.assign(this, attributes);
  }

  [DECODER](): Validator {
    return isURL;
  }

  [ENCODER](): Validator {
    return isURL;
  }

}
