import {
  ApiField,
  ComplexType,
  FieldsProjection,
  parseFieldsProjection,
} from '@opra/common';
import mongodb, { type Document } from 'mongodb';

export default function prepareProjection(
  dataType: ComplexType,
  projection?: string | string[] | Document | '*',
  scopes?: string[],
): mongodb.Document | undefined {
  if (projection === '*') return undefined;
  if (
    projection &&
    typeof projection === 'object' &&
    !Array.isArray(projection)
  )
    return projection;
  const out: Record<string, boolean> = {};
  const projection_ =
    typeof projection === 'string' || Array.isArray(projection)
      ? parseFieldsProjection(projection)
      : projection;
  prepare(dataType, out, projection_, scopes);
  return Object.keys(out).length ? out : undefined;
}

export function prepare(
  dataType: ComplexType,
  target: mongodb.Document,
  projection?: FieldsProjection,
  scopes?: string[],
) {
  const defaultFields =
    !projection || !Object.values(projection).find(p => !p.sign);
  const projectionKeys = projection && Object.keys(projection);
  const projectionKeysSet = new Set(projectionKeys);
  let fieldName: string;
  let field: ApiField;
  let k: string;
  /** Add fields from data type */
  for (field of dataType.fields.values()) {
    fieldName = field.name;
    k = fieldName.toLowerCase();
    projectionKeysSet.delete(k);
    /** Ignore if field is not in scope */
    if (!field.inScope(scopes)) continue;
    const p = projection?.[k];
    if (
      /** Ignore if field is omitted */
      p?.sign === '-' ||
      /** Ignore if defaultFields is false and field is not in projection */
      (!defaultFields && !p) ||
      /** Ignore if defaultFields is true and fields is exclusive */
      (defaultFields && field.exclusive && !p)
    ) {
      continue;
    }

    if (
      field.type instanceof ComplexType &&
      typeof p?.projection === 'object'
    ) {
      target[fieldName] = {};
      prepare(field.type, target[fieldName], p.projection);
      continue;
    }
    target[fieldName] = 1;
  }
  /** Add additional fields */
  if (dataType.additionalFields) {
    for (k of projectionKeysSet.values()) {
      const n = projection?.[k];
      if (n?.sign !== '-') target[k] = 1;
    }
  }
}
