import type { TOptions } from '@browsery/i18next';
import { escapeString } from './string-utils.js';

const bracketRegEx = /(\))/g;

export function translate(
  key: string,
  options?: TOptions<Record<string, any>>,
): string;
export function translate(
  key: string,
  options: TOptions<Record<string, any>>,
  fallback: string,
): string;
export function translate(key: string, fallback: string): string;
export function translate(key: string, arg0?, arg1?): string {
  const options = arg0 && typeof arg0 === 'object' ? arg0 : undefined;
  const fallback = typeof arg0 === 'string' ? arg0 : arg1;
  return (
    '$t(' +
    key +
    (options ? ',' + JSON.stringify(options) : '') +
    (fallback
      ? '?' + escapeString(fallback).replace(bracketRegEx, '\\$1')
      : '') +
    ')'
  );
}
