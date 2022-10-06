import { StrictOmit } from 'ts-gems';
import { ResponsiveMap } from '../../helpers/responsive-map.js';
import { OpraSchema } from '../../opra-schema.js';
import { cloneObject } from '../../utils/clone-object.util.js';
import { colorFgMagenta, colorFgYellow, colorReset, nodeInspectCustom } from '../../utils/inspect-utils.js';
import type { OpraDocument } from '../opra-document.js';
import { DataType } from './data-type.js';

export type ComplexTypeArgs = StrictOmit<OpraSchema.ComplexType, 'kind'>;

export class ComplexType extends DataType {
  declare protected readonly _metadata: OpraSchema.ComplexType;
  readonly ownFields = new ResponsiveMap<string, Field>();
  readonly fields = new ResponsiveMap<string, Field>();

  constructor(owner: OpraDocument, metadata: ComplexTypeArgs) {
    super(owner, {
      kind: 'ComplexType',
      ...metadata
    });
    if (metadata.extends) {
      for (const ext of metadata.extends) {
        const baseType = owner.getDataType(ext.type);
        if (!(baseType instanceof ComplexType))
          throw new TypeError(`Cannot extend ${metadata.name} from a "${baseType.kind}"`);
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
        const f = cloneObject(prop) as Field;
        f.name = k;
        this.fields.set(k, f);
        this.ownFields.set(k, f);
      }
    }
  }

  get abstract() {
    return !!this._metadata.abstract;
  }

  get additionalFields() {
    return this._metadata.additionalFields;
  }

  getField(fieldName: string): Field {
    if (fieldName.includes('.')) {
      let dt: DataType = this;
      const arr = fieldName.split('.');
      let field: Field;
      for (const a of arr) {
        field = (dt as ComplexType).getField(a);
        dt = dt.owner.getDataType(field.type || 'string');
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
    return this.owner.getDataType(field.type || 'string');
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

}

export interface Field extends OpraSchema.Field {
  name: string;
  parent: ComplexType;
}
