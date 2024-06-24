import { DeepPartial, Type } from 'ts-gems';
import { ErrorIssue } from '../../../exception/index.js';
import { ApiField } from '../api-field.js';
import { ComplexType } from '../complex-type.js';

@ComplexType({
  description: 'Operation result',
})
export class OperationResult<TPayload = any> {
  constructor(init?: DeepPartial<OperationResult>) {
    if (init) Object.assign(this, init);
  }

  @ApiField()
  affected?: number;

  @ApiField()
  totalMatches?: number;

  @ApiField()
  context?: string;

  @ApiField()
  type?: string;

  @ApiField()
  message?: string;

  @ApiField({ type: 'any' })
  payload?: TPayload;

  @ApiField({ type: 'object' })
  errors?: ErrorIssue[];
}

export namespace OperationResult {
  export function forPayload(type: Type): Type<OperationResult> {
    @ComplexType({ embedded: true })
    class OperationResult_ extends OperationResult {
      constructor(...args: any[]) {
        super(...args);
      }

      @ApiField({ type, required: true })
      payload: any;
    }

    return OperationResult_;
  }
}
