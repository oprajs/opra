import { StrictOmit, Type } from 'ts-gems';
import { validator } from 'valgen';
import { cloneObject, isConstructor, resolveThunk, ResponsiveMap } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { ThunkAsync } from '../../types.js';
import { ApiDocument } from '../api-document.js';
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

export namespace TypeDocumentFactory {
  export interface InitArguments extends StrictOmit<OpraSchema.ApiDocument, 'references' | 'types' | 'resources'> {
    references?: Record<string, string | OpraSchema.ApiDocument | ApiDocument>;
    types?: ThunkAsync<Type | OpraSchema.EnumThunk>[] | Record<string, OpraSchema.DataType>;
    noBuiltinTypes?: boolean;
  }
}

export class TypeDocumentFactory {
  static designTypeMap = new Map<Function | Type, string>();

  protected document: ApiDocument = new ApiDocument();
  protected typeQueue = new ResponsiveMap<OpraSchema.DataType>();
  protected circularRefs = new ResponsiveMap<any>();
  protected curPath: string[] = [];
  protected cache = new Map<any, any>();

  protected async createDocument(
      init: TypeDocumentFactory.InitArguments
  ): Promise<ApiDocument> {
    this.document.url = init.url;
    if (init.info)
      Object.assign(this.document.info, init.info);
    if (!init?.noBuiltinTypes) {
      const builtinDocument = await this.createBuiltinTypeDocument();
      this.document.references.set('Opra', builtinDocument);
      for (const [c, s] of Object.getPrototypeOf(this).constructor.designTypeMap.entries())
        (this.document as any)._designTypeMap.set(c, s);
    }

    if (init.references)
      await this.addReferences(init.references);

    if (init.types) {
      this.curPath.push('types');
      if (Array.isArray(init.types)) {
        for (const type of init.types)
          await this.importTypeClass(type);
      } else
        this.typeQueue.setAll(init.types)
      await this.processTypes();
      this.curPath.pop();
    }
    this.document.types.sort();
    return this.document;
  }

  async createDocumentFromUrl(url: string): Promise<ApiDocument> {
    const resp = await fetch(url, {method: 'GET'});
    const init = await resp.json();
    if (!init)
      throw new TypeError(`Invalid response returned from url: ${url}`);
    return await this.createDocument({...init, url});
  }

  protected async createBuiltinTypeDocument(): Promise<ApiDocument> {
    const init: TypeDocumentFactory.InitArguments = {
      version: OpraSchema.SpecVersion,
      info: {
        version: OpraSchema.SpecVersion,
        title: 'Opra built-in types',
        contact: [{
          url: 'https://github.com/oprajs/opra'
        }
        ],
        license: {
          url: 'https://github.com/oprajs/opra/blob/main/LICENSE',
          name: 'MIT'
        }
      },
      types: [AnyType, Base64Type, BigintType, BooleanType,
        DateType, UuidType, IntegerType, NullType,
        NumberType, ObjectType, ObjectIdType, StringType,
        TimeType, TimestampType
      ]
    }
    const factory = new TypeDocumentFactory();
    return await factory.createDocument({...init, noBuiltinTypes: true});
  }

  protected async addReferences(references: Record<string, string | OpraSchema.ApiDocument | ApiDocument>): Promise<void> {
    const {document} = this;
    for (const [ns, r] of Object.entries<any>(references)) {
      if (typeof r === 'string') {
        document.references.set(ns, await this.createDocumentFromUrl(r));
      } else if (r instanceof ApiDocument)
        document.references.set(ns, r);
      else if (typeof r === 'object') {
        document.references.set(ns, await this.createDocument(r));
      } else throw new TypeError(`Invalid document reference (${ns}) in schema`);
    }
  }

