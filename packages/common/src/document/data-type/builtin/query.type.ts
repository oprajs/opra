import { validator } from 'valgen';
import { OpraFilter } from '../../../filter/index.js';
import { SimpleType } from '../simple-type.js';


const decodeQuery = validator('decodeQuery', function (input, context, _this) {
  if (typeof input === 'string') {
    try {
      return OpraFilter.parse(input as string);
    } catch (e: any) {
      context.fail(_this, `{{label}} is not a valid query expression. ${e.message}`, input, e.errors);
      return;
    }
  }
  context.fail(_this, `{{label}} is not a valid query expression string`, input);
})


const encodeQuery = validator('encodeQuery', function (input, context, _this) {
  if (input instanceof OpraFilter.Ast) {
    return input.toString();
  }
  context.fail(_this, `{{label}} is not a valid query expression`, input);
})

@SimpleType({
  description: 'A query filter',
  decoder: decodeQuery,
  encoder: encodeQuery
})
export class QueryType {

}

