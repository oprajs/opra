import { ApiDocument } from '@opra/common';
import { Observable } from 'rxjs';
import type { HttpEvent } from '../http/interfaces/http-event.js';

export abstract class Backend implements Backend {
  document?: ApiDocument;

  protected constructor(options?: Backend.Options) {
    this.document = options?.document;
  }

  abstract handle(init: Backend.RequestInit): Observable<HttpEvent>;
}

/**
 * @namespace Backend
 */
export namespace Backend {
  export interface Options {
    document?: ApiDocument;
  }

  export interface RequestInit {}
}