  protected async importTypeClass(typeThunk: ThunkAsync<Type | OpraSchema.EnumThunk>): Promise<string | OpraSchema.DataType> {
    const {document, typeQueue, cache} = this;
    const thunk = await resolveThunk(typeThunk);
    const cached = cache.get(thunk);
    if (cached)
      return cached;

    const dt = document.getDataType(thunk, true);
    if (dt && dt.name)
      return dt.name;

    const metadata = Reflect.getMetadata(DATATYPE_METADATA, thunk);
    if (!(metadata && OpraSchema.isDataType(metadata as any))) {
      // If thunk is a Type class
      if (isConstructor(thunk))
        throw new TypeError(`Class "${thunk.name}" doesn't have a valid DataType metadata`);
      // If thunk is an Enum object
      throw new TypeError(`No EnumType metadata found for object ${JSON.stringify(thunk).substring(0, 20)}...`);
    }
// Clone metadata to prevent changing its contents
    const name = metadata.name;
    const schema = cloneObject(metadata) as OpraSchema.DataType;
    const result = name || schema;
    if (name) {
      if
      (this.document.types.has(name) || typeQueue.has(name))
        throw new TypeError(`Type "${name}" already imported`);
      cache.set(thunk, result);
      typeQueue.set(name, schema);
    }

// If thunk is a DataType class
    if (isConstructor(thunk)) {
      const ctor = thunk;
      if (OpraSchema.isSimpleType(schema))
        await this.extractSimpleTypeSchema(schema, ctor, metadata);
      else if (OpraSchema.isComplexType(schema))
        await this.extractComplexTypeSchema(schema, ctor, metadata);
      else if (OpraSchema.isMappedType(schema))
        await this.extractMappedTypeSchema(schema, ctor, metadata);
      else if (OpraSchema.isUnionType(schema))
        await this.extractUnionTypeSchema(schema, ctor, metadata);
      else
        throw new TypeError(`Class "${ctor.name}" doesn't have a valid DataType metadata`);
      return result;
    }

    // If thunk is a EnumType object
    const enumObject = thunk;
    if (OpraSchema.isEnumType(schema)) {
      let baseType: string | OpraSchema.EnumType | undefined;
      if ((metadata as any).base && Reflect.hasMetadata(DATATYPE_METADATA, (metadata as any).base)) {
        baseType = await this.importTypeClass((metadata as any).base) as any;
      }
      schema.base = baseType;
      await this.extractEnumTypeSchema(schema, enumObject, metadata);
      return result;
    }

    throw new TypeError(`No EnumType metadata found for object ${JSON.stringify(enumObject).substring(0, 20)}...`);
  }

  protected async extractSimpleTypeSchema(
      target: OpraSchema.SimpleType,
      ctor: Type,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      metadata: SimpleType.Metadata
  ): Promise<void> {
    const baseClass = Object.getPrototypeOf(ctor.prototype).constructor;
    if (Reflect.hasMetadata(DATATYPE_METADATA, baseClass))
      target.base = await this.importTypeClass(baseClass);
    if (typeof ctor.prototype.decode === 'function')
      target.decoder = validator(metadata.name, ctor.prototype.decode);
    if (typeof ctor.prototype.encode === 'function')
      target.encoder = validator(metadata.name, ctor.prototype.encode);
  }

  protected async extractComplexTypeSchema(
      target: OpraSchema.ComplexType,
      ctor: Type,
      metadata: ComplexType.Metadata
  ): Promise<void> {
    const baseClass = Object.getPrototypeOf(ctor.prototype).constructor;
    if (Reflect.hasMetadata(DATATYPE_METADATA, baseClass))
      target.base = await this.importTypeClass(baseClass);
    target.ctor = target.ctor || ctor;
// Fields
    if (metadata.fields) {
      const fields = target.fields = {};
      for (const [elemName, elemMeta] of Object.entries<ApiField.Metadata>(metadata.fields)) {
        try {
          const t = await elemMeta.type;
          const type = typeof t === 'function'
              ? await this.importTypeClass(t)
              : (t || '');

          const elemSchema: OpraSchema.Field = fields[elemName] = {
            ...elemMeta,
            type
          }
          if (elemMeta.enum)
            elemSchema.type = await this.importTypeClass(elemMeta.enum);

          if (!elemSchema.type && elemMeta.designType) {
            const mappingType = this.document.getDataType(elemMeta.designType, true);
            if (mappingType)
              elemSchema.type = mappingType.name!;
            else
              elemSchema.type = await this.importTypeClass(elemMeta.designType);
          }

          await this.extractFieldSchema(elemSchema, ctor, elemMeta, elemName);

          // Check enum again. External packages may modify enum value
          if (elemMeta.enum)
            elemSchema.type = await this.importTypeClass(elemMeta.enum);
          if (typeof elemSchema.type === 'function')
            elemSchema.type = await this.importTypeClass(elemSchema.type);

          if (elemSchema.isArray && !elemSchema.type)
            throw new TypeError(`"type" must be defined explicitly for array properties`);

          elemSchema.type = elemSchema.type || 'any';
        } catch (e: any) {
          e.message = `Error in class "${ctor.name}.${elemName}". ` + e.message;
          throw e;
        }
      }
    }
  }

  protected async extractMappedTypeSchema(
      target: OpraSchema.MappedType,
      ctor: Type,
      metadata: MappedType.Metadata
  ): Promise<void> {
    target.type = await this.importTypeClass(metadata.type);
  }

  protected async extractUnionTypeSchema(
      target: OpraSchema.UnionType,
      ctor: Type,
      metadata: UnionType.Metadata,
  ): Promise<void> {
    const oldTypes = metadata.types;
    target.types = [];
    for (const type of oldTypes)
      target.types.push(await this.importTypeClass(type));
  }

  protected async extractEnumTypeSchema(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      target: OpraSchema.EnumType, enumObject: any, metadata: EnumType.Metadata
  ): Promise<void> {
    // Do nothing. This method is used by external modules for extending the factory
  }

  protected async extractFieldSchema(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      target: OpraSchema.Field, ctor: Type, metadata: ApiField.Metadata, name: string
  ): Promise<void> {
    // Do nothing. This method is used by external modules for extending the factory
  }

