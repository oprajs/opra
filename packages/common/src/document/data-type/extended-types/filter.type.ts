import { Validator, validator } from 'valgen';
import { OpraFilter } from '../../../filter/index.js';
import { DECODER, ENCODER } from '../../constants';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'A query filter'
})
export class FilterType {

  constructor(attributes?: Partial<FilterType>) {
    if (attributes)
      Object.assign(this, attributes);
  }

  [DECODER](): Validator {
    return decodeFilter;
  }

  [ENCODER](): Validator {
    return encodeFilter;
  }

}

const decodeFilter = validator('decodeFilter', function (input, context, _this) {
  if (typeof input === 'string') {
    try {
      return OpraFilter.parse(input as string);
    } catch (e: any) {
      context.fail(_this, `{{label}} is not a valid filter expression. ${e.message}`, input, e.errors);
      return;
    }
  }
  context.fail(_this, `{{label}} is not a valid filter expression string`, input);
})


const encodeFilter = validator('encodeFilter', function (input, context, _this) {
  if (input instanceof OpraFilter.Ast) {
    return input.toString();
  }
  context.fail(_this, `{{label}} is not a valid filter expression`, input);
})
