import type { Type } from 'ts-gems';
import { toString, type Validator, validator, vg } from 'valgen';
import type { ApiDocument } from '../../api-document.js';
import { DocumentElement } from '../../common/document-element.js';
import { DECODER, ENCODER } from '../../constants.js';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  name: 'fieldpath',
  description: 'Field path',
  nameMappings: {
    js: 'string',
    json: 'string',
  },
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
    const allowSigns = properties.allowSigns;
    const decodeFieldPath = validator('decodeFieldPath', (input: string) =>
      dataType.normalizeFieldPath(input, { allowSigns }),
    );
    return vg.pipe([toString, decodeFieldPath]);
  }

  [ENCODER](properties: Partial<this>, element: DocumentElement): Validator {
    return this[DECODER](properties, element);
  }

  toJSON(
    properties: Partial<FieldPathType>,
    element: DocumentElement,
    options?: ApiDocument.ExportOptions,
  ) {
    const dataType = properties.dataType
      ? element.node.getComplexType(properties.dataType)
      : element.node.getComplexType('object');
    const typeName = dataType
      ? element.node.getDataTypeNameWithNs(dataType)
      : undefined;
    if (options?.scopes && !dataType.inScope(options?.scopes))
      throw new TypeError(
        `Data type ${typeName ? '(' + typeName + ')' : ''} ` +
          `is not in required scope(s) [${options.scopes}`,
      );
    return {
      dataType: typeName ? typeName : dataType.toJSON(options),
      allowSigns: properties.allowSigns,
    };
  }
}
