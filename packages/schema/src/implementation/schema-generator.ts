import { StrictOmit, Type } from 'ts-gems';
import { isPromise } from 'util/types';
import { IGNORE_RESOLVER_METHOD, RESOLVER_METADATA, RESOURCE_METADATA } from '../constants.js';
import { builtinClassMap, primitiveDataTypeNames } from '../helpers/internal-types.js';
import { OpraSchema } from '../interfaces/opra-schema.interface.js';
import { ThunkAsync } from '../types.js';
import { isConstructor, resolveClassAsync } from '../utils/class.utils.js';
import { extractComplexTypeMetadata } from '../utils/extract-metadata.util.js';

export namespace SchemaGenerator {

  export type GenerateDocumentArgs = StrictOmit<OpraSchema.Document, 'version' | 'types'> & {
    types?: ThunkAsync<Type | OpraSchema.DataType>[];
  }

  export type GenerateServiceArgs = StrictOmit<OpraSchema.Service, 'version' | 'types' | 'resources'> & {
    types?: ThunkAsync<Type | OpraSchema.DataType>[];
    resources: any[];
  }

}

const entityMethods = ['search', 'count', 'create', 'get', 'update', 'updateMany', 'delete', 'deleteMany'];

export class SchemaGenerator {
  protected _dataTypes: Record<string, OpraSchema.DataType> = {};
  protected _resources: Record<string, OpraSchema.Resource> = {};

  protected constructor() {
    //
  }

  protected async addDataType(thunk: ThunkAsync<Type | OpraSchema.DataType>): Promise<OpraSchema.DataType> {

    thunk = isPromise(thunk) ? await thunk : thunk;
    if (typeof thunk === 'function') {
      if (!isConstructor(thunk))
        return this.addDataType(await thunk());

      const m = extractComplexTypeMetadata(thunk);
      if (m.extends) {
        for (const imp of m.extends) {
          if (typeof imp.type !== 'string') {
            const baseSchema = await this.addDataType(imp.type);
            imp.type = baseSchema.name;
          }
        }
      }

      if (m.fields) {
        for (const prop of Object.values(m.fields)) {
          if (prop.type && typeof prop.type !== 'string') {
            const type = isConstructor(prop.type) ? await resolveClassAsync(prop.type) : undefined;
            const s = type && builtinClassMap.get(type);
            if (s)
              prop.type = s;
            else {
              const propSchema = await this.addDataType(prop.type);
              prop.type = propSchema.name;
            }
          }
        }
      }
      return this.addDataType(m as OpraSchema.ComplexType);
    }

    if (!OpraSchema.isDataType(thunk))
      throw new TypeError(`Invalid data type schema`);

    // Check if datatype previously added
    const currentSchema = this._dataTypes[thunk.name];
    if (currentSchema) {
      if (!(currentSchema.kind === thunk.kind && currentSchema.ctor && currentSchema.ctor === thunk.ctor))
        throw new Error(`An other instance of "${currentSchema.name}" data type previously defined`);
      return currentSchema;
    }

    if (OpraSchema.isSimpleType(thunk) && !primitiveDataTypeNames.includes(thunk.type))
      throw new Error(`"type" of SimpleType schema must be one of enumerated value (${primitiveDataTypeNames})`);

    return this._dataTypes[thunk.name] = {
      ...thunk
    };
  }

  async addResource(instance: any): Promise<void> {
    if (isConstructor(instance))
      throw new Error(`You should provide Resource instance instead of Resource class`);
    const proto = Object.getPrototypeOf(instance);
    const ctor = proto.constructor;
    const metadata = Reflect.getMetadata(RESOURCE_METADATA, ctor);

    let resourceSchema: OpraSchema.Resource;
    if (metadata) {
      const name = metadata.name || ctor.name.replace(/Resource$/, '');
      const t = typeof metadata.type === 'function'
          ? await resolveClassAsync(metadata.type)
          : metadata.type;
      const type = typeof t === 'function'
          ? (await this.addDataType(t)).name
          : t;

      resourceSchema = {
        ...metadata,
        type,
        name,
        methods: {}
      }

      if (OpraSchema.isEntityResource(resourceSchema)) {
        for (const methodName of entityMethods) {
          let fn = instance[methodName];
          if (typeof fn === 'function') {
            const info: OpraSchema.MethodResolver = resourceSchema.methods[methodName] = {
              ...Reflect.getMetadata(RESOLVER_METADATA, proto, methodName)
            };
            if (!Reflect.hasMetadata(IGNORE_RESOLVER_METHOD, proto.constructor, methodName)) {
              info.handler = fn.bind(instance);
              fn = instance['pre_' + methodName];
              if (typeof fn === 'function')
                resourceSchema['pre_' + methodName] = fn.bind(instance);
            }
          }
        }
      }
    } else resourceSchema = instance;

    if (OpraSchema.isResource(resourceSchema)) {
      if (OpraSchema.isEntityResource(resourceSchema)) {
        const t = this._dataTypes[resourceSchema.type];
        if (!t)
          throw new Error(`Resource registration error. Type "${resourceSchema.type}" not found.`);
        if (this._resources[resourceSchema.name])
          throw new Error(`An other instance of "${resourceSchema.name}" resource previously defined`);
        this._resources[resourceSchema.name] = resourceSchema;
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
