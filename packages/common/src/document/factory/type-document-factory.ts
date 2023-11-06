import { PartialSome, StrictOmit, Type } from 'ts-gems';
import { validator } from 'valgen';
import { cloneObject, isConstructor, resolveThunk, ResponsiveMap } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { ThunkAsync } from '../../types.js';
import type { ApiDocument } from '../api-document.js';
import { DATATYPE_METADATA } from '../constants.js';
import {
  AnyType, Base64Type, BigintType, BooleanType, DateType,
  IntegerType, NullType, NumberType, ObjectIdType, ObjectType,
  StringType, TimestampType, TimeType, UuidType
} from '../data-type/builtin/index.js';
import { ComplexType } from '../data-type/complex-type.js';
import { DataType } from '../data-type/data-type.js';
import { EnumType } from '../data-type/enum-type.js';
import { ApiField } from '../data-type/field.js';
import { MappedType } from '../data-type/mapped-type.js';
import { SimpleType } from '../data-type/simple-type.js';
import { UnionType } from '../data-type/union-type.js';
import { MetadataMode } from '../resource/enums/metadata-mode.enum.js';
import { OperationResult } from '../resource/types/operation-result.type.js';
import { TypeDocument } from '../type-document.js';

export namespace TypeDocumentFactory {
  export interface InitArguments extends PartialSome<StrictOmit<OpraSchema.TypeDocument, 'references' | 'types'>, 'version'> {
    references?: Record<string, string | OpraSchema.ApiDocument | ApiDocument>;
    types?: ThunkAsync<Type | EnumType.EnumObject | EnumType.EnumArray>[] | Record<string, OpraSchema.DataType>;
    noBuiltinTypes?: boolean;
  }

  export type DataTypeInitializer =
      (ComplexType.InitArguments & { kind: OpraSchema.ComplexType.Kind })
      | (SimpleType.InitArguments & { kind: OpraSchema.SimpleType.Kind })
      | (UnionType.InitArguments & { kind: OpraSchema.UnionType.Kind })
      | (MappedType.InitArguments & { kind: OpraSchema.MappedType.Kind })
      | (EnumType.InitArguments & { kind: OpraSchema.EnumType.Kind })
      ;
}

/**
 * @class TypeDocumentFactory
 */
export class TypeDocumentFactory {
  static designTypeMap = new Map<Function | Type, string>();

  protected document: TypeDocument;
  protected typeQueue = new ResponsiveMap<any>();
  protected circularRefs = new Map();
  protected curPath: string[] = [];
  protected cache = new Map<any, any>();

  /**
   * Creates ApiDocument instance from given schema object
   */
  static async createDocument(init: TypeDocumentFactory.InitArguments): Promise<TypeDocument> {
    const factory = new TypeDocumentFactory();
    const document = factory.document = new TypeDocument();
    await factory.initDocument(init);
    return document;
  }

  /**
   * Downloads schema from the given URL and creates the document instance   * @param url
   */
  static async createDocumentFromUrl(url: string): Promise<TypeDocument> {
    const factory = new TypeDocumentFactory();
    const document = factory.document = new TypeDocument();
    await factory.initDocumentFromUrl(url);
    return document;
  }

  protected async initDocument(
      init: TypeDocumentFactory.InitArguments
  ): Promise<TypeDocument> {
    init.version = init.version || OpraSchema.SpecVersion;
    this.document.url = init.url;
    if (init.info)
      Object.assign(this.document.info, init.info);
    if (!init?.noBuiltinTypes) {
      const builtinDocument = await this.createBuiltinTypeDocument();
      this.document.references.set('opra', builtinDocument);
    }

    if (init.references)
      await this.addReferences(init.references);

    if (init.types) {
      this.curPath.push('Types->');
      // Add type sources into typeQueue
      if (Array.isArray(init.types)) {
        let i = 0;
        for (const thunk of init.types) {
          const metadata = Reflect.getMetadata(DATATYPE_METADATA, thunk) || thunk[DATATYPE_METADATA];
          if (!(metadata && metadata.name))
            throw new TypeError(`Metadata information not found at types[${i++}] "${String(thunk)}"`);
          this.typeQueue.set(metadata.name, thunk);
        }
      } else
        for (const [name, schema] of Object.entries(init.types)) {
          this.typeQueue.set(name, {...schema, name});
        }
      // Create type instances
      for (const thunk of this.typeQueue.values()) {
        await this.importDataType(thunk);
      }
      this.document.types.sort();
      this.curPath.pop();
    }
    this.document.invalidate();
    return this.document;
  }

