import { ApiDocumentFactory } from '@opra/common';
import { RootController } from './api/root.controller.js';
import { Country } from './entities/country.entity.js';
import { Customer } from './entities/customer.entity.js';
import { Profile } from './entities/profile.entity.js';
import { GenderEnum } from './enums/gender.enum.js';
import { Address } from './types/address.type.js';
import { Note } from './types/note.type.js';
import { Person } from './types/person.type.js';
import { Record } from './types/record.type.js';

export * from './entities/country.entity.js';
export * from './entities/customer.entity.js';
export * from './entities/profile.entity.js';

export async function createTestApi() {
  return ApiDocumentFactory.createDocument({
    spec: '1.0',
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    },
    types: [Address, Note, Person, Record, GenderEnum, Country, Customer, Profile],
    api: {
      protocol: 'http',
      name: 'TestApi',
      root: RootController,
    },
  });
}
