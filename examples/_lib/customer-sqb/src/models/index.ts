import '@opra/sqb';
import { ApiDocument, ApiDocumentFactory, OpraSchema } from '@opra/common';
import { Gender } from './enums/gender.js';
import { Address } from './types/address.js';
import { Country } from './types/country.js';
import { Customer } from './types/customer.js';
import { Note } from './types/note.js';
import { Person } from './types/person.js';
import { Profile } from './types/profile.js';
import { Record } from './types/record.js';

export * from './enums/gender.js';
export * from './types/country.js';
export * from './types/customer.js';
export * from './types/profile.js';
export * from './types/address.js';
export * from './types/note.js';
export * from './types/person.js';
export * from './types/record.js';

export namespace CustomerModelsDocument {
  let document: ApiDocument | undefined;
  export const schema: ApiDocumentFactory.InitArguments = {
    spec: OpraSchema.SpecVersion,
    info: {
      title: 'Customer Models Document',
      version: 'v1',
      description: 'This document contains model definitions of customer app',
    },
    types: [Record, Person, Gender, Address, Note, Country, Customer, Profile],
  };

  export async function create(): Promise<ApiDocument> {
    return ApiDocumentFactory.createDocument(schema);
  }

  export async function init(): Promise<ApiDocument> {
    if (!document) document = await create();
    return document;
  }
}
