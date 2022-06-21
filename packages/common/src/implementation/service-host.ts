import _ from 'lodash';
import { StrictOmit } from 'ts-gems';
import {
  RESOURCE_METADATA, RESOURCE_OPERATIONS,
  SCHEMA_METADATA,
  SCHEMA_PROPERTIES, SCHEMA_PROPERTY
} from '../constants';
import {
  OpraBaseResourceDef,
  OpraCollectionResourceDef,
  OpraResourceDef,
  OpraSchema,
  OpraServiceDef
} from '../definition';
import { isInternalClass, resolveClass } from '../helpers/class-utils';
import {
  isCollectionResourceMetadata,
  OpraResourceMetadata,
  OpraSchemaMetadata,
  OpraSchemaPropertyMetadata
} from '../interfaces';
import { TypeThunk } from '../types';


export type ServiceDefinitionGeneratorArgs = StrictOmit<OpraServiceDef, 'resources' | 'schemas'>;

export class OpraServiceHost implements OpraServiceDef {
  name: string;
  description?: string;
  prefix?: string;
  schemas: Record<string, OpraSchema>;
  resources: Record<string, OpraResourceDef>;

  constructor(args: ServiceDefinitionGeneratorArgs) {
    Object.assign(this, _.pick(args, ['name', 'description', 'prefix', 'schemas', 'resources']));
    this.schemas = this.schemas || {};
    this.resources = this.resources || {};
  }

  defineResource(ctorFn: TypeThunk): OpraBaseResourceDef | undefined {
    const ctor = resolveClass(ctorFn);
    const resourceMetadata: OpraResourceMetadata = Reflect.getMetadata(RESOURCE_METADATA, ctor);
    if (!resourceMetadata)
      throw new Error(`Class "${ctor.name}" has not been decorated to be a Opra Resource!`);

    if (this.resources[resourceMetadata.name])
      throw new Error(`Resource "${resourceMetadata.name}" previously added`);

    if (isCollectionResourceMetadata(resourceMetadata)) {
      const entityCtor = resolveClass(resourceMetadata.entityCtor);
      const schemaDef = this.defineSchema(entityCtor);
      const operations = Reflect.getMetadata(RESOURCE_OPERATIONS, ctor.prototype);
      const out: OpraCollectionResourceDef = {
        ...resourceMetadata,
        entitySchema: schemaDef.name,
        operations: {...operations}
      };
      this.resources[out.name] = out;
      return out;
    }
    throw new Error(`Unknown Resource Kind (${(resourceMetadata as any).resourceKind})`);
    /*
        const out: OpraBaseResourceDef = {
          ...resourceMetadata,
          resolvers: {}
        };
        const resolverNames = Reflect.getMetadata(RESOURCE_RESOLVERS, ctor.prototype);
        if (resolverNames) {
          for (const methodName of resolverNames) {
            const resolverMetadata = Reflect.getMetadata(RESOURCE_RESOLVER_METADATA, ctor.prototype, methodName);
            if (resolverMetadata) {
              out.resolvers[methodName] = resolverMetadata;
            }
          }
        }
        this.resources.push(out);
        return out;*/
  }

  defineSchema(ctorFn: TypeThunk): OpraSchema {
    const ctor = resolveClass(ctorFn);
    const schemaMetadata: OpraSchemaMetadata = Reflect.getMetadata(SCHEMA_METADATA, ctor);
    if (!schemaMetadata)
      throw new Error(`Class "${ctor.name}" has not been decorated to be a Opra Dto Schema!`);
    const curDef = this.schemas[schemaMetadata.name];
    if (curDef) {
      if (curDef.ctor !== ctor)
        throw new Error(`An other instance of Schema model (${schemaMetadata.name}) previously added`);
      return curDef;
    }
    const out: OpraSchema = {
      ...schemaMetadata,
      ctor,
      properties: {}
    };
    const propertyNames = Reflect.getMetadata(SCHEMA_PROPERTIES, ctor.prototype);
    for (const p of propertyNames) {
      const propMeta: OpraSchemaPropertyMetadata = Reflect.getMetadata(SCHEMA_PROPERTY, ctor.prototype, p);
      if (propMeta) {
        const subType = propMeta.type ? resolveClass(propMeta.type) : String;
        const def = out.properties[p] = {
          ...propMeta,
          type: subType
        };
        if (!isInternalClass(subType))
          this.defineSchema(def.type);
      }
    }
    this.schemas[out.name] = out;
    return out;
  }

  toJSON(): OpraServiceDef {
    return {
      name: this.name,
      description: this.description,
      prefix: this.prefix,
      resources: {...this.resources},
      schemas: {...this.schemas}
    }
  }
}
