export namespace IssueSeverity {
  export enum Enum {
    'fatal' = 'fatal',
    'error' = 'error',
    'warning' = 'warning',
    'info' = 'info',
  }

  export const name = 'IssueSeverity';
  export const description = 'Severity of the issue';
  export const Keys = Object.keys(IssueSeverity);
  export type Type = keyof typeof Enum;
  export const descriptions: Record<Enum, string> = {
    fatal: 'The issue caused the action to fail and no further checking could be performed',
    error: 'The issue is sufficiently important to cause the action to fail',
    warning:
      'The issue is not important enough to cause the action to fail but ' +
      'may cause it to be performed suboptimally or in a way that is not as desired',
    info: 'The issue has no relation to the degree of success of the action',
  };
}
