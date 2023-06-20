import { OpraException } from '../opra-exception.js';

export class ValidationError extends OpraException {

  status = 400;

}
