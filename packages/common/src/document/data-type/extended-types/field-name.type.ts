import { FIELD_NAME_PATTERN } from '../../constants.js';
import { StringType } from '../primitive-types/index';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'Field name'
})
export class FieldNameType extends StringType {

  constructor(attributes?: Partial<FieldNameType>) {
    super(attributes);
  }

  pattern = FIELD_NAME_PATTERN;

  @SimpleType.Attribute({
    description: 'Data type which field belong to'
  })
  dataType?: string;

}
