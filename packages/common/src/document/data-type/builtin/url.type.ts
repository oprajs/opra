import { isURL } from 'valgen';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'A Uniform Resource Identifier Reference (RFC 3986 icon) value',
  decoder: isURL(),
  encoder: isURL()
})
export class UrlType {

}
