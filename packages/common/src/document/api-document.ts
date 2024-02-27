import { OpraSchema } from '../schema/index.js';
import { ApiResource } from './resource/api-resource.js';
import { TypeDocument } from './type-document.js';

export class ApiDocument extends TypeDocument {
  root: ApiResource;

  /**
   * Returns Resource instance by path. Returns undefined if not found
   * @param path
   */
  getResource(path: string): ApiResource | undefined {
    return this.root.getResource(path);
  }

  /**
   * Export as Opra schema definition object
   */
  exportSchema(): OpraSchema.ApiDocument {
    const schema = super.exportSchema() as OpraSchema.ApiDocument;
    schema.root = this.root.exportSchema();
    delete (schema.root as any).kind;
    return schema;
  }

}
