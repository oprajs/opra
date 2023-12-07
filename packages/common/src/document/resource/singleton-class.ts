import { OpraSchema } from '../../schema/index.js';
import type { ApiDocument } from '../api-document.js';
import type { ComplexType } from '../data-type/complex-type.js';
import type { Container } from './container.js';
import type { CrudOperation } from './crud-operation';
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
      endpoint.returnType = this.type;
      endpoint.encodeReturning = endpoint.returnType.generateCodec('encode', {
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
      endpoint.returnType = this.type;
      endpoint.encodeReturning = endpoint.returnType.generateCodec('encode', {
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
      endpoint.returnType = this.type;
      endpoint.encodeReturning = endpoint.returnType.generateCodec('encode', {
        partial: true,
        pick: endpoint.options.outputPickFields,
        omit: endpoint.options.outputOmitFields,
        operation: 'read',
        overwriteFields: endpoint.outputOverwriteFields
      })
    }
  }

  getOperation(name: 'create'): (CrudOperation & Omit<SingletonDecorator.Create.Metadata, keyof CrudOperation>) | undefined;
  getOperation(name: 'delete'): (CrudOperation & Omit<SingletonDecorator.Delete.Metadata, keyof CrudOperation>) | undefined;
  getOperation(name: 'get'): (CrudOperation & Omit<SingletonDecorator.Get.Metadata, keyof CrudOperation>) | undefined;
  getOperation(name: 'update'): (CrudOperation & Omit<SingletonDecorator.Update.Metadata, keyof CrudOperation>) | undefined;
  getOperation(name: string): CrudOperation | undefined {
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
