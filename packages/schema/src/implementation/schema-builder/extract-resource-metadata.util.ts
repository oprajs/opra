import {
  collectionMethods,
  IGNORE_RESOLVER_METHOD,
  RESOLVER_METADATA,
  RESOURCE_METADATA, singletonMethods
} from '../../constants.js';
import { OpraSchema } from '../../opra-schema.definition.js';
import { Named } from '../../types.js';
import { cloneObject } from '../../utils/clone-object.util.js';

export async function extractResourceSchema(instance: object): Promise<Named<OpraSchema.Resource>> {
  const proto = Object.getPrototypeOf(instance);
  const ctor = proto.constructor;
  const metadata = Reflect.getMetadata(RESOURCE_METADATA, ctor);
  if (!metadata)
    throw new TypeError(`Class "${ctor.name}" doesn't have "Resource" metadata information`);

  const schema = cloneObject(metadata);
  schema.instance = instance;
  schema.name = metadata.name || ctor.name.replace(/(Resource|Controller)$/, '');

  if (OpraSchema.isCollectionResource(metadata))
    return await processCollectionResource(schema);
  if (OpraSchema.isSingletonResource(metadata))
    return await processSingletonResource(schema);

  throw new TypeError(`Invalid Resource metadata`);
}

async function processCollectionResource(schema: OpraSchema.CollectionResource): Promise<Named<OpraSchema.CollectionResource>> {

  const instance = schema.instance as any;
  const proto = Object.getPrototypeOf(schema.instance);

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
  for (const methodName of collectionMethods) {
    locateFn(instance, methodName);
    if (typeof fn !== 'function')
      continue;
    const info: OpraSchema.MethodResolver = schema[methodName] = {
      ...methodMetadata
    };
    if (!Reflect.hasMetadata(IGNORE_RESOLVER_METHOD, proto.constructor, methodName)) {
      info.handler = fn.bind(instance);
      fn = instance['pre_' + methodName];
      if (typeof fn === 'function')
        schema['pre_' + methodName] = fn.bind(instance);
    }
  }
  return schema as any;
}

async function processSingletonResource(schema: OpraSchema.SingletonResource): Promise<Named<OpraSchema.SingletonResource>> {

  const instance = schema.instance as any;
  const proto = Object.getPrototypeOf(schema.instance);

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
  for (const methodName of singletonMethods) {
    locateFn(instance, methodName);
    if (typeof fn !== 'function')
      continue;
    const info: OpraSchema.MethodResolver = schema[methodName] = {
      ...methodMetadata
    };
    if (!Reflect.hasMetadata(IGNORE_RESOLVER_METHOD, proto.constructor, methodName)) {
      info.handler = fn.bind(instance);
      fn = instance['pre_' + methodName];
      if (typeof fn === 'function')
        schema['pre_' + methodName] = fn.bind(instance);
    }
  }
  return schema as any;
}
