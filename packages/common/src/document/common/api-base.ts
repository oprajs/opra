import { omitUndefined } from '@jsopen/objects';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import { CLASS_NAME_PATTERN } from '../constants.js';
import { DocumentElement } from './document-element.js';
import type { DocumentInitContext } from './document-init-context';

export namespace ApiBase {
  export interface InitArguments extends Pick<OpraSchema.Api, 'description' | 'name'> {
    owner: ApiDocument | ApiBase;
  }
}

export abstract class ApiBase extends DocumentElement {
  abstract readonly transport: OpraSchema.Transport;
  declare readonly owner: ApiDocument | ApiBase;
  name: string = 'OpraApi';
  description?: string;

  protected constructor(init: ApiBase.InitArguments) {
    super(init.owner);
    this.name = init.name;
    this.description = init.description;
  }

  toJSON(): OpraSchema.Api {
    return omitUndefined<OpraSchema.Api>({
      transport: this.transport,
      name: this.name,
      description: this.description,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async _initialize(init: ApiBase.InitArguments, context: DocumentInitContext) {
    if (!CLASS_NAME_PATTERN.test(init.name)) throw new TypeError(`Invalid api name (${init.name})`);
    this.name = init.name;
    this.description = init?.description;
  }
}
