import { isBase64 } from 'valgen';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'A stream of bytes, base64 encoded',
  decoder: isBase64(),
  encoder: isBase64(),
})
export class Base64Type {

}
