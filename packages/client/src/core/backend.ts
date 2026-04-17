import { ApiDocument } from '@opra/common';
import { Observable } from 'rxjs';
import type { HttpEvent } from '../http/interfaces/http-event.js';

/**
 * Abstract base class for all backends.
 *
 * @class Backend
 */
export abstract class Backend implements Backend {
  /** The API document associated with this backend */
  document?: ApiDocument;

  /**
   * Creates a new instance of Backend.
   *
   * @param options Configuration options.
   * @protected
   */
  protected constructor(options?: Backend.Options) {
    this.document = options?.document;
  }

  /**
   * Handles the request and returns an observable of {@link HttpEvent}.
   *
   * @param init The request initialization parameters.
   * @returns An observable of HttpEvent.
   */
  abstract handle(init: Backend.RequestInit): Observable<HttpEvent>;
}

/**
 * Namespace for {@link Backend} related types and interfaces.
 *
 * @namespace Backend
 */
export namespace Backend {
  /** Configuration options for Backend */
  export interface Options {
    /** The API document associated with this backend */
    document?: ApiDocument;
  }

  /** Request initialization parameters for Backend */
  export interface RequestInit {}
}
