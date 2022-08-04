import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '@opra/common';
import { Responsive, ResponsiveObject } from '../../helpers/responsive-object';
import { colorFgMagenta, colorFgYellow, colorReset, nodeInspectCustom } from '../../helpers/terminal-utils';
import { DataType } from './data-type';

export type ComplexTypeArgs = StrictOmit<OpraSchema.ComplexType, 'kind'>;

export class ComplexType extends DataType {
  declare protected readonly _args: StrictOmit<ComplexTypeArgs, 'properties'>;
  readonly ownProperties?: ResponsiveObject<OpraSchema.Property>;
  readonly properties?: ResponsiveObject<OpraSchema.Property>;

  constructor(args: ComplexTypeArgs, base?: ComplexType) {
    super({
      kind: 'ComplexType',
      ...args
    }, base);
    this.ownProperties = args?.properties && Responsive<OpraSchema.Property>(args.properties);
    this.properties = (base?.properties || this.ownProperties) &&
        Responsive<OpraSchema.Property>({...base?.properties, ...this.ownProperties});
  }

  get abstract(): boolean {
    return !!this._args.abstract;
  }

  get additionalProperties(): boolean | string | Pick<OpraSchema.Property, 'type' | 'format' | 'isArray' | 'enum'> | undefined {
    return this._args.additionalProperties;
  }

  getProperty(name: string): OpraSchema.Property {
    const t = this.properties?.[name];
    if (!t)
      throw new Error(`"${this.name}" type has no property named "${name}"`);
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
