import { Type } from 'ts-gems';
import { toString, Validator, validator, vg } from 'valgen';
import { DocumentElement } from '../../common/document-element.js';
import { DECODER, ENCODER } from '../../constants.js';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'Field path',
})
export class FieldPathType {
  constructor(attributes?: Partial<FieldPathType>) {
    if (attributes) Object.assign(this, attributes);
  }

  @SimpleType.Attribute({
    description: 'Data type which field belong to',
  })
  dataType?: Type | string;

  @SimpleType.Attribute({
    description:
      'Determines if signs (+,-) are allowed. ' +
      'If set "first" signs are allowed only beginning of the field path' +
      'If set "each" signs are allowed at each field in the path',
  })
  allowSigns?: 'first' | 'each';

  [DECODER](properties: Partial<this>, element: DocumentElement): Validator {
    const dataType = properties.dataType
      ? element.node.getComplexType(properties.dataType)
      : element.node.getComplexType('object');
    const allowSigns = this.allowSigns;
    const decodeFieldPath = validator('decodeFieldPath', function (input: string) {
      return dataType.normalizeFieldPath(input, { allowSigns });
    });
    return vg.pipe([toString, decodeFieldPath]);
  }

  [ENCODER](properties: Partial<this>, element: DocumentElement): Validator {
    return this[DECODER](properties, element);
  }

  toJSON(properties: Partial<FieldPathType>, element: DocumentElement) {
    const dataType = properties.dataType
      ? element.node.getComplexType(properties.dataType)
      : element.node.getComplexType('object');
    return {
      dataType: dataType.name ? dataType.name : dataType.toJSON(),
      allowSigns: properties.allowSigns,
    };
  }
}
