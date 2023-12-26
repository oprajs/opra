import { NotAcceptableError, ResourceNotAvailableError } from '../../exception/index.js';
import { ResponsiveMap } from '../../helpers/index.js';
import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import type { Collection } from './collection.js';
import type { Container } from './container.js';
import { Resource } from './resource.js';
import { Singleton } from './singleton.js';
import { Storage } from './storage.js';

const PATH_PREFIX_PATTERN = /^(\/*)(.+)$/;

export class ContainerClass extends Resource {
  readonly kind: OpraSchema.Resource.Kind = OpraSchema.Container.Kind;
  readonly resources = new ResponsiveMap<Resource>();
  readonly parent?: Container;

  constructor(owner: ApiDocument | Container, init: Container.InitArguments) {
    super(owner instanceof ContainerClass ? owner.document : owner, init);
    this.parent = owner instanceof ContainerClass ? owner : undefined;
  }

  exportSchema(options?: { webSafe?: boolean }): OpraSchema.Container {
    const schema = super.exportSchema(options) as OpraSchema.Container;
    if (this.resources.size) {
      const resources = schema.resources = {};
      for (const [name, r] of this.resources.entries()) {
        resources[name] = r.exportSchema(options);
      }
    }
    return schema;
  }

  /**
   * Returns Resource instance by path. Returns undefined if not found
   * @param path
   * @param silent
   */
  getResource(path: string, silent: boolean): Resource | undefined;
  getResource(path: string, silent: true): Resource | undefined;
  /**
   * Returns Resource instance by path. Throws error if not found
   * @param path
   */
  getResource(path: string): Resource;
  getResource(path: string, silent: false): Resource;
  getResource(path: string, silent?: boolean): Resource | undefined {
    let resource: Resource | undefined;
    path = PATH_PREFIX_PATTERN.exec(path)?.[2] || path;
    if (path.includes('/')) {
      const arr = path.split('/');
      let i: number;
      const l = arr.length;
      let container: ContainerClass = this;
      for (i = 0; i < l; i++) {
        resource = container.resources.get(arr[i]);
        if (resource instanceof ContainerClass)
          container = resource;
        else break;
      }
      // If no resource found or walking through path not completed
      if (!resource || i < l - 1)
        resource = undefined;
    } else
      resource = this.resources.get(path);
    if (resource || silent)
      return resource;
    throw new ResourceNotAvailableError(path);
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
    const t = this.getResource(path);
    if (!t && silent)
      return;
    if (t && t.kind === OpraSchema.Container.Kind)
      return t as Container;
    throw new NotAcceptableError(`Resource type "${t.name}" is not a Container`);
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
    const t = this.getResource(path);
    if (!t && silent)
      return;
    if (t && t.kind === OpraSchema.Collection.Kind)
      return t as Collection;
    throw new NotAcceptableError(`Resource type "${t.name}" is not a Collection`);
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
    const t = this.getResource(path);
    if (!t && silent)
      return;
    if (t && t.kind === OpraSchema.Singleton.Kind)
      return t as Singleton;
    throw new NotAcceptableError(`Resource type "${t.name}" is not a Singleton`);
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
    const t = this.getResource(path);
    if (!t && silent)
      return;
    if (t && t.kind === OpraSchema.Storage.Kind)
      return t as Storage;
    throw new NotAcceptableError(`Resource type "${t.name}" is not a Storage`);
  }


}
