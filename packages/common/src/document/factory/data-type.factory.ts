import { ThunkAsync, Type } from 'ts-gems';
import { validator } from 'valgen';
import { cloneObject, resolveThunk, ResponsiveMap } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocumentElement } from '../api-document-element';
import { DATATYPE_METADATA, DECODER, ENCODER } from '../constants.js';
import { ComplexType } from '../data-type/complex-type.js';
import { DataType } from '../data-type/data-type.js';
import { EnumType } from '../data-type/enum-type.js';
import { ApiField } from '../data-type/field.js';
import { MappedType } from '../data-type/mapped-type.js';
import { MixinType } from '../data-type/mixin-type.js';
import { SimpleType } from '../data-type/simple-type.js';
import type { ApiDocumentFactory } from './api-document.factory';

/**
 * @namespace DataTypeFactory
 */
export namespace DataTypeFactory {

  export type DataTypeInitializer =
      (ComplexType.InitArguments & { kind: OpraSchema.ComplexType.Kind })
      | (SimpleType.InitArguments & { kind: OpraSchema.SimpleType.Kind })
      | (MixinType.InitArguments & { kind: OpraSchema.MixinType.Kind })
      | (MappedType.InitArguments & { kind: OpraSchema.MappedType.Kind })
      | (EnumType.InitArguments & { kind: OpraSchema.EnumType.Kind })
      ;

  export interface Context extends ApiDocumentFactory.Context {
    typeQueue?: ResponsiveMap<any>;
  }
}

const initializingSymbol = Symbol('initializing');

/**
 * @class DataTypeFactory
 */
export class DataTypeFactory {

  constructor(public target: ApiDocumentElement) {
  }

  async importAllDataTypes(
      context: ApiDocumentFactory.Context,
      types: ThunkAsync<Type | EnumType.EnumObject | EnumType.EnumArray>[] | Record<string, OpraSchema.DataType | DataType.Metadata | Type>,
  ): Promise<void> {
    const typeQueue = new ResponsiveMap<any>();
    const ctx: DataTypeFactory.Context = {...context, typeQueue};

    // Add type sources into typeQueue
    if (Array.isArray(types)) {
      let i = 0;
      for (let thunk of types) {
        ctx.curPath.push(`/[${i}]`);
        thunk = await resolveThunk(thunk);
        const metadata = Reflect.getMetadata(DATATYPE_METADATA, thunk) || thunk[DATATYPE_METADATA];
        if (!(metadata && metadata.name))
          throw new TypeError(`Metadata information not found at types[${i++}] "${String(thunk)}"`);
        typeQueue.set(metadata.name, thunk);
        ctx.curPath.pop();
      }
    } else {
      let thunk: any;
      let name: string;
      for ([name, thunk] of Object.entries(types)) {
        thunk = await resolveThunk(thunk);
        typeQueue.set(name, typeof thunk === 'object' ? {...thunk, name} : thunk);
      }
    }

    // Create type instances
    for (const name of Array.from(typeQueue.keys())) {
      const thunk = typeQueue.get(name);
      if (!thunk)
        continue;
      const dt = await this.createDataType(ctx, thunk);
      if (dt.isEmbedded)
        throw new TypeError(`Embedded data type can't be loaded into document node directly (${thunk})`);
      this.target.types.set(name, dt);
    }
    this.target.types.sort();
  }

  async createDataType(
      context: DataTypeFactory.Context,
      thunk: ThunkAsync<string | Type | EnumType.EnumObject | EnumType.EnumArray | OpraSchema.DataType>
  ): Promise<DataType> {
    thunk = await resolveThunk(thunk);
    let name = '';
    let ctor: Type | undefined;
    let initArguments: any;

    if (typeof thunk === 'string') {
      name = thunk;
      const dataType = this.target.findDataType(name);
      if (dataType && !dataType?.[initializingSymbol]) return dataType;
      thunk = context.typeQueue?.get(name);
    }

    if (typeof thunk === 'function') {
      // Check if type class already loaded
      const dataType = this.target.findDataType(thunk);
      if (dataType && !dataType?.[initializingSymbol]) return dataType;
      const metadata = Reflect.getMetadata(DATATYPE_METADATA, thunk);
      if (!metadata)
        throw new TypeError(`Class "${thunk.name}" doesn't have a valid DataType metadata`);
      initArguments = cloneObject(metadata);
      ctor = thunk as Type;
      if (initArguments.kind === 'SimpleType')
        initArguments.instance = new ctor();
    } else if (typeof thunk === 'object') {
      if (OpraSchema.isDataType(thunk)) {
        name = (thunk as any).name;
        ctor = (thunk as any).ctor || ctor;
        initArguments = cloneObject(thunk) as any;
      } else {
        // It may be an enum object
        let metadata = thunk[DATATYPE_METADATA];
        if (metadata) {
          initArguments = cloneObject(metadata);
          initArguments.instance = thunk;
        } else {
          // Or may be an data type instance
          ctor = Object.getPrototypeOf(thunk).constructor;
          metadata = ctor && Reflect.getMetadata(DATATYPE_METADATA, ctor);
          if (metadata) {
            initArguments = cloneObject(metadata);
            initArguments.base = this.target.getDataType(initArguments.name);
            initArguments.instance = thunk;
            initArguments.embedded = true;
          }
        }
        if (!metadata)
          throw new TypeError(`No DataType metadata found for object ${JSON.stringify(thunk).substring(0, 20)}...`);
      }
    }
    name = initArguments?.embedded ? undefined : initArguments?.name || name;

    let dataType = !initArguments?.embedded && (name || ctor)
        ? this.target.findDataType((name || ctor) as any) : undefined;
    if (dataType?.[initializingSymbol])
      throw new TypeError('Circular reference detected');
    if (dataType)
      return dataType;

    if (name)
      context.curPath.push(`[${name}]`);

    if (!initArguments)
      throw new TypeError(`No DataType schema determined`);

    // Create an empty DataType instance and add in to document.
    // This will help us for circular dependent data types
    dataType = this.createDataTypeInstance(initArguments.kind, name);
    dataType[initializingSymbol] = true;
    if (context.typeQueue?.has(name)) {
      this.target.types.set(name, dataType);
      context.typeQueue.delete(name);
    } else if (!dataType.isEmbedded)
      throw new TypeError(`Data Type (${name}) must be explicitly added to type list in the document scope`);

    await this.prepareDataTypeInitArguments(context, initArguments, ctor);

    if (dataType instanceof SimpleType)
      SimpleType.apply(dataType, [this.target, initArguments] as any);
    else if (dataType instanceof EnumType)
      EnumType.apply(dataType, [this.target, initArguments] as any);
    else if (dataType instanceof MappedType)
      MappedType.apply(dataType, [this.target, initArguments] as any);
    else if (dataType instanceof MixinType)
      MixinType.apply(dataType, [this.target, initArguments] as any);
    else if (dataType instanceof ComplexType) {
      if (typeof initArguments.additionalFields === 'function')
        initArguments.additionalFields = await this.createDataType(context, initArguments.additionalFields);
      ComplexType.apply(dataType, [this.target, initArguments] as any);
    } else
      throw new TypeError(`Invalid data type schema: ${String(initArguments)}`);

    delete dataType[initializingSymbol];

    if (name)
      context.curPath.pop();

    return dataType;

  }

