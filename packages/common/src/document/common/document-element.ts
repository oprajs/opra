import { asMutable } from 'ts-gems';
import { DocumentNode } from './document-node.js';

interface DocumentElementConstructor {
  new (owner?: DocumentElement): DocumentElement;

  prototype: DocumentElement;
}

/**
 * @class DocumentElement
 */
export interface DocumentElement extends DocumentElementClass {}

/**
 *
 * @constructor DocumentElement
 */
export const DocumentElement = function (this: DocumentElement, owner?: DocumentElement) {
  if (!this) throw new TypeError('"this" should be passed to call class constructor');
  const _this = asMutable(this);
  Object.defineProperty(_this, 'node', {
    value: new DocumentNode(this, owner?.node),
    enumerable: false,
    writable: true,
  });
  if (owner)
    Object.defineProperty(_this, 'owner', {
      value: owner,
      enumerable: false,
      writable: true,
    });
} as Function as DocumentElementConstructor;

/**
 * @class DocumentElement
 */
abstract class DocumentElementClass {
  readonly owner?: DocumentElement;
  readonly node: DocumentNode;
}

DocumentElement.prototype = DocumentElementClass.prototype;
