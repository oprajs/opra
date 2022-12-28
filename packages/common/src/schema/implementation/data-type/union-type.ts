import { omit } from 'lodash';
import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '../../opra-schema.definition.js';
import { colorFgMagenta, colorFgYellow, colorReset, nodeInspectCustom } from '../../utils/inspect.util.js';
import type { OpraDocument } from '../opra-document';
import { ComplexType } from './complex-type.js';
import { DataType } from './data-type.js';

export type UnionTypeArgs = StrictOmit<OpraSchema.UnionType, 'kind'> & {
  types: DataType[];
};

export class UnionType extends DataType {
  declare protected readonly _metadata: StrictOmit<OpraSchema.UnionType, 'types'>;
  readonly types: DataType[];
  readonly hasAdditionalFields: boolean;

  constructor(owner: OpraDocument, name: string, args: UnionTypeArgs) {
    super(owner, name, omit({kind: 'UnionType', ...args}, ['types']) as any);
    this.types = args.types;
    this.hasAdditionalFields = name === 'any' ||
        !!this.types.find(t => t instanceof ComplexType && t.additionalFields);
  }

  toString(): string {
    return `[${Object.getPrototypeOf(this).constructor.name} ${this.name}]`;
  }

  [nodeInspectCustom](): string {
    return `[${colorFgYellow + Object.getPrototypeOf(this).constructor.name + colorReset}` +
        ` ${colorFgMagenta + this.name + colorReset}]`;
  }

}
