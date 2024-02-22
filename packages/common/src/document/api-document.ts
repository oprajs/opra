import { OpraSchema } from '../schema/index.js';
import { ApiResource } from './resource/api-resource.js';
import { TypeDocument } from './type-document.js';

export class ApiDocument extends TypeDocument {
  root: ApiResource;

  /**
   * Returns Resource instance by path. Returns undefined if not found
   * @param path
   */
  findResource(path: string): ApiResource | undefined {
    return this.root.findResource(path);
  }

  /**
   * Returns Resource instance by path. Throws error if not found
   * @param path
   */
  getResource(path: string): ApiResource {
    return this.root.getResource(path);
  }

  /**
   * Export as Opra schema definition object
   */
  exportSchema(options?: { webSafe?: boolean }): OpraSchema.ApiDocument {
    const schema = super.exportSchema(options) as OpraSchema.ApiDocument;
    schema.root = this.root.exportSchema(options);
    delete (schema.root as any).kind;
    return schema;
  }

}
