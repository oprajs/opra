import { OpraSchema } from '../schema/index.js';
import type { ApiResource } from './resource/api-resource';
import type { Collection } from './resource/collection.js';
import { Container } from './resource/container.js';
import type { Singleton } from './resource/singleton.js';
import type { Storage } from './resource/storage.js';
import { TypeDocument } from './type-document.js';

export class ApiDocument extends TypeDocument {
  root: Container = new Container(this, {name: ''});

  /**
   * Returns Resource instance by path. Returns undefined if not found
   */
  getResource(path: string): ApiResource;
  getResource(path: string, silent: false): ApiResource;
  getResource(path: string, silent: true): ApiResource | undefined;
  getResource(path: string, silent?: boolean): ApiResource | undefined {
    return this.root.getResource(path, silent as any);
  }

  /**
   * Returns Collection resource instance by path
   * Returns undefined if not found
   * Throws error if resource is not a Collection
   */
  getContainer(path: string): Container
  getContainer(path: string, silent: false): Container
  getContainer(path: string, silent: true): Container | undefined
  getContainer(path: string, silent?: boolean): Container | undefined
  getContainer(path: string, silent?: boolean): Container | undefined {
    return this.root.getContainer(path, silent);
  }

  /**
   * Returns Collection resource instance by path
   * Returns undefined if not found
   * Throws error if resource is not a Collection
   */
  getCollection(path: string): Collection
  getCollection(path: string, silent: false): Collection
  getCollection(path: string, silent: true): Collection | undefined
  getCollection(path: string, silent?: boolean): Collection | undefined
  getCollection(path: string, silent?: boolean): Collection | undefined {
    return this.root.getCollection(path, silent);
  }

  /**
   * Returns Singleton resource instance by path
   * Returns undefined if not found
   * Throws error if resource is not a Collection
   */
  getSingleton(path: string): Singleton
  getSingleton(path: string, silent: false): Singleton
  getSingleton(path: string, silent: true): Singleton | undefined
  getSingleton(path: string, silent?: boolean): Singleton | undefined
  getSingleton(path: string, silent?: boolean): Singleton | undefined {
    return this.root.getSingleton(path, silent);
  }

  /**
   * Returns Storage resource instance by path
   * Returns undefined if not found
   * Throws error if resource is not a Collection
   */
  getStorage(path: string): Storage
  getStorage(path: string, silent: false): Storage
  getStorage(path: string, silent: true): Storage | undefined
  getStorage(path: string, silent?: boolean): Storage | undefined
  getStorage(path: string, silent?: boolean): Storage | undefined {
    return this.root.getStorage(path, silent);
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
