import { FIELD_PATH_PATTERN } from '../../constants.js';
import { StringType } from '../primitive-types/index';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'Field path'
})
export class FieldPathType extends StringType {

  constructor(attributes?: Partial<FieldPathType>) {
    super(attributes);
  }

  pattern = FIELD_PATH_PATTERN;

  @SimpleType.Attribute({
    description: 'Data type which field belong to'
  })
  dataType?: string;

}
