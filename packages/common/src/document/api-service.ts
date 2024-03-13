import { OpraSchema } from '../schema/index.js';
import type { ApiDocument } from './api-document.js';
import { ApiDocumentElement } from './api-document-element.js';
import { SERVICE_NAME_PATTERN } from './constants.js';

export namespace ApiService {
  export interface InitArguments extends Pick<OpraSchema.Service, 'description'> {
  }
}

export abstract class ApiService extends ApiDocumentElement {
  abstract readonly protocol: OpraSchema.Protocol;
  readonly name: string;
  description?: string;

  protected constructor(parent: ApiDocument, serviceName: string, init?: ApiService.InitArguments) {
    super(parent);
    if (!SERVICE_NAME_PATTERN.test(serviceName))
      throw new TypeError(`Invalid service name (${serviceName})`);
    this.name = serviceName;
    this.description = init?.description;
  }

  toJSON(): OpraSchema.Service {
    return {
      protocol: this.protocol,
      description: this.description
    }
  }

}
