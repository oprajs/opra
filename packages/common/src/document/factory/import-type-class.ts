import { Type } from 'ts-gems';
import { validator } from 'valgen';
import { cloneObject, isConstructor, resolveThunk } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ThunkAsync } from '../../types.js';
import { DATATYPE_METADATA } from '../constants.js';
import type { ApiField } from '../data-type/api-field.js';
import type { ComplexType } from '../data-type/complex-type.js';
import type { EnumType } from '../data-type/enum-type.js';
import type { MappedType } from '../data-type/mapped-type.js';
import type { SimpleType } from '../data-type/simple-type.js';
import type { UnionType } from '../data-type/union-type.js';
import type { DocumentFactory } from './factory.js';

export async function importTypeClass(
    this: DocumentFactory,
    typeThunk: ThunkAsync<Type | OpraSchema.EnumThunk>
): Promise<string | OpraSchema.DataType> {
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

// noinspection JSUnusedLocalSymbols
export async function extractSimpleTypeSchema(
    this: DocumentFactory,
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

export async function extractComplexTypeSchema(
    this: DocumentFactory,
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

export async function extractMappedTypeSchema(
    this: DocumentFactory,
    target: OpraSchema.MappedType,
    ctor: Type,
    metadata: MappedType.Metadata
): Promise<void> {
  target.type = await this.importTypeClass(metadata.type);
}

export async function extractUnionTypeSchema(
    this: DocumentFactory,
    target: OpraSchema.UnionType,
    ctor: Type,
    metadata: UnionType.Metadata,
): Promise<void> {
  const oldTypes = metadata.types;
  target.types = [];
  for (const type of oldTypes)
    target.types.push(await this.importTypeClass(type));
}

// noinspection JSUnusedLocalSymbols
export async function extractEnumTypeSchema(
    this: DocumentFactory,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    target: OpraSchema.EnumType, enumObject: any, metadata: EnumType.Metadata
): Promise<void> {
  // Do nothing. This method is used by external modules for extending the factory
}

// noinspection JSUnusedLocalSymbols
export async function extractFieldSchema(
    this: DocumentFactory,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    target: OpraSchema.Field, ctor: Type, metadata: ApiField.Metadata, name: string
): Promise<void> {
  // Do nothing. This method is used by external modules for extending the factory
}
