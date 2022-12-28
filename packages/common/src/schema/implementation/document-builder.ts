import { isPromise } from 'putil-promisify';
import { Type } from 'ts-gems';
import * as Optionals from '@opra/optionals';
import { ResponsiveMap } from '../../helpers/responsive-map.js';
import { OpraSchema } from '../opra-schema.definition.js';
import { ThunkAsync } from '../types.js';
import { isConstructor } from '../utils/class.utils.js';
import { builtInTypes, primitiveClasses } from './data-type/builtin-data-types.js';
import { extractResourceSchema } from './schema-builder/extract-resource-metadata.util.js';
import { extractDataTypeSchema } from './schema-builder/extract-type-metadata.util.js';

export type DocumentBuilderArgs = Pick<OpraSchema.Document, 'info' | 'servers'>;

export class DocumentBuilder {
  protected _args: DocumentBuilderArgs;
  protected _dataTypes = new ResponsiveMap<string, OpraSchema.DataType>();
  protected _resources = new ResponsiveMap<string, OpraSchema.Resource>();

  constructor(args: DocumentBuilderArgs) {
    this._args = args;
  }

  buildSchema(): OpraSchema.Document {
    const out: OpraSchema.Document = {
      ...this._args,
      version: OpraSchema.Version,
    }
    if (this._dataTypes.size)
      out.types = Array.from(this._dataTypes.keys()).sort()
          .reduce((target, name) => {
            target[name] = this._dataTypes.get(name) as OpraSchema.DataType;
            return target;
          }, {});
    if (this._resources.size)
      out.resources = Array.from(this._resources.keys()).sort()
          .reduce((target, name) => {
            target[name] = this._resources.get(name) as OpraSchema.Resource;
            return target;
          }, {});
    return out;
  }

  async addDataTypeSchema(name: string, schema: OpraSchema.DataType): Promise<void> {
    if (!OpraSchema.isDataType(schema))
      throw new TypeError(`Invalid DataType schema`);

    const currentSchema = this._dataTypes.get(name);
    if (currentSchema) {
      if (!(currentSchema.kind === schema.kind && currentSchema.ctor && currentSchema.ctor === schema.ctor))
        throw new Error(`An other instance of "${name}" data type previously defined`);
      return;
    }
    this._dataTypes.set(name, schema);

    if (OpraSchema.isComplexType(schema)) {
      if (schema.extends) {
        for (const imp of schema.extends) {
          // noinspection SuspiciousTypeOfGuard
          if (typeof imp.type !== 'string') {
            imp.type = await this.addDataTypeClass(imp.type);
          }
        }
      }
      if (schema.fields) {
        for (const field of Object.values(schema.fields)) {
          field.type = field.type || 'string';
          // noinspection SuspiciousTypeOfGuard
          if (typeof field.type !== 'string') {
            field.type = await this.addDataTypeClass(field.type);
          }
        }
      }
    }
  }

  async addDataTypeClass(thunk: ThunkAsync<Type | Function>): Promise<string> {
    thunk = isPromise(thunk) ? await thunk : thunk;
    if (!isConstructor(thunk))
      return this.addDataTypeClass(thunk());
    const internalTypeName = primitiveClasses.get(thunk);
    if (internalTypeName)
      return internalTypeName;
    const namedSchema = await extractDataTypeSchema(thunk);
    const name = namedSchema.name;
    const schema = namedSchema;
    delete (schema as any).name;
    await this.addDataTypeSchema(name, schema);
    return name;
  }

  async addResourceSchema(name: string, schema: OpraSchema.Resource): Promise<void> {
    if (!OpraSchema.isResource(schema))
      throw new TypeError(`Invalid Resource schema`);

    if (this._resources.has(name))
      throw new Error(`An other instance of "${name}" resource previously defined`);

    if (OpraSchema.isCollectionResource(schema) || OpraSchema.isSingletonResource(schema)) {
      const type = typeof schema.type === 'function'
          ? await this.addDataTypeClass(schema.type)
          : schema.type;
      schema.type = type;
      if (!(this._dataTypes.has(schema.type) || builtInTypes.has(schema.type)))
        throw new Error(`Resource registration error. Type "${schema.type}" not found.`);
    }

    if (OpraSchema.isCollectionResource(schema)) {
      // Determine keyFields if not set
      if (!schema.keyFields) {
        const dataType = this._dataTypes.get(schema.type);
        if (Optionals.SqbConnect && dataType?.ctor) {
          const sqbEntity = Optionals.SqbConnect.EntityMetadata.get(dataType?.ctor);
          if (sqbEntity?.indexes) {
            const primaryIndex = sqbEntity.indexes.find(x => x.primary);
            if (primaryIndex) {
              schema.keyFields = primaryIndex.columns;
            }
          }
        }
        schema.keyFields = Array.isArray(schema.keyFields)
            ? (schema.keyFields.length ? schema.keyFields : '')
            : schema.keyFields;
        if (!schema.keyFields)
          throw new TypeError(`You must provide keyFields for "${name}" entity resource`);
      }
    }
    this._resources.set(name, schema);
  }

  async addResourceInstance(thunk: ThunkAsync<any>): Promise<string> {
    thunk = isPromise(thunk) ? await thunk : thunk;
    let instance: {};
    if (typeof thunk === 'function') {
      if (isConstructor(thunk)) {
        instance = {};
        Object.setPrototypeOf(instance, thunk.prototype);
      } else {
        instance = await thunk();
      }
    } else instance = thunk;
    const namedSchema = await extractResourceSchema(instance);
    const name = namedSchema.name;
    const schema = namedSchema;
    delete (schema as any).name;
    await this.addResourceSchema(name, schema);
    return name;
  }

}
