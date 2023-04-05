import type { OpraSchema } from '../../schema/index.js';
import { ApiDocument } from '../api-document.js';
import type { DocumentFactory } from './factory.js';

export async function addReferences(
    this: DocumentFactory,
    references: Record<string, string | OpraSchema.ApiDocument | ApiDocument>
): Promise<void> {
  const {document} = this;
  for (const [ns, r] of Object.entries<any>(references)) {
    if (typeof r === 'string') {
      document.references.set(ns, await this.createDocumentFromUrl(r));
    } else if (r instanceof ApiDocument)
      document.references.set(ns, r);
    else if (typeof r === 'object') {
      document.references.set(ns, await this.createDocument(r));
    } else throw new TypeError(`Invalid document reference (${ns}) in schema`);
  }
}
