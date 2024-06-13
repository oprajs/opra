import { PartialSome, StrictOmit } from 'ts-gems';
import { OpraSchema } from '../../schema/index.js';
import { ApiDocument } from '../api-document.js';
import { DocumentInitContext } from '../common/document-init-context.js';
import { OpraDocumentError } from '../common/opra-document-error.js';
import { BUILTIN, CLASS_NAME_PATTERN, kCtorMap } from '../constants.js';
import {
  Base64Type,
  DateStringType,
  DateTimeStringType,
  DateTimeType,
  DateType,
  EmailType,
  FieldPathType,
  FilterType,
  ObjectIdType,
  OperationResult,
  TimeType,
  UrlType,
  UuidType,
} from '../data-type/extended-types/index.js';
import {
  AnyType,
  BigintType,
  BooleanType,
  IntegerType,
  NullType,
  NumberType,
  ObjectType,
  StringType,
} from '../data-type/primitive-types/index.js';
import { DataTypeFactory } from './data-type.factory.js';
import { HttpApiFactory } from './http-api.factory.js';

const OPRA_SPEC_URL = 'https://oprajs.com/spec/v' + OpraSchema.SpecVersion;

export namespace ApiDocumentFactory {
  export interface InitArguments
    extends PartialSome<StrictOmit<OpraSchema.ApiDocument, 'references' | 'types' | 'api'>, 'spec'> {
    references?: Record<string, string | OpraSchema.ApiDocument | InitArguments | ApiDocument>;
    types?: DataTypeInitThunk;
    api?: HttpApiFactory.InitArguments;
  }

  export type DataTypeInitThunk = DataTypeFactory.DataTypeSources;
}

/**
 * @class ApiDocumentFactory
 */
export class ApiDocumentFactory {
  /**
   * Creates ApiDocument instance from given schema object
   */
  static async createDocument(
    schemaOrUrl: string | PartialSome<OpraSchema.ApiDocument, 'spec'> | ApiDocumentFactory.InitArguments,
    options?: Partial<Pick<DocumentInitContext, 'maxErrors' | 'showErrorDetails'>> | DocumentInitContext,
  ): Promise<ApiDocument> {
    const factory = new ApiDocumentFactory();
    const context: DocumentInitContext =
      options instanceof DocumentInitContext ? options : new DocumentInitContext(options);
    try {
      const document = new ApiDocument();
      await factory.initDocument(document, context, schemaOrUrl);
      if (context.error.details.length) throw context.error;
      return document;
    } catch (e: any) {
      try {
        if (!(e instanceof OpraDocumentError)) {
          context.addError(e);
        }
      } catch {
        //
      }
      if (!context.error.message) {
        const l = context.error.details.length;
        context.error.message = `(${l}) error${l > 1 ? 's' : ''} found in document schema.`;
        if (context.showErrorDetails) {
          context.error.message += context.error.details
            .map(d => {
              return `\n\n  - ${d.message}` + (d.path ? `\n    @${d.path}` : '');
            })
            .join('');
        }
      }
      throw context.error;
    }
  }

  /**
   * Downloads schema from the given URL and creates the document instance   * @param url
   */
  protected async initDocument(
    document: ApiDocument,
    context: DocumentInitContext,
    schemaOrUrl: ApiDocumentFactory.InitArguments | string,
  ): Promise<void> {
    let init: ApiDocumentFactory.InitArguments;
    if (typeof schemaOrUrl === 'string') {
      const resp = await fetch(schemaOrUrl, { method: 'GET' });
      init = await resp.json();
      if (!init) return context.addError(`Invalid response returned from url: ${schemaOrUrl}`);
      init.url = schemaOrUrl;
    } else init = schemaOrUrl;

    // Add builtin data types if this document is the root
    if (!document[BUILTIN]) {
      const builtinDocument = await this.createBuiltinDocument(context);
      document.references.set('opra', builtinDocument);
    }

    init.spec = init.spec || OpraSchema.SpecVersion;
    document.url = init.url;
    if (init.info) document.info = { ...init.info };

    /** Add references  */
    if (init.references) {
      await context.enterAsync('.references', async () => {
        for (const [ns, r] of Object.entries(init.references!)) {
          await context.enterAsync(`[${ns}]`, async () => {
            if (!CLASS_NAME_PATTERN.test(ns)) throw new TypeError(`Invalid namespace (${ns})`);
            if (r instanceof ApiDocument) {
              document.references.set(ns, r);
              return;
            }
            const refDoc = new ApiDocument();
            await this.initDocument(refDoc, context, r);
            document.references.set(ns, refDoc);
          });
        }
      });
    }

    if (init.types) {
      await context.enterAsync('.types', async () => {
        await DataTypeFactory.addDataTypes(context, document, init.types!);
      });
    }

    if (init.api) {
      await context.enterAsync(`.api`, async () => {
        if (init.api!.protocol === 'http') {
          const api = await HttpApiFactory.createApi(context, document, init.api!);
          if (api) document.api = api;
        } else context.addError(`Unknown service protocol (${init.api!.protocol})`);
      });
    }
  }

  /**
   *
   * @param context
   * @protected
   */
  protected async createBuiltinDocument(context: DocumentInitContext): Promise<ApiDocument> {
    const init: ApiDocumentFactory.InitArguments = {
      spec: OpraSchema.SpecVersion,
      url: OPRA_SPEC_URL,
      info: {
        version: OpraSchema.SpecVersion,
        title: 'Opra built-in types',
        license: {
          url: 'https://github.com/oprajs/opra/blob/main/LICENSE',
          name: 'MIT',
        },
      },
      types: [
        // Primitive types
        AnyType,
        BigintType,
        BooleanType,
        IntegerType,
        NullType,
        NumberType,
        ObjectType,
        StringType,
        // Extended types
        Base64Type,
        DateType,
        DateStringType,
        DateTimeType,
        DateTimeStringType,
        EmailType,
        FieldPathType,
        FilterType,
        ObjectIdType,
        OperationResult,
        TimeType,
        UrlType,
        UuidType,
      ],
    };
    const document = new ApiDocument();
    document[BUILTIN] = true;
    const BigIntConstructor = Object.getPrototypeOf(BigInt(0)).constructor;
    const BufferConstructor = Object.getPrototypeOf(Buffer.from([]));
    const _ctorTypeMap = document.types[kCtorMap];
    _ctorTypeMap.set(Object, 'object');
    _ctorTypeMap.set(String, 'string');
    _ctorTypeMap.set(Number, 'number');
    _ctorTypeMap.set(Boolean, 'boolean');
    _ctorTypeMap.set(Object, 'any');
    _ctorTypeMap.set(Date, 'datetime');
    _ctorTypeMap.set(BigIntConstructor, 'bigint');
    _ctorTypeMap.set(ArrayBuffer, 'base64');
    _ctorTypeMap.set(SharedArrayBuffer, 'base64');
    _ctorTypeMap.set(BufferConstructor, 'base64');
    await this.initDocument(document, context, init);
    return document;
  }
}