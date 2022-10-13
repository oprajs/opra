import _ from 'lodash';
import { StrictOmit } from 'ts-gems';
import { ResponsiveMap } from '../helpers/responsive-map.js';
import { OpraSchema } from '../opra-schema.js';
import { cloneObject } from '../utils/clone-object.util.js';
import { colorFgMagenta, colorFgYellow, colorReset, nodeInspectCustom } from '../utils/inspect-utils.js';
import { stringCompare } from '../utils/string-compare.util.js';
import { ComplexType } from './data-type/complex-type.js';
import { DataType } from './data-type/data-type.js';
import { internalDataTypes } from './data-type/internal-data-types.js';
import { SimpleType } from './data-type/simple-type.js';
import { SchemaGenerator } from './schema-generator.js';

export type OpraDocumentArgs = StrictOmit<OpraSchema.Document, 'version' | 'types'>;

export class OpraDocument {
  protected readonly _args: OpraDocumentArgs;
  protected _types = new ResponsiveMap<string, DataType>();

  constructor(schema: OpraSchema.Document) {
    this._args = _.omit(schema, 'types');
    if (schema.types)
      this._addDataTypes(schema.types);
  }

  get info(): OpraSchema.DocumentInfo {
    return this._args.info;
  }

  get types(): Map<string, DataType> {
    return this._types;
  }

  getDataType(name: string): DataType {
    const t = this.types.get(name);
    if (!t)
      throw new Error(`Data type "${name}" does not exists`);
    return t;
  }

  getComplexDataType(name: string): ComplexType {
    const t = this.getDataType(name);
    if (!(t instanceof ComplexType))
      throw new Error(`Data type "${name}" is not a ComplexType`);
    return t;
  }

  getSimpleDataType(name: string): SimpleType {
    const t = this.getDataType(name);
    if (!(t instanceof SimpleType))
      throw new Error(`Data type "${name}" is not a SimpleType`);
    return t;
  }

  getSchema(jsonOnly?: boolean) {
    const out: OpraSchema.Document = {
      version: OpraSchema.Version,
      info: cloneObject(this.info),
      types: [],
    };
    const sortedTypesArray = Array.from(this.types.values())
        .sort((a, b) => stringCompare(a.name, b.name));
    for (const dataType of sortedTypesArray) {
      if (!internalDataTypes.has(dataType.name))
        out.types.push(dataType.getSchema(jsonOnly));
    }
    return out;
  }

  toString(): string {
    return `[${Object.getPrototypeOf(this).constructor.name} ${this.info.title}]`;
  }

  [nodeInspectCustom](): string {
    return `[${colorFgYellow + Object.getPrototypeOf(this).constructor.name + colorReset}` +
        ` ${colorFgMagenta + this.info.title + colorReset}]`;
  }

  static async create(args: SchemaGenerator.GenerateDocumentArgs): Promise<OpraDocument> {
    const schema = await SchemaGenerator.generateDocumentSchema(args);
    return new OpraDocument(schema);
  }

  protected _addDataTypes(dataTypes: OpraSchema.DataType[]): void {
    const recursiveSet = new Set();
    const nameSet = new Set(dataTypes.map(x => x.name));

    const processDataType = (schema: OpraSchema.DataType) => {
      if ((!internalDataTypes.has(schema.name) && !nameSet.has(schema.name)) || this.types.get(schema.name))
        return;
      if (recursiveSet.has(schema.name))
        throw new TypeError(`Recursive dependency detected. ${Array.from(recursiveSet).join('>')}`);
      recursiveSet.add(schema.name);

      if (OpraSchema.isComplexType(schema)) {
        if (schema.extends) {
          let baseType: DataType | undefined;
          for (const ext of schema.extends) {
            baseType = this.types.get(ext.type);
            if (!baseType) {
              const extNameLower = ext.type.toLowerCase();
              const baseSchema = dataTypes.find(dt => dt.name.toLowerCase() === extNameLower);
              if (!baseSchema)
                throw new TypeError(`Extending schema (${ext.type}) of data type "${schema.name}" does not exists`);
              baseType = processDataType(baseSchema);
            }
          }
        }
        if (schema.fields) {
          for (const [k, f] of Object.entries(schema.fields)) {
            if (this.types.has(f.type))
              continue;
            if (!this.types.get(f.type)) {
              const intlType = internalDataTypes.get(f.type)
              if (intlType) {
                processDataType(intlType);
                continue;
              }
              const t = dataTypes.find(dt => dt.name.toLowerCase() === f.type.toLowerCase());
              if (!t)
                throw new TypeError(`Type "${f.type}" defined in (${schema.name}.${k}) does not exists`);
            }
          }
        }
      }

      let dataType: DataType;
      if (OpraSchema.isSimpleType(schema))
        dataType = new SimpleType(this, schema);
      else if (OpraSchema.isComplexType(schema))
        dataType = new ComplexType(this, schema);
      else
        throw new TypeError(`Invalid data type schema`);
      nameSet.delete(schema.name);
      this.types.set(dataType.name, dataType);
      recursiveSet.delete(schema.name);
      return dataType;
    }
    dataTypes.forEach(dataType => processDataType(dataType));
  }

}
