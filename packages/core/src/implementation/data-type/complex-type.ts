import merge from 'putil-merge';
import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '@opra/schema';
import { Responsive, ResponsiveObject } from '../../utils/responsive-object.js';
import { colorFgMagenta, colorFgYellow, colorReset, nodeInspectCustom } from '../../utils/terminal-utils.js';
import type { OpraDocument } from '../opra-document.js';
import { DataType } from './data-type.js';

export type ComplexTypeArgs = StrictOmit<OpraSchema.ComplexType, 'kind'>;

export class ComplexType extends DataType {
  declare protected readonly _metadata: OpraSchema.ComplexType;
  readonly ownProperties?: ResponsiveObject<OpraSchema.Property>;
  readonly properties?: ResponsiveObject<OpraSchema.Property>;

  constructor(owner: OpraDocument, metadata: ComplexTypeArgs, base?: ComplexType) {
    super(owner, {
      kind: 'ComplexType',
      ...metadata
    }, base);
    this.ownProperties = metadata?.properties && Responsive<OpraSchema.Property>(metadata.properties);
    this.properties = (base?.properties || this.ownProperties) &&
        Responsive<OpraSchema.Property>({...base?.properties, ...this.ownProperties});
  }

  get abstract(): boolean {
    return !!this._metadata.abstract;
  }

  get additionalProperties(): boolean | string | Pick<OpraSchema.Property, 'type' | 'format' | 'isArray' | 'enum'> | undefined {
    return this._metadata.additionalProperties;
  }

  getProperty(name: string): OpraSchema.Property {
    const t = this.properties?.[name];
    if (!t)
      throw new Error(`"${this.name}" type has no property named "${name}"`);
    return t;
  }

  getMetadata(): OpraSchema.ComplexTypeMetadata {
    const out = super.getMetadata() as OpraSchema.ComplexTypeMetadata;
    if (this.additionalProperties)
      out.additionalProperties = this.additionalProperties;
    if (this.ownProperties) {
      out.properties = {};
      for (const [k, prop] of Object.entries(this.ownProperties)) {
        out.properties[k] = merge({}, prop as any, {deep: true}) as any;
      }
    }
    return out;
  }

  toString(): string {
    return `[${Object.getPrototypeOf(this).constructor.name} ${this.name}]`;
  }

  [nodeInspectCustom](): string {
    return `[${colorFgYellow + Object.getPrototypeOf(this).constructor.name + colorReset}` +
        ` ${colorFgMagenta + this.name + colorReset}]`;
  }

}
