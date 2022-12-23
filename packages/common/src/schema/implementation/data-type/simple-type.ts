import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '../../opra-schema.definition.js';
import { colorFgMagenta, colorFgYellow, colorReset, nodeInspectCustom } from '../../utils/inspect.util.js';
import type { OpraDocument } from '../opra-document';
import { DataType } from './data-type.js';

export class SimpleType extends DataType {
  declare protected readonly _metadata: OpraSchema.SimpleType;
  declare readonly base?: SimpleType;

  constructor(owner: OpraDocument, name: string, args: StrictOmit<OpraSchema.SimpleType, 'kind'>) {
    super(owner, name, {
      kind: 'SimpleType',
      ...args
    });
  }

  toString(): string {
    return `[${Object.getPrototypeOf(this).constructor.name} ${this.name}]`;
  }

  [nodeInspectCustom](): string {
    return `[${colorFgYellow + Object.getPrototypeOf(this).constructor.name + colorReset}` +
        ` ${colorFgMagenta + this.name + colorReset}]`;
  }

}
