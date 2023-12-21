import { vg } from 'valgen';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'An email value',
  decoder: vg.isEmail(),
  encoder: vg.isEmail()
})
export class EmailType {

}
