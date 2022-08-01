import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '@opra/common';
import { CaseInsensitiveObject } from '../../helpers/case-insensitive-object';
import { colorFgMagenta, colorFgYellow, colorReset, nodeInspectCustom } from '../../helpers/terminal-utils';
import { DataType } from './data-type';

export class ComplexType extends DataType {
  declare protected readonly _args: OpraSchema.ComplexType;
  readonly properties?: Record<string, OpraSchema.Property>;

  constructor(args: StrictOmit<OpraSchema.ComplexType, 'kind'>, base?: ComplexType) {
    super({
      kind: 'ComplexType',
      ...args
    }, base);
    this.properties = CaseInsensitiveObject({...base?.properties, ...args.properties});
  }

  get abstract(): boolean {
    return !!this._args.abstract;
  }

  get additionalProperties(): boolean | string | Pick<OpraSchema.Property, 'type' | 'format' | 'isArray' | 'enum'> | undefined {
    return this._args.additionalProperties;
  }

  get OwnProperties(): Record<string, OpraSchema.Property> | undefined {
    return this._args.properties;
  }

  getProperty(name: string): OpraSchema.Property {
    const t = this.properties?.[name];
    if (!t)
      throw new Error(`${this.name} has no property named "${name}"`);
    return t;
  }

  toString(): string {
    return `[${Object.getPrototypeOf(this).constructor.name} ${this.name}]`;
  }

  [nodeInspectCustom](): string {
    return `[${colorFgYellow + Object.getPrototypeOf(this).constructor.name + colorReset}` +
        ` ${colorFgMagenta + this.name + colorReset}]`;
  }

}
