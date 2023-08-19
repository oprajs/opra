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
  importSourceClass
} from './import-source-class.js';
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
  createCollectionSource,
  createSingletonSource,
  createStorageSource,
  processSourceQueue
} from './process-sources.js';
import {
  addDataType,
  createDataTypeInstance,
  processTypes
} from './process-types.js';

/**
 * @namespace DocumentFactory
 */
export namespace DocumentFactory {
  export interface InitArguments extends StrictOmit<OpraSchema.ApiDocument, 'references' | 'types' | 'sources'> {
    references?: Record<string, string | OpraSchema.ApiDocument | ApiDocument>;
    sources?: ThunkAsync<Type | object>[] | Record<OpraSchema.Source.Name, OpraSchema.Source>;
    types?: ThunkAsync<Type | OpraSchema.EnumThunk>[] | Record<string, OpraSchema.DataType>;
  }
}

/**
 * @class DocumentFactory
 */
export class DocumentFactory {
  static designTypeMap = new Map<Function | Type, string>();

  protected document: ApiDocument = new ApiDocument();
  protected typeQueue = new ResponsiveMap<OpraSchema.DataType>()
  protected sourceQueue = new ResponsiveMap<OpraSchema.Source>();
  protected circularRefs = new ResponsiveMap<any>();
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
  protected importSourceClass: typeof importSourceClass;
  protected extractSingletonSchema: typeof extractSingletonSchema;
  protected extractCollectionSchema: typeof extractCollectionSchema;
  protected processSourceQueue: typeof processSourceQueue;
  protected createCollectionSource: typeof createCollectionSource;
  protected createSingletonSource: typeof createSingletonSource;
  protected createFileSource: typeof createStorageSource;

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
    this.prototype.createDocument = createDocument;
    this.prototype.createDocumentFromUrl = createDocumentFromUrl;
    this.prototype.createBuiltinTypeDocument = createBuiltinTypeDocument;
    this.prototype.addReferences = addReferences;
    this.prototype.importTypeClass = importTypeClass;
    this.prototype.extractSimpleTypeSchema = extractSimpleTypeSchema;
    this.prototype.extractComplexTypeSchema = extractComplexTypeSchema;
    this.prototype.extractMappedTypeSchema = extractMappedTypeSchema;
    this.prototype.extractUnionTypeSchema = extractUnionTypeSchema;
    this.prototype.extractEnumTypeSchema = extractEnumTypeSchema;
    this.prototype.extractFieldSchema = extractFieldSchema;
    this.prototype.processTypes = processTypes;
    this.prototype.createDataTypeInstance = createDataTypeInstance;
    this.prototype.addDataType = addDataType;
    this.prototype.importSourceClass = importSourceClass;
    this.prototype.extractSingletonSchema = extractSingletonSchema;
    this.prototype.extractCollectionSchema = extractCollectionSchema;
    this.prototype.processSourceQueue = processSourceQueue;
    this.prototype.createCollectionSource = createCollectionSource;
    this.prototype.createSingletonSource = createSingletonSource;
    this.prototype.createFileSource = createStorageSource;
  }
}


