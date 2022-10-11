import { OprComplexType, OprField } from '@opra/schema';
import { IssueSeverity } from './enums/issue-severity.enum.js';

export interface IErrorIssue {
  message: string;
  severity: IssueSeverity.Type;
  code?: string;
  details?: any;
  diagnostics?: string | string[];
  debugInfo?: string;
}

@OprComplexType()
export class ErrorIssue implements IErrorIssue {

  constructor(init: IErrorIssue) {
    Object.assign(this, init);
  }

  @OprField({
    description: 'Human-readable description of the issue'
  })
  message: string;

  @OprField({
    description: IssueSeverity.description,
    enum: IssueSeverity.Enum,
    enumName: IssueSeverity.name
  })
  severity: IssueSeverity.Type;

  @OprField({
    description: 'Code of the issue',
    optional: true
  })
  code?: string;

  @OprField({
    description: 'Additional details about the error',
    optional: true
  })
  details?: any;

  @OprField({
    description: 'Additional diagnostic information about the issue',
    optional: true
  })
  diagnostics?: string | string[];

  @OprField({
    description: 'Additional information for debugging issues. This property only available in debug mode',
    optional: true
  })
  debugInfo?: string;
}