  protected async prepareDataTypeInitArguments(
      context: ApiDocumentFactory.Context,
      schema: DataTypeFactory.DataTypeInitializer | OpraSchema.DataType,
      ctor?: Type
  ) {
    const initArguments = schema as DataTypeFactory.DataTypeInitializer;
    if (!initArguments.name)
      initArguments.embedded = true;

    // Import extending class first
    if (initArguments.kind === 'SimpleType' || initArguments.kind === 'ComplexType' ||
        initArguments.kind === 'EnumType'
    ) {
      if (ctor) {
        const baseClass = Object.getPrototypeOf(ctor.prototype).constructor;
        const baseMeta = Reflect.getMetadata(DATATYPE_METADATA, baseClass);
        if (baseMeta) {
          initArguments.base = await this.createDataType(context, baseClass) as any;
        }
      } else if (initArguments.base) {
        initArguments.base = await this.createDataType(context, initArguments.base as any) as any;
      }
    }

    if (initArguments.kind === 'ComplexType') {
      initArguments.ctor = ctor;
      if (initArguments.fields) {
        context.curPath.push('.fields');
        const srcFields = initArguments.fields as
            Record<string, OpraSchema.Field | ApiField.Metadata>;
        const trgFields: Record<string, ApiField.InitArguments> = initArguments.fields = {};
        for (const [fieldName, o] of Object.entries<any>(srcFields)) {
          context.curPath.push('.' + fieldName);
          const srcMeta: OpraSchema.Field | ApiField.Metadata = typeof o === 'string' ? {type: o} : o;

          const fieldInit = trgFields[fieldName] = {
            ...srcMeta,
            name: fieldName
          } as ApiField.InitArguments;

          if (srcMeta.isArray && !srcMeta.type)
            throw new TypeError(`"type" must be defined explicitly for array properties`);
          fieldInit.type = await this.createDataType(context, srcMeta.type || (srcMeta as any).designType || 'any');

          context.curPath.pop();
        }
        context.curPath.pop();
      }
    }

    if (initArguments.kind === 'MappedType') {
      context.curPath.push('.base');
      const dataType = await this.createDataType(context, initArguments.base as any);
      // istanbul ignore next
      if (!(dataType instanceof ComplexType))
        throw new TypeError('MappedType.base property must address to a ComplexType');
      initArguments.base = dataType;
      context.curPath.pop();
    }

    if (initArguments.kind === 'MixinType') {
      context.curPath.push('.types');
      const _initTypes = initArguments.types as any;
      initArguments.types = [];
      for (const type of _initTypes) {
        initArguments.types.push(await this.createDataType(context, type) as any);
      }
    }
    return initArguments;
  }

  protected createDataTypeInstance(kind: OpraSchema.DataType.Kind, name?: string): DataType {
    const dataType = {
      documentNode: this.target,
      kind,
      name
    } as unknown as DataType;
    if (!name)
      (dataType as any).isEmbedded = true;
    switch (kind) {
      case OpraSchema.ComplexType.Kind:
        Object.setPrototypeOf(dataType, ComplexType.prototype);
        break;
      case OpraSchema.EnumType.Kind:
        Object.setPrototypeOf(dataType, EnumType.prototype);
        break;
      case OpraSchema.MappedType.Kind:
        Object.setPrototypeOf(dataType, MappedType.prototype);
        break;
      case OpraSchema.SimpleType.Kind:
        Object.setPrototypeOf(dataType, SimpleType.prototype);
        break;
      case OpraSchema.MixinType.Kind:
        Object.setPrototypeOf(dataType, MixinType.prototype);
        break;
      default:
        throw new TypeError(`Unknown DataType kind (${kind})`);
    }
    return dataType;
  }


}
