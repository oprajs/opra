import { Observable } from 'rxjs';
import { ApiDocument } from '@opra/common';
import { HttpEvent } from '../http/interfaces/http-event.js';

export abstract class Backend implements Backend {
  api?: ApiDocument;

  protected constructor(options?: Backend.Options) {
    this.api = options?.api;
  }

  abstract handle(init: Backend.RequestInit): Observable<HttpEvent>;
}

/**
 * @namespace Backend
 */
export namespace Backend {
  export interface Options {
    api?: ApiDocument;
  }

  export interface RequestInit {
  }
}
