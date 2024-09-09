import type { Type } from 'ts-gems';
import { type Validator, validator } from 'valgen';
import { FilterRules } from '../../../filter/filter-rules.js';
import { OpraFilter } from '../../../filter/index.js';
import type { DocumentElement } from '../../common/document-element.js';
import { DECODER, ENCODER } from '../../constants.js';
import type { ComplexType } from '../complex-type.js';
import { SimpleType } from '../simple-type.js';

@SimpleType({
  description: 'A query filter',
  nameMappings: {
    js: 'object',
    json: 'string',
  },
})
export class FilterType {
  constructor(attributes?: Partial<FilterType>) {
    if (attributes) Object.assign(this, attributes);
  }

  @SimpleType.Attribute({
    description: 'Data type which filtering fields belong to',
  })
  dataType?: Type | string;

  @SimpleType.Attribute({
    description: 'Stringified JSON object defines filtering rules',
    format: 'string',
  })
  rules?: Record<string, FilterRules.Rule>;

  protected [DECODER](properties: Partial<this>, element: DocumentElement): Validator {
    const dataType = properties.dataType
      ? element.node.getComplexType(properties.dataType)
      : element.node.getComplexType('object');
    const rules = properties.rules ? new FilterRules(properties.rules) : undefined;
    return decodeFilter(dataType, rules);
  }

  protected [ENCODER](): Validator {
    return encodeFilter;
  }

  toJSON(properties: Partial<FilterType>, element: DocumentElement) {
    const dataType = properties.dataType
      ? element.node.getComplexType(properties.dataType)
      : element.node.getComplexType('object');
    return {
      dataType: dataType.name ? dataType.name : dataType.toJSON(),
      rules: properties.rules,
    };
  }
}

const decodeFilter = (dataType: ComplexType, rules?: FilterRules) =>
  validator('decodeFilter', (input, context, _this) => {
    if (typeof input === 'string') {
      try {
        const filter = OpraFilter.parse(input as string);
        if (rules) return rules.normalizeFilter(filter, dataType);
        return filter;
      } catch (e: any) {
        context.fail(_this, `Not a valid filter expression. ${e.message}`, input);
        return;
      }
    }
    context.fail(_this, `Nt a valid filter expression string`, input);
  });

const encodeFilter = validator('encodeFilter', (input, context, _this) => {
  if (input instanceof OpraFilter.Ast) {
    return input.toString();
  }
  context.fail(_this, `Not a valid filter expression`, input);
});
