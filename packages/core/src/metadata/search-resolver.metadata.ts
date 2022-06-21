import _ from 'lodash';
import {SearchResolverDefinitionArgs} from '../interfaces/definition/definition-args.interface';
import {ResolverDefinition} from '../interfaces/definition/endpoint-definition.interface';
import {BaseResolverMetadata} from './base-resolver.metadata';

export class SearchResolverMetadata extends BaseResolverMetadata implements SearchResolverDefinitionArgs {
  maxLimit?: number;
  defaultLimit?: number;

  constructor(args: SearchResolverDefinitionArgs) {
    super({
      actionType: 'search',
      name: args.name,
      fn: args.fn
    });
    Object.assign(this, _.reject(args, ['actionType', 'name', 'fn']));
  }

  extractDefinition(): ResolverDefinition {
    return Object.assign(super.extractDefinition(), _.pick(this, ['maxLimit', 'defaultLimit']));
  }
}
