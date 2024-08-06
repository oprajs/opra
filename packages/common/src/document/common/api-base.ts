import { omitUndefined } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document';
import { CLASS_NAME_PATTERN } from '../constants.js';
import { DocumentElement } from './document-element.js';
import type { DocumentInitContext } from './document-init-context';

export namespace ApiBase {
  export interface InitArguments extends Pick<OpraSchema.Api, 'description' | 'name'> {}
}

export abstract class ApiBase extends DocumentElement {
  abstract readonly protocol: OpraSchema.Protocol;
  declare readonly owner: ApiDocument | ApiBase;
  name: string = 'OpraApi';
  description?: string;

  protected constructor(owner: ApiDocument | ApiBase) {
    super(owner);
  }

  toJSON(): OpraSchema.Api {
    return omitUndefined<OpraSchema.Api>({
      protocol: this.protocol,
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
