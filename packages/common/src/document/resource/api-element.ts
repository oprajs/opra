import type { ApiDocument } from '../api-document.js';

export abstract class ApiElement {
  readonly document: ApiDocument;
  readonly parent?: ApiElement;

  protected constructor(parent: ApiDocument | ApiElement) {
    this.document = parent instanceof ApiElement ? parent.document : parent;
    if (parent instanceof ApiElement)
      this.parent = parent;
  }
}
