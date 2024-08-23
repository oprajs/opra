import type { DeepPartial, Type } from 'ts-gems';
import type { ErrorIssue } from '../../../exception/index.js';
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
  declare affected?: number;

  @ApiField()
  declare totalMatches?: number;

  @ApiField()
  declare context?: string;

  @ApiField()
  declare type?: string;

  @ApiField()
  declare message?: string;

  @ApiField({ type: 'any' })
  declare payload?: TPayload;

  @ApiField({ type: 'object' })
  declare errors?: ErrorIssue[];
}

export namespace OperationResult {
  export function forPayload(type: Type): Type<OperationResult> {
    @ComplexType({ embedded: true })
    class OperationResult_ extends OperationResult {
      constructor(...args: any[]) {
        super(...args);
      }

      @ApiField({ type, required: true })
      declare payload: any;
    }

    return OperationResult_;
  }
}
