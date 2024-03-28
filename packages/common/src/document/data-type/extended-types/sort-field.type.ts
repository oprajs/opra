import { FIELD_PATH_PATTERN, SORT_FIELD_PATTERN } from '../../constants.js';
import { StringType } from '../primitive-types/index';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'Sort field'
})
export class SortFieldType extends StringType {

  constructor(attributes?: Partial<SortFieldType>) {
    super(attributes);
  }

  pattern = SORT_FIELD_PATTERN;

}
