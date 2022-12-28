import { omit } from 'lodash';
import { Type } from 'ts-gems';
import { ResponsiveMap } from '../../helpers/responsive-map.js';
import { IResourceContainer } from '../interfaces/resource-container.interface.js';
import { OpraSchema } from '../opra-schema.definition.js';
import { ThunkAsync } from '../types.js';
import { cloneObject } from '../utils/clone-object.util.js';
import { stringCompare } from '../utils/string-compare.util.js';
import { builtInTypes } from './data-type/builtin-data-types.js';
import { ComplexType } from './data-type/complex-type.js';
import { DataType } from './data-type/data-type.js';
import { SimpleType } from './data-type/simple-type.js';
import { UnionType } from './data-type/union-type.js';
import { DocumentBuilder, DocumentBuilderArgs } from './document-builder.js';
import { CollectionResourceInfo } from './resource/collection-resource-info.js';
import { ResourceInfo } from './resource/resource-info.js';
import { SingletonResourceInfo } from './resource/singleton-resource-info.js';

export type OpraDocumentArgs = DocumentBuilderArgs & {
  types?: ThunkAsync<Type>[] | Record<string, OpraSchema.DataType>;
  resources?: ThunkAsync<any>[] | Record<string, OpraSchema.Resource>;
}

type OpraDocumentMeta = Pick<OpraSchema.Document, 'info' | 'servers'>;

export namespace OpraDocument {

}

export class OpraDocument implements IResourceContainer {
  protected declare readonly _meta: OpraDocumentMeta;
  protected _ownTypes = new ResponsiveMap<string, DataType>();
  protected _types = new ResponsiveMap<string, DataType>();
  protected _resources = new ResponsiveMap<string, ResourceInfo>();

  constructor(schema: OpraSchema.Document) {
    this._meta = omit(schema, ['types', 'resources']);
    for (const [name, t] of builtInTypes.entries()) {
      this._addDataType(name, t, false);
    }
    if (schema.types)
      for (const [name, t] of Object.entries(schema.types)) {
        this._addDataType(name, t, true);
      }
    this._initTypes();
    if (schema.resources)
      for (const [name, t] of Object.entries(schema.resources)) {
        this._addResource(name, t);
      }
  }

  get info(): OpraSchema.DocumentInfo {
    return this._meta.info;
  }

  get types(): Map<string, DataType> {
    return this._types;
  }

  getDataType(name: string): DataType {
    const t = this.types.get(name);
    if (t)
      return t;
    throw new Error(`Data type "${name}" does not exists`);
  }

  getComplexDataType(name: string): ComplexType {
    const t = this.getDataType(name);
    if (t && t instanceof ComplexType)
      return t;
    throw new Error(`Data type "${name}" is not a ComplexType`);
  }

  getSimpleDataType(name: string): SimpleType {
    const t = this.getDataType(name);
    if (t && t instanceof SimpleType)
      return t;
    throw new Error(`Data type "${name}" is not a SimpleType`);
  }

  getUnionDataType(name: string): UnionType {
    const t = this.getDataType(name);
    if (t && t instanceof UnionType)
      return t;
    throw new Error(`Data type "${name}" is not a UnionType`);
  }

  get resources(): Map<string, ResourceInfo> {
    return this._resources;
  }

  get servers(): OpraSchema.ServerInfo[] | undefined {
    return this._meta.servers;
  }

  getResource<T extends ResourceInfo>(name: string): T {
    const t = this.resources.get(name);
    if (!t)
      throw new Error(`Resource "${name}" does not exists`);
    return t as T;
  }

  getCollectionResource(name: string): CollectionResourceInfo {
    const t = this.getResource(name);
    if (!(t instanceof CollectionResourceInfo))
      throw new Error(`"${name}" is not a CollectionResource`);
    return t;
  }

  getSingletonResource(name: string): SingletonResourceInfo {
    const t = this.getResource(name);
    if (!(t instanceof SingletonResourceInfo))
      throw new Error(`"${name}" is not a SingletonResource`);
    return t;
  }

  getMetadata(jsonOnly?: boolean) {
    const out: OpraSchema.Document = {
      version: OpraSchema.Version,
      info: cloneObject(this.info),
    };
    if (this._ownTypes.size) {
      out.types = Array.from(this._ownTypes.values())
          .sort((a, b) => stringCompare(a.name, b.name))
          .reduce((target, t) => {
            target[t.name] = t.getSchema(jsonOnly);
            return target;
          }, {});
    }

    if (this.resources.size) {
      out.resources = Array.from(this._resources.values())
          .sort((a, b) => stringCompare(a.name, b.name))
          .reduce((target, t) => {
            target[t.name] = t.getSchema(jsonOnly);
            return target;
          }, {});
    }

    return out;
  }

  protected _addDataType(name: string, schema: OpraSchema.DataType, isOwn: boolean): DataType {
    let dataType = this._types.get(name);
    if (dataType)
      return dataType;

    if (OpraSchema.isComplexType(schema)) {
      dataType = new ComplexType(this, name, schema)
    } else if (OpraSchema.isSimpleType(schema)) {
      dataType = new SimpleType(this, name, schema);
    } else if (OpraSchema.isUnionTypee(schema)) {
      // todo build types array
      dataType = new UnionType(this, name, {...schema, types: []});
    } else throw new TypeError(`Invalid data type schema`);

    this._types.set(name, dataType);
    if (isOwn)
      this._ownTypes.set(name, dataType);
    return dataType;
  }

  protected _addResource(name: string, schema: OpraSchema.Resource): void {
    if (OpraSchema.isCollectionResource(schema) || OpraSchema.isSingletonResource(schema)) {
      const dataType = this.getDataType(schema.type);
      if (!dataType)
        throw new TypeError(`Datatype "${schema.type}" declared in CollectionResource (${name}) does not exists`);
      if (!(dataType instanceof ComplexType))
        throw new TypeError(`${schema.type} is not an ComplexType`);
      if (OpraSchema.isCollectionResource(schema))
        this.resources.set(name, new CollectionResourceInfo(this, name, dataType, schema));
      else this.resources.set(name, new SingletonResourceInfo(this, name, dataType, schema));
    } else
      throw new TypeError(`Unknown resource kind (${schema.kind})`);
  }

  protected _initTypes() {
    for (const dataType of this._types.values()) {
      if (dataType instanceof ComplexType) {
        dataType.init();
      }
    }
  }

  static async create(args: OpraDocumentArgs): Promise<OpraDocument> {
    const builder = new DocumentBuilder(args);
    if (args.types) {
      if (Array.isArray(args.types)) {
        for (const t of args.types)
          await builder.addDataTypeClass(t);
      } else for (const [k, v] of Object.entries(args.types)) {
        await builder.addDataTypeSchema(k, v);
      }
    }
    if (args.resources) {
      if (Array.isArray(args.resources)) {
        for (const t of args.resources)
          await builder.addResourceInstance(t);
      } else for (const [k, v] of Object.entries(args.resources)) {
        await builder.addResourceSchema(k, v);
      }
    }
    const schema = builder.buildSchema();
    return new OpraDocument(schema);
  }
}


