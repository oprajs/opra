import { PartialSome, StrictOmit, Type } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { ThunkAsync } from '../../types.js';
import { ApiDocument } from '../api-document.js';
import {
  AnyType, ApproxDatetimeType, ApproxDateType, Base64Type, BigintType,
  BooleanType, DatetimeType, DateType, EmailType, IntegerType,
  NullType, NumberType, ObjectIdType, ObjectType, QueryType,
  StringType, TimeType, UrlType, UuidType
} from '../data-type/builtin/index.js';
import { EnumType } from '../data-type/enum-type.js';
import { DataTypeFactory } from './data-type.factory.js';
import { HttpServiceFactory } from './http-service.factory.js';

type ReferenceUnion = string | OpraSchema.ApiDocument | ApiDocument;
const OPRA_DOCUMENT_URL = 'https://oprajs.com/spec/v' + OpraSchema.SpecVersion;

export namespace ApiDocumentFactory {
  export interface InitArguments extends PartialSome<StrictOmit<OpraSchema.ApiDocument, 'references' | 'types' | 'services'>, 'spec'> {
    references?: Record<string, ReferenceUnion | Promise<ReferenceUnion>>;
    services?: Record<string, HttpServiceFactory.InitArguments>,
    types?: ThunkAsync<Type | EnumType.EnumObject | EnumType.EnumArray>[] | Record<string, OpraSchema.DataType>;
  }

  export interface Context {
    document: ApiDocument;
    curPath: string[];
  }

}

/**
 * @class ApiDocumentFactory
 */
export class ApiDocumentFactory {

  /**
   * Creates ApiDocument instance from given schema object
   */
  static async createDocument(schemaOrUrl: ApiDocumentFactory.InitArguments | string): Promise<ApiDocument> {
    const factory = new ApiDocumentFactory();
    const context = {
      document: new ApiDocument(),
      curPath: []
    }
    return factory.createDocument(context, schemaOrUrl);
  }

  /**
   * Downloads schema from the given URL and creates the document instance   * @param url
   */
  async createDocument(
      context: ApiDocumentFactory.Context,
      schemaOrUrl: ApiDocumentFactory.InitArguments | string
  ): Promise<ApiDocument> {
    let init: ApiDocumentFactory.InitArguments;
    try {

      if (typeof schemaOrUrl === 'string') {
        const resp = await fetch(schemaOrUrl, {method: 'GET'});
        init = await resp.json();
        if (!init)
          throw new TypeError(`Invalid response returned from url: ${schemaOrUrl}`);
        init.url = schemaOrUrl;
      } else init = schemaOrUrl;

      const {document} = context;

      if (init.url !== OPRA_DOCUMENT_URL) {
        const builtinDocument = await this.createBuiltinTypeDocument();
        document.references.set('opra', builtinDocument);
      }

      init.spec = init.spec || OpraSchema.SpecVersion;
      document.url = init.url;
      if (init.info)
        Object.assign(document.info, init.info);

      if (init.references) {
        context.curPath.push('.references');
        await this.createReferences(context, init.references);
        context.curPath.pop();
      }

      if (init.types) {
        context.curPath.push('.types');
        const typeFactory = new DataTypeFactory(document);
        await typeFactory.importAllDataTypes(context, init.types);
        context.curPath.pop();
      }
      if (init.services) {
        context.curPath.push(`.services`)
        await this.createServices(context, init.services);
        context.curPath.pop();
      }
      return document;
    } catch (e: any) {
      e.message = `ApiDocument creation error at "#${context.curPath.join('')}". ` + e.message;
      throw e;
    }
  }

  protected async createReferences(
      context: ApiDocumentFactory.Context,
      references: ApiDocumentFactory.InitArguments['references']
  ): Promise<void> {
    if (!references)
      return;
    const {document} = context;
    let ns: string;
    let r: ReferenceUnion;
    for ([ns, r] of Object.entries<any>(references)) {
      context.curPath.push('.' + ns);
      r = await r;
      if (r instanceof ApiDocument) {
        document.references.set(ns, r);
        continue;
      }
      const refContext: ApiDocumentFactory.Context = {
        ...context,
        document: new ApiDocument()
      }
      document.references.set(ns, await this.createDocument(refContext, r));
      context.curPath.pop();
    }
  }

  protected async createServices(
      context: ApiDocumentFactory.Context,
      services: ApiDocumentFactory.InitArguments['services']
  ): Promise<void> {
    if (!services)
      return;
    const {document} = context;
    let serviceName: string;
    let r;
    for ([serviceName, r] of Object.entries<any>(services)) {
      context.curPath.push('.' + serviceName);
      r = await r;
      if (r.protocol === 'http')
        document.services.set(serviceName, await HttpServiceFactory.createService(context, serviceName, r));
      else throw new TypeError(`Unknown service protocol (${r.protocol})`);
      context.curPath.pop();
    }
  }

  protected async createBuiltinTypeDocument(): Promise<ApiDocument> {
    const init: ApiDocumentFactory.InitArguments = {
      spec: OpraSchema.SpecVersion,
      url: OPRA_DOCUMENT_URL,
      info: {
        version: OpraSchema.SpecVersion,
        title: 'Opra built-in types',
        license: {
          url: 'https://github.com/oprajs/opra/blob/main/LICENSE',
          name: 'MIT'
        }
      },
      types: [AnyType, Base64Type, BigintType, BooleanType,
        DateType, EmailType, IntegerType, NullType, NumberType, ObjectIdType,
        ObjectType, ApproxDateType, ApproxDatetimeType,
        StringType, DatetimeType, TimeType, UrlType, UuidType, QueryType
      ]
    }
    const context = {
      document: new ApiDocument(),
      curPath: []
    }
    const document = await this.createDocument(context, init);
    const BigIntConstructor = Object.getPrototypeOf(BigInt(0)).constructor;
    const BufferConstructor = Object.getPrototypeOf(Buffer.from([]));
    document.registerTypeCtor(Object, 'object');
    document.registerTypeCtor(String, 'string');
    document.registerTypeCtor(Number, 'number');
    document.registerTypeCtor(Boolean, 'boolean');
    document.registerTypeCtor(Object, 'any');
    document.registerTypeCtor(Date, 'datetime');
    document.registerTypeCtor(BigIntConstructor, 'bigint');
    document.registerTypeCtor(ArrayBuffer, 'base64');
    document.registerTypeCtor(SharedArrayBuffer, 'base64');
    document.registerTypeCtor(BufferConstructor, 'base64');
    return document;
  }

}
