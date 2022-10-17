import { StrictOmit, Type } from 'ts-gems';
import { isPromise } from 'util/types';
import * as Optionals from '@opra/optionals';
import { IGNORE_RESOLVER_METHOD, RESOLVER_METADATA, RESOURCE_METADATA } from '../constants.js';
import { ResponsiveMap } from '../helpers/responsive-map.js';
import { ComplexTypeMetadata } from '../interfaces/metadata/data-type.metadata.js';
import { OpraSchema } from '../opra-schema.js';
import { ThunkAsync } from '../types.js';
import { isConstructor, resolveClassAsync } from '../utils/class.utils.js';
import { extractComplexTypeMetadata } from '../utils/extract-metadata.util.js';
import { builtinClassMap, primitiveDataTypeNames } from './data-type/internal-data-types.js';

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
  protected _dataTypes = new ResponsiveMap<string, OpraSchema.DataType>();
  protected _resources = new ResponsiveMap<string, OpraSchema.Resource>();

  protected constructor() {
    //
  }

  protected async addDataType(thunk: ThunkAsync<Type | OpraSchema.DataType>): Promise<OpraSchema.DataType> {

    thunk = isPromise(thunk) ? await thunk : thunk;
    if (typeof thunk === 'function') {
      if (!isConstructor(thunk))
        return this.addDataType(await thunk());

      let m = await extractComplexTypeMetadata(thunk);
      if (m.extends) {
        for (const imp of m.extends) {
          if (typeof imp.type !== 'string') {
            const baseSchema = await this.addDataType(imp.type);
            imp.type = baseSchema.name;
          }
        }
      }

      const cur = this._dataTypes.get(m.name);
      m = await this.addDataType(m as OpraSchema.ComplexType) as ComplexTypeMetadata;
      /* Prevents circular calls */
      if (cur === m)
        return cur;

      if (m.fields) {
        for (const field of Object.values(m.fields)) {
          if (field.type && typeof field.type !== 'string') {
            const type = isConstructor(field.type) ? await resolveClassAsync(field.type) : undefined;
            const s = type && builtinClassMap.get(type);
            if (s)
              field.type = s.name;
            else {
              const propSchema = await this.addDataType(field.type);
              field.type = propSchema.name;
            }
          }
        }
      }

      return m as OpraSchema.ComplexType;
    }

    if (!OpraSchema.isDataType(thunk))
      throw new TypeError(`Invalid data type schema`);

    // Check if datatype previously added
    const currentSchema = this._dataTypes.get(thunk.name);
    if (currentSchema) {
      if (!(currentSchema.kind === thunk.kind && currentSchema.ctor && currentSchema.ctor === thunk.ctor))
        throw new Error(`An other instance of "${currentSchema.name}" data type previously defined`);
      return currentSchema;
    }

    if (OpraSchema.isSimpleType(thunk) && !primitiveDataTypeNames.includes(thunk.type))
      throw new Error(`"type" of SimpleType schema must be one of enumerated value (${primitiveDataTypeNames})`);

    const out = {
      ...thunk
    };
    this._dataTypes.set(thunk.name, out);
    return out;
  }

  async addResource(instance: any): Promise<void> {
    if (isConstructor(instance))
      instance = new instance();

    const proto = Object.getPrototypeOf(instance);
    const ctor = proto.constructor;
    const metadata = Reflect.getMetadata(RESOURCE_METADATA, ctor);

    let resourceSchema: OpraSchema.Resource;
    if (metadata) {
      const name = metadata.name || ctor.name.replace(/(Resource|Controller)$/, '');
      const t = typeof metadata.type === 'function'
          ? await resolveClassAsync(metadata.type)
          : metadata.type;
      const type = typeof t === 'function'
          ? (await this.addDataType(t)).name
          : t;

      resourceSchema = {
        ...metadata,
        instance,
        type,
        name,
        methods: {}
      }

      if (OpraSchema.isEntityResource(resourceSchema)) {
        // Determine keyFields if not set
        if (!resourceSchema.keyFields) {
          const entity = this._dataTypes.get(type);
          if (Optionals.SqbConnect && entity?.ctor) {
            const sqbEntity = Optionals.SqbConnect.EntityMetadata.get(entity?.ctor);
            if (sqbEntity?.indexes) {
              const primaryIndex = sqbEntity.indexes.find(x => x.primary);
              if (primaryIndex) {
                resourceSchema.keyFields = primaryIndex.columns;
              }
            }
          }
          resourceSchema.keyFields = Array.isArray(resourceSchema.keyFields)
              ? (resourceSchema.keyFields.length ? resourceSchema.keyFields : '')
              : resourceSchema.keyFields;
          if (!resourceSchema.keyFields)
            throw new TypeError(`You must provide keyFields for "${resourceSchema.name}" entity resource`);
        }
        let methodMetadata;
        let fn;
        const locateFn = (inst, methodName: string) => {
          fn = inst[methodName];
          methodMetadata = Reflect.getMetadata(RESOLVER_METADATA, inst, methodName);
          if (fn == null) {
            if (methodMetadata) {
              inst = Object.getPrototypeOf(inst);
              fn = inst[methodName];
            }
          }
        }
        for (const methodName of entityMethods) {
          locateFn(instance, methodName);
          if (typeof fn !== 'function')
            continue;
          const info: OpraSchema.MethodResolver = resourceSchema.methods[methodName] = {
            ...methodMetadata
          };
          if (!Reflect.hasMetadata(IGNORE_RESOLVER_METHOD, proto.constructor, methodName)) {
            info.handler = fn.bind(instance);
            fn = instance['pre_' + methodName];
            if (typeof fn === 'function')
              resourceSchema['pre_' + methodName] = fn.bind(instance);
          }
        }
      }
    } else resourceSchema = instance;

    if (OpraSchema.isResource(resourceSchema)) {
      if (OpraSchema.isEntityResource(resourceSchema)) {
        if (!this._dataTypes.has(resourceSchema.type))
          throw new Error(`Resource registration error. Type "${resourceSchema.type}" not found.`);
        if (this._resources.has(resourceSchema.name))
          throw new Error(`An other instance of "${resourceSchema.name}" resource previously defined`);
        this._resources.set(resourceSchema.name, resourceSchema);
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

    const types = Array.from(generator._dataTypes.keys()).sort()
        .map(name => generator._dataTypes.get(name) as OpraSchema.DataType);

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

    const types = Array.from(generator._dataTypes.keys()).sort()
        .map(name => generator._dataTypes.get(name) as OpraSchema.DataType);

    const resources = Array.from(generator._resources.keys()).sort()
        .map(name => generator._resources.get(name) as OpraSchema.Resource);

    return {
      version: '1',
      ...args,
      types,
      resources
    }
  }

}
