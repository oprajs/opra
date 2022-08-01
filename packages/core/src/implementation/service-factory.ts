import 'reflect-metadata';
import { Type } from 'ts-gems';
import { OpraSchema, PropertyMetadata } from '@opra/common';
import {
  DTO_METADATA,
  DTO_PROPERTIES,
  RESOURCE_METADATA,
  RESOURCE_OPERATION,
  RESOURCE_OPERATION_METHODS
} from '../constants';
import { isConstructor, resolveClassAsync } from '../helpers/class-utils';
import { OpraService } from '../interfaces/opra-service.interface';
import { ThunkAsync } from '../types';
import { ComplexType } from './data-type/complex-type';
import { DataType } from './data-type/data-type';
import { SimpleType } from './data-type/simple-type';
import { EntityResource } from './resource/entity-resource';
import { OpraServiceHost, OpraServiceHostArgs } from './service-host';

export namespace OpraServiceFactory {

  export type CreateServiceArgs = OpraServiceHostArgs & {
    types?: ThunkAsync<Type | OpraSchema.DataType>[];
    resources: any[];
  }

  export async function create(args: CreateServiceArgs): Promise<OpraService> {
    const service = new OpraServiceHost(args);

    // Build array of DataType and Resource maps
    const dataTypes: Record<string, OpraSchema.DataType> = {};
    const resources: Record<string, OpraSchema.Resource> = {};
    if (args.types) {
      for (const thunk of args.types) {
        await addDataType(service, dataTypes, thunk);
      }
    }
    if (args.resources) {
      for (const resource of args.resources) {
        await addResource(service, resources, dataTypes, resource);
      }
    }

    // Create DataType instances and add to service
    const nameArray = Object.keys(dataTypes).sort();
    const nameSet = new Set(nameArray);
    const recursiveSet = new Set();
    const processDataType = (schema: OpraSchema.DataType) => {
      if ((!internalDataTypes.has(schema.name) && !nameSet.has(schema.name)) || service.types[schema.name])
        return;
      if (recursiveSet.has(schema.name))
        throw new TypeError(`Recursive dependency detected. ${Array.from(recursiveSet).join('>')}`);
      recursiveSet.add(schema.name);
      let baseType: DataType | undefined;
      if (schema.base) {
        if (!service.types[schema.base]) {
          const baseSchema = dataTypes[schema.base] || internalDataTypes.get(schema.base.toLowerCase());
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
      service.types[dataType.name] = dataType;
      recursiveSet.delete(schema.name);
      return dataType;
    }
    nameArray.forEach(k => processDataType(dataTypes[k]));

    // Create Resource instances and add to service

    for (const k of Object.keys(resources).sort()) {
      const r = resources[k];
      if (OpraSchema.isEntityResource(r)) {
        const dataType = service.getDataType(r.type);
        if (!dataType)
          throw new TypeError(`Datatype "${r.type}" declared in EntityResource (${r.name}) does not exists`);
        if (!(dataType instanceof ComplexType))
          throw new TypeError(`${r.type} is not an ComplexType`);
        service.resources[r.name] = new EntityResource({...r, dataType});
      } else
        throw new TypeError(`Unknown resource kind (${r.kind})`);
    }

    return service;
  }

  async function addDataType(
      service: OpraService,
      dataTypes: Record<string, OpraSchema.DataType>,
      thunk: ThunkAsync<Type | OpraSchema.DataType>
  ): Promise<OpraSchema.DataType> {

    let schema: OpraSchema.DataType | undefined;

    thunk = await thunk;
    if (typeof thunk === 'function' && !isConstructor(thunk))
      thunk = await thunk();

    if (!isConstructor(thunk) || OpraSchema.isDataType(thunk))
      throw new TypeError(`Function must return a type class or type schema`);

    if (isConstructor(thunk)) {
      const ctor = thunk;
      const metadata = Reflect.getOwnMetadata(DTO_METADATA, ctor);
      if (!metadata)
        throw new TypeError(`Class "${ctor}" has no type metadata`);

      schema = dataTypes[metadata.name];
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
      if (Reflect.hasMetadata(DTO_METADATA, baseCtor)) {
        while (!Reflect.hasOwnMetadata(DTO_METADATA, baseCtor)) {
          baseCtor = Object.getPrototypeOf(baseCtor);
        }
        const baseSchema = await addDataType(service, dataTypes, baseCtor);
        base = baseSchema.name;
      }

      if (OpraSchema.isComplexType(metadata)) {
        schema = {
          ...metadata,
          ctor,
          base
        };

        const properties: Record<string, PropertyMetadata> = Reflect.getMetadata(DTO_PROPERTIES, ctor.prototype);
        if (properties) {
          for (const [k, p] of Object.entries(properties)) {
            let type: string;
            if (isConstructor(p.type) && BuiltinClassMap.has(p.type))
              type = BuiltinClassMap.get(p.type);
            else if (typeof p.type === 'function' || typeof p.type === 'object') {
              const t = await addDataType(service, dataTypes, p.type);
              type = t.name;
            } else type = p.type || 'string';
            if (internalDataTypes.has(type) && !dataTypes[type])
              dataTypes[type] = internalDataTypes.get(type.toLowerCase()) as OpraSchema.DataType;
            schema.properties = schema.properties || {};
            schema.properties[k] = {...p, type};
          }
        }

      } else if (OpraSchema.isSimpleType(metadata)) {
        if (!SimpleTypeEnum.includes(metadata.type))
          throw new Error(`"type" of SimpleType schema must be one of enumerated value (${SimpleTypeEnum})`);
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

    dataTypes[schema.name] = schema;
    return schema;
  }

  async function addResource(
      service: OpraService,
      resources: Record<string, OpraSchema.Resource>,
      dataTypes: Record<string, OpraSchema.DataType>,
      args: any
  ): Promise<void> {
    const proto = Object.getPrototypeOf(args);
    const ctor = proto.constructor;
    const metadata = Reflect.getMetadata(RESOURCE_METADATA, ctor);
    if (!metadata && !OpraSchema.isResource(args))
      throw new Error(`Not a Resource object`);

    if (metadata) {
      const name = metadata.name || ctor.name.replace(/Resource$/, '');
      const t = typeof metadata.type === 'function'
          ? await resolveClassAsync(metadata.type)
          : metadata.type;
      const type = typeof t === 'function'
          ? (await addDataType(service, dataTypes, t)).name
          : t;

      args = {
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
          const opr = args[operationMetadata.operation] = {...operationMetadata, handle: method.bind(args)};
          delete opr.operation;
        }
      }

    }

    if (OpraSchema.isResource(args)) {
      if (OpraSchema.isEntityResource(args)) {
        const t = dataTypes[args.type];
        if (!t)
          throw new Error(`Resource registration error. Type "${args.type}" not found.`);
        if (resources[args.name])
          throw new Error(`An other instance of "${args.name}" resource previously defined`);
        resources[args.name] = args;
        return;
      }
      throw new Error(`Invalid resource metadata`);
    }
  }


  const SimpleTypeEnum = ['boolean', 'number', 'integer', 'string'];

  const BuiltinClassMap = new Map();
  BuiltinClassMap.set(Boolean, 'boolean');
  BuiltinClassMap.set(Number, 'number');
  BuiltinClassMap.set(String, 'string');
  BuiltinClassMap.set(Buffer, 'buffer');

  const internalDataTypes = new Map<string, OpraSchema.DataType>();
  const internalDataTypeArray: OpraSchema.DataType[] = [
    {
      kind: 'SimpleType',
      name: 'boolean',
      type: 'boolean',
      description: 'Simple true/false value'
    },
    {
      kind: 'SimpleType',
      name: 'number',
      type: 'number',
      description: 'Both Integer as well as Floating-Point numbers'
    },
    {
      kind: 'SimpleType',
      name: 'string',
      type: 'string',
      description: 'A sequence of characters'
    },
    {
      kind: 'ComplexType',
      name: 'object',
      description: 'Object type with additional properties',
      additionalProperties: true
    },
    {
      kind: 'SimpleType',
      name: 'integer',
      type: 'number',
      base: 'number',
      description: 'Integer number'
    }
  ];
  internalDataTypeArray.forEach(sch => internalDataTypes.set(sch.name, sch));

}
