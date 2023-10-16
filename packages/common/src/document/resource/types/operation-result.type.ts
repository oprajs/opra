import { DeepPartial } from 'ts-gems';
import { ErrorIssue } from '../../../exception/index.js';
import { ComplexType } from '../../data-type/complex-type.js';
import { ApiField } from '../../data-type/field.js';

@ComplexType({
  description: 'Operation result'
})
export class OperationResult<TPayload = any> {

  constructor(init?: DeepPartial<OperationResult>) {
    if (init)
      Object.assign(this, init)
  }

  @ApiField()
  context?: string;

  @ApiField()
  contextUrl?: string;

  @ApiField()
  type?: string;

  @ApiField()
  typeUrl?: string;

  @ApiField()
  affected?: number;

  @ApiField()
  count?: number;

  @ApiField()
  totalMatches?: number;

  @ApiField({type: 'any'})
  payload?: TPayload;

  @ApiField({type: 'object'})
  errors?: ErrorIssue[];

}