  async initDocumentFromUrl(url: string): Promise<TypeDocument> {
    const resp = await fetch(url, {method: 'GET'});
    const init = await resp.json();
    if (!init)
      throw new TypeError(`Invalid response returned from url: ${url}`);
    return await this.initDocument({...init, url});
  }

  protected async createBuiltinTypeDocument(): Promise<TypeDocument> {
    const init: TypeDocumentFactory.InitArguments = {
      version: OpraSchema.SpecVersion,
      url: 'https://oprajs.com/spec/v1.0',
      info: {
        version: OpraSchema.SpecVersion,
        title: 'Opra built-in types',
        license: {
          url: 'https://github.com/oprajs/opra/blob/main/LICENSE',
          name: 'MIT'
        }
      },
      types: [AnyType, Base64Type, BigintType, BooleanType,
        DateType, UuidType, IntegerType, NullType,
        NumberType, ObjectType, ObjectIdType, StringType,
        TimeType, TimestampType,
        OperationResult, MetadataMode,
      ]
    }
    const factory = new TypeDocumentFactory();
    factory.document = new TypeDocument();
    return await factory.initDocument({...init, noBuiltinTypes: true});
  }

  protected async addReferences(references: Record<string, string | OpraSchema.TypeDocument | TypeDocument>): Promise<void> {
    const {document} = this;
    for (const [ns, r] of Object.entries<any>(references)) {
      if (typeof r === 'string') {
        document.references.set(ns, await this.initDocumentFromUrl(r));
      } else if (r instanceof TypeDocument)
        document.references.set(ns, r);
      else if (typeof r === 'object') {
        document.references.set(ns, await this.initDocument(r));
      } else throw new TypeError(`Invalid document reference (${ns}) in schema`);
    }
  }

  protected async importDataType(
      thunk: ThunkAsync<string | Type | EnumType.EnumObject | EnumType.EnumArray | OpraSchema.DataType>
  ): Promise<DataType> {
    thunk = await resolveThunk(thunk);
    let name = '';
    // let schema: OpraSchema.DataType | undefined;
    let ctor: Type | undefined;

    if (typeof thunk === 'string') {
      name = thunk;
      thunk = this.typeQueue.get(name);
    }

    let initArguments: any;

    if (typeof thunk === 'function') {
      const metadata = Reflect.getMetadata(DATATYPE_METADATA, thunk);
      if (!metadata) {
        // Check if is an internal type class like String, Number etc
        const dataType = this.document.getDataType(thunk, true);
        if (dataType) return dataType;
        throw new TypeError(`Class "${thunk.name}" doesn't have a valid DataType metadata`);
      }
      name = metadata.anonymous ? undefined : metadata.name;
      initArguments = cloneObject(metadata);
      ctor = thunk as Type;
    } else if (typeof thunk === 'object') {
      if (OpraSchema.isDataType(thunk)) {
        name = (thunk as any).name;
        ctor = (thunk as any).ctor || ctor;
        initArguments = cloneObject(thunk) as any;
      } else {
        // It should be an enum object
        const metadata = thunk[DATATYPE_METADATA];
        if (!metadata)
          throw new TypeError(`No EnumType metadata found for object ${JSON.stringify(thunk).substring(0, 20)}...`);
        name = metadata.anonymous ? undefined : metadata.name;
        initArguments = cloneObject(metadata);
        initArguments.enumObject = thunk;
      }
    }
    ctor = ctor ?? (initArguments && (isConstructor(initArguments.ctor)) ? initArguments.ctor : undefined);

    if (name) {
      if (this.circularRefs.has(name.toLowerCase()))
        throw new TypeError('Circular reference detected');
      const dataType = this.document.getDataType(name, true);
      if (dataType) return dataType;
      this.curPath.push('/' + name);
      this.circularRefs.set(name, 1);
    }
    if (ctor) {
      if (this.circularRefs.has(ctor))
        throw new TypeError('Circular reference detected');
      const dataType = this.document.getDataType(ctor, true);
      if (dataType) return dataType;
      this.circularRefs.set(ctor, 1);
    }

    try {
      if (!initArguments)
        throw new TypeError(`No DataType schema determined`);

      // Create an empty DataType instance and add in to document.
      // This will help us for circular dependent data types
      const instance = this.createDataTypeInstance(initArguments.kind, name);
      if (name)
        this.document.types.set(name, instance);

      await this.prepareDataTypeInitArguments(initArguments, ctor);

      if (initArguments.kind === 'ComplexType') {
        if (typeof initArguments.additionalFields === 'function')
          initArguments.additionalFields = await this.importDataType(initArguments.additionalFields);
        ComplexType.apply(instance, [this.document, initArguments] as any);
      } else if (initArguments.kind === 'SimpleType')
        SimpleType.apply(instance, [this.document, initArguments] as any);
      else if (initArguments.kind === 'EnumType')
        EnumType.apply(instance, [this.document, initArguments] as any);
      else if (initArguments.kind === 'MappedType')
        MappedType.apply(instance, [this.document, initArguments] as any);
      else if (initArguments.kind === 'UnionType')
        UnionType.apply(instance, [this.document, initArguments] as any);
      else
        throw new TypeError(`Invalid data type schema: ${String(initArguments)}`);

      return instance;
    } finally {
      if (name) {
        this.curPath.pop();
        this.circularRefs.delete(name.toLowerCase());
      }
      if (ctor)
        this.circularRefs.delete(ctor);
    }
  }