  protected async processTypes() {
    const {document, typeQueue} = this;
    // Create DataType instances
    for (const [name, schema] of typeQueue.entries()) {
      const dataType = this.createDataTypeInstance(schema.kind, name);
      document.types.set(name, dataType);
    }
    // Process schemas
    const typeNames = Array.from(typeQueue.keys());
    for (const name of typeNames) {
      if (!typeQueue.has(name))
        continue;
      this.addDataType(name);
    }
    document.invalidate();
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

  protected addDataType(schemaOrName: OpraSchema.DataType | string): DataType {
    const {document, typeQueue, circularRefs, curPath} = this;
    const name = typeof schemaOrName === 'string' ? schemaOrName : undefined;
    let schema: OpraSchema.DataType | undefined;
    let dataType: DataType | undefined;
    if (name) {
      // Check if data type exists in document
      dataType = document.getDataType(name);
      // Get schema from stack, it is already done if not exist
      schema = typeQueue.get(name);
      if (!schema)
        return dataType;
      // Detect circular refs
      if (circularRefs.has(name))
        throw new TypeError(`Circular reference detected. ${[...Array.from(circularRefs.keys()), name].join('>')}`)
      circularRefs.set(name, 1);
    } else
      schema = schemaOrName as OpraSchema.DataType;

    try {
      // Init base
      let base: any;
      if ((OpraSchema.isSimpleType(schema) || OpraSchema.isComplexType(schema) || OpraSchema.isEnumType(schema)) && schema.base) {
        curPath.push(typeof schema.base === 'string' ? schema.base : '[base]');
        base = this.addDataType(schema.base);
        curPath.pop();
      }

      // **** Init SimpleType ****
      if (OpraSchema.isSimpleType(schema)) {
        const initArgs: SimpleType.InitArguments = {
          ...schema,
          name,
          base
        }
        dataType = dataType || this.createDataTypeInstance(schema.kind, name);
        if (name) curPath.push(name);
        SimpleType.apply(dataType, [document, initArgs] as any);
        if (name) curPath.pop();
        return dataType;
      }

      // **** Init ComplexType ****
      if (OpraSchema.isComplexType(schema)) {
        const initArgs: ComplexType.InitArguments = {
          ...schema,
          name,
          base
        }
        dataType = dataType || this.createDataTypeInstance(schema.kind, name);
        if (name) curPath.push(name);
        ComplexType.apply(dataType, [document, initArgs] as any);
        if (name)
          typeQueue.delete(name);

        // process fields
        if (schema.fields) {
          for (const [elemName, v] of Object.entries(schema.fields)) {
            const elemSchema = typeof v === 'object' ? v : {type: v};
            curPath.push(`${name}.${elemName}[type]`);
            const elemType = this.addDataType(elemSchema.type);
            (dataType as ComplexType).addField({
              ...elemSchema,
              name: elemName,
              type: elemType
            });
            curPath.pop();
          }
        }
        if (name) curPath.pop();
        return dataType;
      }

      // **** Init EnumType ****
      if (OpraSchema.isEnumType(schema)) {
        const initArgs: EnumType.InitArguments = {
          ...schema,
          name,
          base
        }
        dataType = dataType || this.createDataTypeInstance(schema.kind, name);
        if (name) curPath.push(name);
        EnumType.apply(dataType, [document, initArgs] as any);
        if (name) curPath.pop();
        return dataType;
      }

      // **** Init UnionType ****
      if (OpraSchema.isUnionType(schema)) {
        const unionTypes = schema.types.map(t => this.addDataType(t)) as any;
        const initArgs: UnionType.InitArguments = {
          ...schema,
          name,
          types: unionTypes
        }
        dataType = dataType || this.createDataTypeInstance(schema.kind, name);
        if (name) curPath.push(name);
        UnionType.apply(dataType, [document, initArgs] as any);
        if (name) curPath.pop();
        return dataType;
      }

      // **** Init MappedType ****
      if (OpraSchema.isMappedType(schema)) {
        const dt = this.addDataType(schema.type);
        if (!(dt instanceof ComplexType))
          throw new TypeError(`MappedType requires a ComplexType`);
        const initArgs: MappedType.InitArguments = {
          ...schema,
          name,
          type: dt
        }
        dataType = dataType || this.createDataTypeInstance(schema.kind, name);
        if (name) curPath.push(name);
        MappedType.apply(dataType, [document, initArgs] as any);
        if (name) curPath.pop();
        return dataType;
      }

    } catch (e: any) {
      if (curPath.length)
        e.message = `Error at ${curPath.join('/')}: ` + e.message;
      throw e;
    } finally {
      if (name) {
        circularRefs.delete(name);
        typeQueue.delete(name);
      }
    }
    throw new TypeError(`Invalid DataType schema: ${JSON.stringify(schema).substring(0, 20)}...`);
  }




}
