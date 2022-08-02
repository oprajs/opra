import { StrictOmit, Type } from 'ts-gems';
import { DATATYPE_METADATA, DATATYPE_PROPERTIES, OpraSchema, PropertyMetadata } from '@opra/common';
import { RESOURCE_METADATA, RESOURCE_OPERATION, RESOURCE_OPERATION_METHODS } from '../constants';
import { isConstructor, resolveClassAsync } from '../helpers/class-utils';
import { builtinClassMap, internalDataTypes, primitiveDataTypeNames } from '../helpers/internal-data-types';
import { ThunkAsync } from '../types';

export namespace SchemaGenerator {

  export type GenerateDocumentArgs = StrictOmit<OpraSchema.Document, 'version' | 'types'> & {
    types?: ThunkAsync<Type | OpraSchema.DataType>[];
  }

  export type GenerateServiceArgs = StrictOmit<OpraSchema.Service, 'version' | 'types' | 'resources'> & {
    types?: ThunkAsync<Type | OpraSchema.DataType>[];
    resources: any[];
  }

}

export class SchemaGenerator {
  protected _dataTypes: Record<string, OpraSchema.DataType> = {};
  protected _resources: Record<string, OpraSchema.Resource> = {};

  protected constructor() {
    //
  }

  protected async addDataType(thunk: ThunkAsync<Type | OpraSchema.DataType>): Promise<OpraSchema.DataType> {
    let schema: OpraSchema.DataType | undefined;

    thunk = await thunk;
    if (typeof thunk === 'function' && !isConstructor(thunk))
      thunk = await thunk();

    if (!isConstructor(thunk) || OpraSchema.isDataType(thunk))
      throw new TypeError(`Function must return a type class or type schema`);

    if (isConstructor(thunk)) {
      const ctor = thunk;
      const metadata = Reflect.getOwnMetadata(DATATYPE_METADATA, ctor);
      if (!metadata)
        throw new TypeError(`Class "${ctor}" has no type metadata`);

      schema = this._dataTypes[metadata.name];
      if (schema) {
        if (schema.kind !== metadata.kind ||
            (OpraSchema.isComplexType(schema) && schema.ctor !== ctor)
        )
          throw new Error(`An other instance of "${schema.name}" data type previously defined`);
        return schema;
      }

      // Add base data type
      let base: string | undefined;
      let baseCtor = Object.getPrototypeOf(ctor);
      if (Reflect.hasMetadata(DATATYPE_METADATA, baseCtor)) {
        while (!Reflect.hasOwnMetadata(DATATYPE_METADATA, baseCtor)) {
          baseCtor = Object.getPrototypeOf(baseCtor);
        }
        const baseSchema = await this.addDataType(baseCtor);
        base = baseSchema.name;
      }

      if (OpraSchema.isComplexType(metadata)) {
        schema = {
          ...metadata,
          ctor,
          base
        };

        const properties: Record<string, PropertyMetadata> = Reflect.getMetadata(DATATYPE_PROPERTIES, ctor.prototype);
        if (properties) {
          for (const [k, p] of Object.entries(properties)) {
            let type: string;
            if (isConstructor(p.type) && builtinClassMap.has(p.type))
              type = builtinClassMap.get(p.type);
            else if (typeof p.type === 'function' || typeof p.type === 'object') {
              const t = await this.addDataType(p.type);
              type = t.name;
            } else type = p.type || 'string';
            if (internalDataTypes.has(type) && !this._dataTypes[type])
              this._dataTypes[type] = internalDataTypes.get(type.toLowerCase()) as OpraSchema.DataType;
            schema.properties = schema.properties || {};
            schema.properties[k] = {...p, type};
          }
        }

      } else if (OpraSchema.isSimpleType(metadata)) {
        if (!primitiveDataTypeNames.includes(metadata.type))
          throw new Error(`"type" of SimpleType schema must be one of enumerated value (${primitiveDataTypeNames})`);
        schema = {
          ...metadata
        }
      } else
          /* istanbul ignore next */
        throw new TypeError(`Invalid metadata`);

    } else if (OpraSchema.isDataType(thunk)) {
      schema = thunk;
    } else
      throw new TypeError(`Invalid data type schema`);

    this._dataTypes[schema.name] = schema;
    return schema;
  }

  async addResource(thunk: any): Promise<void> {
    const proto = Object.getPrototypeOf(thunk);
    const ctor = proto.constructor;
    const metadata = Reflect.getMetadata(RESOURCE_METADATA, ctor);

    if (metadata) {
      const name = metadata.name || ctor.name.replace(/Resource$/, '');
      const t = typeof metadata.type === 'function'
          ? await resolveClassAsync(metadata.type)
          : metadata.type;
      const type = typeof t === 'function'
          ? (await this.addDataType(t)).name
          : t;

      thunk = {
        ...metadata,
        type,
        name
      }

      const operationMethods = Reflect.getMetadata(RESOURCE_OPERATION_METHODS, proto);
      if (operationMethods) {
        for (const methodName of operationMethods) {
          const method = proto[methodName];
          const operationMetadata = Reflect.getMetadata(RESOURCE_OPERATION, proto, methodName);
          /* istanbul ignore next */
          if (!(method && operationMetadata))
            continue;
          const opr = thunk[operationMetadata.operation] = {...operationMetadata, handle: method.bind(thunk)};
          delete opr.operation;
        }
      }
    }

    if (OpraSchema.isResource(thunk)) {
      if (OpraSchema.isEntityResource(thunk)) {
        const t = this._dataTypes[thunk.type];
        if (!t)
          throw new Error(`Resource registration error. Type "${thunk.type}" not found.`);
        if (this._resources[thunk.name])
          throw new Error(`An other instance of "${thunk.name}" resource previously defined`);
        this._resources[thunk.name] = thunk;
        return;
      }
      throw new Error(`Invalid resource metadata`);
    }
    throw new Error(`Invalid resource object`);
  }

  static async generateDocumentSchema(args: SchemaGenerator.GenerateDocumentArgs): Promise<OpraSchema.Document> {
    const generator = new SchemaGenerator();
    if (args.types) {
      for (const thunk of args.types) {
        await generator.addDataType(thunk);
      }
    }

    const types = Object.keys(generator._dataTypes).sort()
        .map(name => generator._dataTypes[name]);

    return {
      version: '1',
      ...args,
      types
    }
  }

  static async generateServiceSchema(args: SchemaGenerator.GenerateServiceArgs): Promise<OpraSchema.Service> {
    const generator = new SchemaGenerator();
    if (args.types) {
      for (const thunk of args.types) {
        await generator.addDataType(thunk);
      }
    }
    if (args.resources) {
      for (const resource of args.resources) {
        await generator.addResource(resource);
      }
    }

    const types = Object.keys(generator._dataTypes).sort()
        .map(name => generator._dataTypes[name]);

    const resources = Object.keys(generator._resources).sort()
        .map(name => generator._resources[name]);

    return {
      version: '1',
      ...args,
      types,
      resources
    }
  }

}
