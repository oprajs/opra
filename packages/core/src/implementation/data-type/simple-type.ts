import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '@opra/common';
import { colorFgMagenta, colorFgYellow, colorReset, nodeInspectCustom } from '../../helpers/terminal-utils';
import { DataType } from './data-type';

export class SimpleType extends DataType {
  declare protected readonly _args: OpraSchema.SimpleType;
  declare readonly base?: SimpleType;

  constructor(args: StrictOmit<OpraSchema.SimpleType, 'kind'>, base?: SimpleType) {
    super({
      kind: 'SimpleType',
      ...args
    }, base);
  }

  get type(): 'boolean' | 'number' | 'integer' | 'string' {
    return this._args.type;
  }

  get format(): string | undefined {
    return this._args.format;
  }

  get default(): boolean | number | string | undefined {
    return this._args.default;
  }

  toString(): string {
    return `[${Object.getPrototypeOf(this).constructor.name} ${this.name}]`;
  }

  [nodeInspectCustom](): string {
    return `[${colorFgYellow + Object.getPrototypeOf(this).constructor.name + colorReset}` +
        ` ${colorFgMagenta + this.name + colorReset}]`;
  }

}