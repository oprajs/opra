import { StrictOmit, Type } from 'ts-gems';
import { ResponsiveMap } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import { ThunkAsync } from '../../types.js';
import { ApiDocument } from '../api-document.js';
import { addReferences } from './add-references.js';
import {
  createBuiltinTypeDocument,
  createDocument,
  createDocumentFromUrl
} from './create-document.js';
import {
  extractCollectionSchema,
  extractSingletonSchema,
  importResourceClass
} from './import-resource-class.js';
import {
  extractComplexTypeSchema,
  extractEnumTypeSchema,
  extractFieldSchema,
  extractMappedTypeSchema,
  extractSimpleTypeSchema,
  extractUnionTypeSchema,
  importTypeClass
} from './import-type-class.js';
import {
  createCollection,
  createSingleton,
  processResourceQueue
} from './process-resources.js';
import {
  addDataType,
  createDataTypeInstance,
  processTypes
} from './process-types.js';

/**
 * @namespace DocumentFactory
 */
export namespace DocumentFactory {
  export type InitArguments = StrictOmit<OpraSchema.ApiDocument, 'references' | 'types' | 'resources'> & {
    references?: Record<string, string | OpraSchema.ApiDocument | ApiDocument>;
    resources?: ThunkAsync<Type | object>[] | Record<OpraSchema.Resource.Name, OpraSchema.Resource>;
    types?: ThunkAsync<Type | OpraSchema.EnumThunk>[] | Record<string, OpraSchema.DataType>;
  }
}

/**
 * @class DocumentFactory
 */
export class DocumentFactory {
  protected document: ApiDocument = new ApiDocument();
  protected typeQueue = new ResponsiveMap<string, OpraSchema.DataType>()
  protected resourceQueue = new ResponsiveMap<string, OpraSchema.Resource>();
  protected circularRefs = new ResponsiveMap<string, any>();
  protected curPath: string[] = []
  protected cache = new Map<any, any>();

  protected createDocument: typeof createDocument;
  protected createDocumentFromUrl: typeof createDocumentFromUrl;
  protected createBuiltinTypeDocument: typeof createBuiltinTypeDocument;
  protected addReferences: typeof addReferences;
  protected importTypeClass: typeof importTypeClass;
  protected extractSimpleTypeSchema: typeof extractSimpleTypeSchema;
  protected extractComplexTypeSchema: typeof extractComplexTypeSchema;
  protected extractMappedTypeSchema: typeof extractMappedTypeSchema;
  protected extractUnionTypeSchema: typeof extractUnionTypeSchema;
  protected extractEnumTypeSchema: typeof extractEnumTypeSchema;
  protected extractFieldSchema: typeof extractFieldSchema;
  protected processTypes: typeof processTypes;
  protected createDataTypeInstance: typeof createDataTypeInstance;
  protected addDataType: typeof addDataType;
  protected importResourceClass: typeof importResourceClass;
  protected extractSingletonSchema: typeof extractSingletonSchema;
  protected extractCollectionSchema: typeof extractCollectionSchema;
  protected processResourceQueue: typeof processResourceQueue;
  protected createCollection: typeof createCollection;
  protected createSingleton: typeof createSingleton;

  /**
   * Creates ApiDocument instance from given schema object
   * @param init
   */
  static async createDocument(init: DocumentFactory.InitArguments): Promise<ApiDocument> {
    const factory = new DocumentFactory();
    return factory.createDocument(init);
  }

  /**
   * Downloads schema from the given URL and creates the document instance   * @param url
   */
  static async createDocumentFromUrl(url: string): Promise<ApiDocument> {
    const factory = new DocumentFactory();
    return factory.createDocumentFromUrl(url);
  }

  static {
    DocumentFactory.prototype.createDocument = createDocument;
    DocumentFactory.prototype.createDocumentFromUrl = createDocumentFromUrl;
    DocumentFactory.prototype.createBuiltinTypeDocument = createBuiltinTypeDocument;
    DocumentFactory.prototype.addReferences = addReferences;
    DocumentFactory.prototype.importTypeClass = importTypeClass;
    DocumentFactory.prototype.extractSimpleTypeSchema = extractSimpleTypeSchema;
    DocumentFactory.prototype.extractComplexTypeSchema = extractComplexTypeSchema;
    DocumentFactory.prototype.extractMappedTypeSchema = extractMappedTypeSchema;
    DocumentFactory.prototype.extractUnionTypeSchema = extractUnionTypeSchema;
    DocumentFactory.prototype.extractEnumTypeSchema = extractEnumTypeSchema;
    DocumentFactory.prototype.extractFieldSchema = extractFieldSchema;
    DocumentFactory.prototype.processTypes = processTypes;
    DocumentFactory.prototype.createDataTypeInstance = createDataTypeInstance;
    DocumentFactory.prototype.addDataType = addDataType;
    DocumentFactory.prototype.importResourceClass = importResourceClass;
    DocumentFactory.prototype.extractSingletonSchema = extractSingletonSchema;
    DocumentFactory.prototype.extractCollectionSchema = extractCollectionSchema;
    DocumentFactory.prototype.processResourceQueue = processResourceQueue;
    DocumentFactory.prototype.createCollection = createCollection;
    DocumentFactory.prototype.createSingleton = createSingleton;
  }
}


