import _ from 'lodash';
import {BaseResolverDefinitionArgs} from '../interfaces/definition/definition-args.interface';
import {ResolverDefinition} from '../interfaces/definition/endpoint-definition.interface';
import {EndpointResolverFunction, ResolveAction} from '../types';

export abstract class BaseResolverMetadata implements BaseResolverDefinitionArgs {
  actionType: ResolveAction;
  name: string;
  description?: string;
  methodName: string;
  fn: EndpointResolverFunction;

  protected constructor(args: BaseResolverDefinitionArgs) {
    this.actionType = args.actionType;
    this.name = args.name;
    this.fn = args.fn;
  }

  extractDefinition(): ResolverDefinition {
    return Object.assign({}, _.pick(this, ['actionType', 'name', 'description', 'fn']));
  }
}
