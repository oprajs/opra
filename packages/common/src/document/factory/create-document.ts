import { OpraSchema } from '../../schema/index.js';
import { ApiDocument } from '../api-document.js';
import {
  AnyType, Base64Type, BigintType, BooleanType, DateType,
  IntegerType, NullType, NumberType, ObjectIdType, ObjectType,
  StringType, TimestampType, TimeType,
  UuidType
} from '../data-type/builtin/index.js';
import type { DocumentFactory } from './factory.js';

export async function createDocument(
    this: DocumentFactory,
    init: DocumentFactory.InitArguments,
    options?: {
      noBuiltinTypes?: boolean
    }
): Promise<ApiDocument> {
  this.document.url = init.url;
  if (init.info)
    Object.assign(this.document.info, init.info);
  if (!options?.noBuiltinTypes) {
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

  if (init.sources) {
    this.curPath.push('sources');
    if (Array.isArray(init.sources)) {
      for (const res of init.sources)
        await this.importResourceClass(res);
    } else
      this.sourceQueue.setAll(init.sources);
    await this.processResourceQueue();
    this.curPath.pop();
  }
  this.document.types.sort();
  this.document.sources.sort();
  return this.document;
}

/**
 *
 * @param url
 * @protected
 */
export async function createDocumentFromUrl(this: DocumentFactory, url: string): Promise<ApiDocument> {
  const resp = await fetch(url, {method: 'GET'});
  const init = await resp.json();
  if (!init)
    throw new TypeError(`Invalid response returned from url: ${url}`);
  return await this.createDocument({...init, url});
}

export async function createBuiltinTypeDocument(this: DocumentFactory): Promise<ApiDocument> {
  const init: DocumentFactory.InitArguments = {
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
  const factoryClass = Object.getPrototypeOf(this).constructor as typeof DocumentFactory;
  const factory = new factoryClass();
  return await factory.createDocument(init, {noBuiltinTypes: true});
}
