import { Observable } from 'rxjs';
import { ApiDocument } from '@opra/common';
import { HttpEvent } from '../http/interfaces/http-event.js';

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
