import { StrictOmit } from 'ts-gems';
import { ResponsiveMap } from '../../../helpers/responsive-map.js';
import { OpraSchema } from '../../opra-schema.definition.js';
import { cloneObject } from '../../utils/clone-object.util.js';
import { colorFgMagenta, colorFgYellow, colorReset, nodeInspectCustom } from '../../utils/inspect.util.js';
import type { OpraDocument } from '../opra-document';
import { DataType } from './data-type.js';

export type ComplexTypeArgs = StrictOmit<OpraSchema.ComplexType, 'kind'>;

export class ComplexType extends DataType {
  protected _initialized = false;
  declare protected _metadata: OpraSchema.ComplexType;
  private _mixinAdditionalFields: boolean;
  readonly ownFields = new ResponsiveMap<string, Field>();
  readonly fields = new ResponsiveMap<string, Field>();

  constructor(owner: OpraDocument, name, args: ComplexTypeArgs) {
    super(owner, name, {
      kind: 'ComplexType',
      ...args
    });
  }

  get abstract() {
    return !!this._metadata.abstract;
  }

  get additionalFields() {
    return this._metadata.additionalFields || this._mixinAdditionalFields;
  }

  get extends(): OpraSchema.ComplexTypeExtendingInfo[] | undefined {
    return this._metadata.extends;
  }

  getField(fieldName: string): Field {
    if (fieldName.includes('.')) {
      let dt: DataType = this;
      const arr = fieldName.split('.');
      let field: Field;
      for (const a of arr) {
        field = (dt as ComplexType).getField(a);
        dt = dt.document.getDataType(field.type || 'string');
      }
      // @ts-ignore
      return field;
    }
    const t = this.fields.get(fieldName);
    if (!t)
      throw new Error(`"${this.name}" type doesn't have a field named "${fieldName}"`);
    return t;
  }

  getFieldType(fieldName: string): DataType {
    const field = this.getField(fieldName);
    return this.document.getDataType(field.type || 'string');
  }

  getOwnField(name: string): Field {
    const t = this.ownFields.get(name);
    if (!t)
      throw new Error(`"${this.name}" type doesn't have an own field named "${name}"`);
    return t;
  }

  getSchema(): OpraSchema.ComplexType {
    const out = super.getSchema() as OpraSchema.ComplexType;
    if (this.additionalFields)
      out.additionalFields = this.additionalFields;
    if (this.ownFields.size) {
      out.fields = {};
      for (const [k, prop] of this.ownFields) {
        out.fields[k] = cloneObject(prop);
        delete (out.fields[k] as any).name;
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

  init() {
    if (this._initialized)
      return;
    this._initialized = true;
    const metadata = this._metadata;
    if (metadata.extends) {
      for (const ext of metadata.extends) {
        const baseType = this.document.types.get(ext.type);
        if (!baseType)
          throw new TypeError(`Extending schema (${ext.type}) of data type "${this.name}" does not exists`);

        if (!(baseType instanceof ComplexType))
          throw new TypeError(`Cannot extend ${this.name} from a "${baseType.kind}"`);
        baseType.init();
        if (baseType.additionalFields)
          this._mixinAdditionalFields = true;
        for (const [k, prop] of baseType.fields) {
          const f = cloneObject(prop) as Field;
          f.name = k;
          f.parent = this;
          this.fields.set(k, f);
        }
      }
    }
    if (metadata.fields) {
      for (const [k, prop] of Object.entries(metadata.fields)) {
        const t = this.document.types.get(prop.type);
        if (!t)
          throw new TypeError(`Type "${prop.type}" defined for "${this.name}.${k}" does not exists`);
        const f = cloneObject(prop) as Field;
        f.name = k;
        this.fields.set(k, f);
        this.ownFields.set(k, f);
      }
    }
  }

}

export interface Field extends OpraSchema.Field {
  name: string;
  parent: ComplexType;
}
