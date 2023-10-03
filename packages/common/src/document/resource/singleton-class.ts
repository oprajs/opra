import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import type { ComplexType } from '../data-type/complex-type.js';
import type { Container } from './container.js';
import { CrudResource } from './crud-resource.js';
import type { Endpoint } from './endpoint.js';
import type { Singleton } from './singleton.js';
import type { SingletonDecorator } from './singleton-decorator';

export class SingletonClass extends CrudResource {
  readonly kind: OpraSchema.Resource.Kind = OpraSchema.Singleton.Kind;
  readonly type: ComplexType;

  constructor(parent: ApiDocument | Container, init: Singleton.InitArguments) {
    super(parent, init);
    this.type = init.type;
    // ------------------
    let endpoint = this.operations.get('create');
    if (endpoint) {
      endpoint.returnType = this.type;
      endpoint.decode = this.type.generateCodec('decode', {
        partial: true,
        pick: endpoint.inputPickFields,
        omit: endpoint.inputOmitFields,
      })
      endpoint.encode = this.type.generateCodec('encode', {
        partial: true,
        pick: endpoint.outputPickFields,
        omit: endpoint.outputOmitFields,
      })
      endpoint.defineParameter('pick', {type: 'string', isArray: true, isBuiltin: true});
      endpoint.defineParameter('omit', {type: 'string', isArray: true, isBuiltin: true});
      endpoint.defineParameter('include', {type: 'string', isArray: true, isBuiltin: true});
    }
    // ------------------
    endpoint = this.operations.get('get');
    if (endpoint) {
      endpoint.returnType = this.type;
      endpoint.encode = this.type.generateCodec('encode', {
        partial: true,
        pick: endpoint.outputPickFields,
        omit: endpoint.outputOmitFields,
      })
      endpoint.defineParameter('pick', {type: 'string', isArray: true, isBuiltin: true});
      endpoint.defineParameter('omit', {type: 'string', isArray: true, isBuiltin: true});
      endpoint.defineParameter('include', {type: 'string', isArray: true, isBuiltin: true});
    }
    // ------------------
    endpoint = this.operations.get('update');
    if (endpoint) {
      endpoint.returnType = this.type;
      endpoint.decode = this.type.generateCodec('decode', {
        pick: endpoint.inputPickFields,
        omit: endpoint.inputOmitFields,
      })
      endpoint.encode = this.type.generateCodec('encode', {
        partial: true,
        pick: endpoint.outputPickFields,
        omit: endpoint.outputOmitFields,
      })
      endpoint.defineParameter('pick', {type: 'string', isArray: true, isBuiltin: true});
      endpoint.defineParameter('omit', {type: 'string', isArray: true, isBuiltin: true});
      endpoint.defineParameter('include', {type: 'string', isArray: true, isBuiltin: true});
    }
  }

  getOperation(name: 'create'): (Endpoint & Omit<SingletonDecorator.Create.Metadata, keyof Endpoint>) | undefined;
  getOperation(name: 'delete'): (Endpoint & Omit<SingletonDecorator.Delete.Metadata, keyof Endpoint>) | undefined;
  getOperation(name: 'get'): (Endpoint & Omit<SingletonDecorator.Get.Metadata, keyof Endpoint>) | undefined;
  getOperation(name: 'update'): (Endpoint & Omit<SingletonDecorator.Update.Metadata, keyof Endpoint>) | undefined;
  getOperation(name: string): Endpoint | undefined {
    return super.getOperation(name);
  }

  exportSchema(options?: { webSafe?: boolean }): OpraSchema.Singleton {
    return {
      ...super.exportSchema(options) as OpraSchema.Singleton,
      type: this.type.name || 'any'
    };
  }

  normalizeFieldPath(path: string | string[]): string[] | undefined {
    return this.type.normalizeFieldPath(path);
  }

}
