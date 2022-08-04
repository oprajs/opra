import _ from 'lodash';
import { StrictOmit } from 'ts-gems';
import { OpraSchema } from '@opra/common';
import { internalDataTypes } from '../helpers/internal-data-types';
import { Responsive, ResponsiveObject } from '../helpers/responsive-object';
import { colorFgMagenta, colorFgYellow, colorReset, nodeInspectCustom } from '../helpers/terminal-utils';
import { ComplexType } from './data-type/complex-type';
import { DataType } from './data-type/data-type';
import { SimpleType } from './data-type/simple-type';
import { SchemaGenerator } from './schema-generator';

export type OpraDocumentArgs = StrictOmit<OpraSchema.Document, 'version' | 'types'>;

export class OpraDocument {
  protected readonly _args: OpraDocumentArgs;
  protected _types: ResponsiveObject<DataType> = Responsive<DataType>({});

  constructor(schema: OpraSchema.Document) {
    this._args = _.omit(schema, 'types');
    if (schema.types)
      this._addDataTypes(schema.types);
  }

  get name(): string {
    return this._args.info?.title || '';
  }

  get info(): OpraSchema.DocumentInfo {
    return this._args.info;
  }

  get types(): Record<string, DataType> {
    return this._types;
  }

  getDataType(name: string): DataType {
    const t = this.types[name];
    if (!t)
      throw new Error(`Data type "${name}" does not exists`);
    return t;
  }

  toString(): string {
    return `[${Object.getPrototypeOf(this).constructor.name} ${this.name}]`;
  }

  [nodeInspectCustom](): string {
    return `[${colorFgYellow + Object.getPrototypeOf(this).constructor.name + colorReset}` +
        ` ${colorFgMagenta + this.name + colorReset}]`;
  }

  static async create(args: SchemaGenerator.GenerateDocumentArgs): Promise<OpraDocument> {
    const schema = await SchemaGenerator.generateDocumentSchema(args);
    return new OpraDocument(schema);
  }

  protected _addDataTypes(dataTypes: OpraSchema.DataType[]): void {
    const recursiveSet = new Set();
    const nameSet = new Set(dataTypes.map(x => x.name));

    const processDataType = (schema: OpraSchema.DataType) => {
      if ((!internalDataTypes.has(schema.name) && !nameSet.has(schema.name)) || this.types[schema.name])
        return;
      if (recursiveSet.has(schema.name))
        throw new TypeError(`Recursive dependency detected. ${Array.from(recursiveSet).join('>')}`);
      recursiveSet.add(schema.name);
      let baseType: DataType | undefined;
      if (schema.base) {
        if (!this.types[schema.base]) {
          const baseSchema = dataTypes.find(dt => dt.name.toLowerCase() === schema.base?.toLowerCase()) ||
              internalDataTypes.get(schema.base.toLowerCase());
          if (!baseSchema)
            throw new TypeError(`Base schema (${schema.base}) of data type "${schema.name}" does not exists`);
          baseType = processDataType(baseSchema);
        }
      }
      let dataType: DataType;
      if (OpraSchema.isSimpleType(schema)) {
        if (baseType && !(baseType instanceof SimpleType))
          throw new TypeError(`Can't extend a SimpleType (${schema.name}) from a ComplexType "${baseType.name}"`);
        dataType = new SimpleType(schema, baseType);
      } else {
        if (baseType && !(baseType instanceof ComplexType))
          throw new TypeError(`Can't extend a ComplexType (${schema.name}) from a SimpleType "${baseType.name}"`);
        dataType = new ComplexType(schema, baseType);
      }
      nameSet.delete(schema.name);
      this.types[dataType.name] = dataType;
      recursiveSet.delete(schema.name);
      return dataType;
    }
    dataTypes.forEach(dataType => processDataType(dataType));

    // Sort data types by name
    const newTypes = Responsive<DataType>({});
    Object.keys(this.types).sort()
        .forEach(name => newTypes[name] = this.types[name]);
    this._types = newTypes;
  }

}
