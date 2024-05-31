import { OpraException } from '../../exception/opra-exception.js';

export namespace OpraDocumentError {
  export interface ErrorDetail {
    message: string;
    path: string;
  }
}

export class OpraDocumentError extends OpraException {
  details: OpraDocumentError.ErrorDetail[] = [];

  constructor() {
    super('');
  }

  add(detail: OpraDocumentError.ErrorDetail) {
    this.details.push(detail);
    return this;
  }
}
