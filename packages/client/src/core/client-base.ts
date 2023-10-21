import { ApiDocument } from '@opra/common';
import { kBackend } from '../constants.js';
import { Backend } from './backend.js';

/**
 *
 * @class ClientBase
 * @abstract
 */
export abstract class ClientBase {
  [kBackend]: Backend;

  protected constructor(backend: Backend) {
    Object.defineProperty(this, kBackend, {
          enumerable: false,
          value: backend
        }
    );
  }

}


/**
 *
 * @namespace ClientBase
 */
export namespace ClientBase {
  export interface Options {
    api?: ApiDocument;
  }
}
