import { JsonType } from 'ts-gems';
import { IssueSeverity } from './issue-severity.enum.js';

export interface ErrorIssue {
  // Human-readable description of the issue
  message: string;

  // Severity of the issue
  severity: IssueSeverity.Type;

  // Code of the issue
  system?: string;

  // Code of the issue
  code?: string;

  // Additional details about the error
  details?: any;

  // Additional diagnostic information about the issue
  diagnostics?: string | string[];

  // Additional information for debugging issues. This property only available in debug mode
  stack?: string[];

  [index: string]: JsonType | undefined;
}
