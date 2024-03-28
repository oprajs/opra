import { isEmail, Validator } from 'valgen';
import { DECODER, ENCODER } from '../../constants';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'An email value'
})
export class EmailType {

  constructor(attributes?: Partial<EmailType>) {
    if (attributes)
      Object.assign(this, attributes);
  }

  [DECODER](): Validator {
    return isEmail;
  }

  [ENCODER](): Validator {
    return isEmail;
  }

}

