import { isEmail } from 'valgen';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'An email value',
  decoder: isEmail(),
  encoder: isEmail()
})
export class EmailType {

}