  protected async prepareDataTypeInitArguments(
      schema: TypeDocumentFactory.DataTypeInitializer | OpraSchema.DataType,
      ctor?: Type
  ) {
    const initArguments = schema as TypeDocumentFactory.DataTypeInitializer;
    // Import extending class first
    if (initArguments.kind === 'SimpleType' || initArguments.kind === 'ComplexType' ||
        initArguments.kind === 'EnumType'
    ) {
      if (ctor) {
        const baseClass = Object.getPrototypeOf(ctor.prototype).constructor;
        const baseMeta = Reflect.getMetadata(DATATYPE_METADATA, baseClass);
        if (baseMeta) {
          initArguments.base = await this.importDataType(baseClass) as any;
        }
      } else if (initArguments.base) {
        initArguments.base = await this.importDataType(initArguments.base as any) as any;
      }
    }

    if (initArguments.kind === 'SimpleType' && ctor) {
      if (typeof ctor.prototype.decode === 'function')
        initArguments.decoder = initArguments.name
            ? validator(initArguments.name, ctor.prototype.decode) : validator(ctor.prototype.decode);
      if (typeof ctor.prototype.encode === 'function')
        initArguments.decoder = initArguments.name
            ? validator(initArguments.name, ctor.prototype.encode) : validator(ctor.prototype.encode);
      return;
    }

    if (initArguments.kind === 'ComplexType') {
      initArguments.ctor = ctor;
      if (initArguments.fields) {
        const srcFields = initArguments.fields as
            Record<string, OpraSchema.Field | ApiField.Metadata>;
        const trgFields: Record<string, ApiField.InitArguments> = initArguments.fields = {};
        for (const [fieldName, o] of Object.entries<any>(srcFields)) {
          try {
            this.curPath.push('.' + fieldName);
            const srcMeta: OpraSchema.Field | ApiField.Metadata = typeof o === 'string' ? {type: o} : o;
            const fieldInit = trgFields[fieldName] = {
              ...srcMeta,
              name: fieldName
            } as ApiField.InitArguments;

            if ((srcMeta as any).enum) {
              const enumObject = (srcMeta as any).enum;
              delete (srcMeta as any).enum;
              if (enumObject[DATATYPE_METADATA]) {
                fieldInit.type = await this.importDataType(enumObject);
              } else {
                const enumMeta = EnumType(enumObject, {name: ''});
                fieldInit.type = await this.importDataType({...enumMeta, kind: 'EnumType', base: undefined});
              }
            } else {
              if (srcMeta.isArray && !srcMeta.type)
                throw new TypeError(`"type" must be defined explicitly for array properties`);
              fieldInit.type = await this.importDataType(srcMeta.type || (srcMeta as any).designType || 'any');
            }
            this.curPath.pop();
          } catch (e: any) {
            e.message = `Error in resource "${initArguments.name}.${fieldName}". ` + e.message;
            throw e;
          }
        }
      }
    }

    if (initArguments.kind === 'MappedType') {
      const dataType = await this.importDataType(initArguments.base as any);
      // istanbul ignore next
      if (!(dataType instanceof ComplexType))
        throw new TypeError('MappedType.type property must address to a ComplexType');
      initArguments.base = dataType;
    }

    if (initArguments.kind === 'UnionType') {
      const oldTypes = initArguments.types as any;
      initArguments.types = [];
      for (const type of oldTypes)
        initArguments.types.push(await this.importDataType(type) as any);
    }
    return initArguments;
  }

  protected createDataTypeInstance(kind: OpraSchema.DataType.Kind, name?: string): DataType {
    const dataType = {
      document: this.document,
      kind,
      name
    } as DataType;
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
      case OpraSchema.UnionType.Kind:
        Object.setPrototypeOf(dataType, UnionType.prototype);
        break;
      default:
        throw new TypeError(`Unknown DataType kind (${kind})`);
    }
    return dataType;
  }

}
