import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import type { ComplexType } from '../data-type/complex-type.js';
import type { ApiOperation } from './api-operation';
import type { Container } from './container.js';
import { CrudResource } from './crud-resource.js';
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
      endpoint.defineParameter('pick', {type: 'string', isArray: true, isBuiltin: true});
      endpoint.defineParameter('omit', {type: 'string', isArray: true, isBuiltin: true});
      endpoint.defineParameter('include', {type: 'string', isArray: true, isBuiltin: true});
      endpoint.decodeInput = this.type.generateCodec('decode', {
        partial: true,
        pick: endpoint.options.inputPickFields,
        omit: endpoint.options.inputOmitFields,
        operation: 'write',
        overwriteFields: endpoint.inputOverwriteFields
      })
      endpoint.response.type = this.type;
      (endpoint.response as any)._encoder = endpoint.response.type.generateCodec('encode', {
        partial: true,
        pick: endpoint.options.outputPickFields,
        omit: endpoint.options.outputOmitFields,
        operation: 'read',
        overwriteFields: endpoint.outputOverwriteFields
      })
    }
    // ------------------
    endpoint = this.operations.get('get');
    if (endpoint) {
      endpoint.defineParameter('pick', {type: 'string', isArray: true, isBuiltin: true});
      endpoint.defineParameter('omit', {type: 'string', isArray: true, isBuiltin: true});
      endpoint.defineParameter('include', {type: 'string', isArray: true, isBuiltin: true});
      endpoint.response.type = this.type;
      (endpoint.response as any)._encoder = endpoint.response.type.generateCodec('encode', {
        partial: true,
        pick: endpoint.options.outputPickFields,
        omit: endpoint.options.outputOmitFields,
        operation: 'read',
        overwriteFields: endpoint.outputOverwriteFields
      })
    }
    // ------------------
    endpoint = this.operations.get('update');
    if (endpoint) {
      endpoint.defineParameter('pick', {type: 'string', isArray: true, isBuiltin: true});
      endpoint.defineParameter('omit', {type: 'string', isArray: true, isBuiltin: true});
      endpoint.defineParameter('include', {type: 'string', isArray: true, isBuiltin: true});
      endpoint.decodeInput = this.type.generateCodec('decode', {
        pick: endpoint.options.inputPickFields,
        omit: endpoint.options.inputOmitFields,
        operation: 'write',
        overwriteFields: endpoint.inputOverwriteFields
      })
      endpoint.response.type = this.type;
      (endpoint.response as any)._encoder = endpoint.response.type.generateCodec('encode', {
        partial: true,
        pick: endpoint.options.outputPickFields,
        omit: endpoint.options.outputOmitFields,
        operation: 'read',
        overwriteFields: endpoint.outputOverwriteFields
      })
    }
  }

  getOperation(name: 'create'): (ApiOperation & Omit<SingletonDecorator.Create.Metadata, keyof ApiOperation>) | undefined;
  getOperation(name: 'delete'): (ApiOperation & Omit<SingletonDecorator.Delete.Metadata, keyof ApiOperation>) | undefined;
  getOperation(name: 'get'): (ApiOperation & Omit<SingletonDecorator.Get.Metadata, keyof ApiOperation>) | undefined;
  getOperation(name: 'update'): (ApiOperation & Omit<SingletonDecorator.Update.Metadata, keyof ApiOperation>) | undefined;
  getOperation(name: string): ApiOperation | undefined {
    return super.getOperation(name);
  }

  exportSchema(options?: { webSafe?: boolean }): OpraSchema.Singleton {
    return {
      ...super.exportSchema(options) as OpraSchema.Singleton,
      type: this.type.name || 'any'
    };
  }

  normalizeFieldNames(path: string | string[]): string[] | undefined {
    return this.type.normalizeFieldNames(path);
  }

}
