import type { ApiDocument } from '../api-document.js';

export abstract class ApiElement {
  readonly document: ApiDocument;

  protected constructor(document: ApiDocument) {
    this.document = document;
  }
}
