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

export class TypeDocumentFactory {
  static designTypeMap = new Map<Function | Type, string>();

  protected document: ApiDocument = new ApiDocument();
  protected typeQueue = new ResponsiveMap<any>();
  protected circularRefs = new Map();
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

  protected async importDataType(
      thunk: ThunkAsync<string | Type | EnumType.EnumObject | EnumType.EnumArray | OpraSchema.DataType>
  ): Promise<DataType> {
    thunk = await resolveThunk(thunk);
    let name = '';
    let schema: OpraSchema.DataType | undefined;
    let ctor: Type | undefined;

    if (typeof thunk === 'string') {
      name = thunk;
      schema = this.typeQueue.get(name);
    } else if (typeof thunk === 'function') {
      const metadata = Reflect.getMetadata(DATATYPE_METADATA, thunk);
      if (!metadata) {
        // Check if is an internal type class like String, Number etc
        const dataType = this.document.getDataType(thunk, true);
        if (dataType) return dataType;
        throw new TypeError(`Class "${thunk.name}" doesn't have a valid DataType metadata`);
      }
      name = metadata.name;
      schema = metadata;
      ctor = thunk as Type;
    } else if (typeof thunk === 'object') {
      if (OpraSchema.isDataType(thunk)) {
        name = (thunk as any).name;
        ctor = (thunk as any).ctor || ctor;
        schema = thunk;
      } else {
        // It should be an enum object
        const metadata = thunk[DATATYPE_METADATA];
        if (!metadata)
          throw new TypeError(`No EnumType metadata found for object ${JSON.stringify(thunk).substring(0, 20)}...`);
        name = metadata.name;
        const dataType = this.document.getDataType(name, true);
        if (dataType) return dataType;
        schema = cloneObject(metadata) as OpraSchema.DataType;
      }
    }
    ctor = ctor ?? (schema && (isConstructor((schema as any).ctor)) ? (schema as any).ctor : undefined);

    if (name) {
      if (this.circularRefs.has(name.toLowerCase()))
        throw new TypeError('Circular reference detected');
      const dataType = this.document.getDataType(name, true);
      if (dataType) return dataType;
      this.curPath.push('#' + name);
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
      if (!OpraSchema.isDataType(schema))
        throw new TypeError(`No DataType schema determined`);

      // Create an empty DataType instance and add in to document.
      // This will help us for circular dependent data types
      const instance = this.createDataTypeInstance(schema.kind, name);
      if (name)
        this.document.types.set(name, instance);

      const initArguments = cloneObject(schema) as TypeDocumentFactory.DataTypeInitializer;
      await this.prepareDataTypeInitArguments(initArguments, ctor);

      if (initArguments.kind === 'ComplexType')
        ComplexType.apply(instance, [this.document, initArguments] as any);
      else if (initArguments.kind === 'SimpleType')
        SimpleType.apply(instance, [this.document, initArguments] as any);
      else if (initArguments.kind === 'EnumType')
        EnumType.apply(instance, [this.document, initArguments] as any);
      else if (initArguments.kind === 'MappedType')
        MappedType.apply(instance, [this.document, initArguments] as any);
      else if (initArguments.kind === 'UnionType')
        UnionType.apply(instance, [this.document, initArguments] as any);
      else
        throw new TypeError(`Invalid data type schema: ${String(schema)}`);

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
            this.curPath.push(fieldName);
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
                const enumMeta = EnumType(enumObject);
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
      const dataType = await this.importDataType(initArguments.type as any);
      // istanbul ignore next
      if (!(dataType instanceof ComplexType))
        throw new TypeError('MappedType.type property must address to a ComplexType');
      initArguments.type = dataType;
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

  /*
    protected processDataType(schemaOrName: OpraSchema.DataType | string): DataType {
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
          base = this.processDataType(schema.base);
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
              const elemType = this.processDataType(elemSchema.type);
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
          const unionTypes = schema.types.map(t => this.processDataType(t)) as any;
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
          const dt = this.processDataType(schema.type);
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
  */

}
