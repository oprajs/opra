import { ApiField, ComplexType, FieldsProjection, parseFieldsProjection } from '@opra/common';
import mongodb, { Document } from 'mongodb';

export default function prepareProjection(
  dataType: ComplexType,
  projection?: string | string[] | Document,
): mongodb.Document | undefined {
  if (projection && typeof projection === 'object' && !Array.isArray(projection)) return projection;
  const out: Record<string, boolean> = {};
  const projection_ =
    typeof projection === 'string' || Array.isArray(projection) ? parseFieldsProjection(projection) : projection;
  // const exclusionProjection = !pick && !!omit;
  prepare(dataType, out, projection_);
  return Object.keys(out).length ? out : undefined;
}

export function prepare(dataType: ComplexType, target: mongodb.Document, projection?: FieldsProjection) {
  const defaultFields = !projection || !Object.values(projection).find(p => !p.sign);
  const projectionKeys = projection && Object.keys(projection).map(x => x.toLowerCase());
  const projectionKeysSet = new Set(projectionKeys);
  let fieldName: string;
  let field: ApiField;
  let k: string;
  /** Add fields from data type */
  for (field of dataType.fields.values()) {
    fieldName = field.name;
    k = fieldName.toLowerCase();
    projectionKeysSet.delete(k);
    const p = projection?.[k];
    if (
      /** Ignore if field is omitted */
      p?.sign === '-' ||
      /** Ignore if default fields and field is not in projection */
      (!defaultFields && !p) ||
      /** Ignore if default fields enabled and fields is exclusive */
      (defaultFields && field.exclusive && !p)
    ) {
      continue;
    }

    if (field.type instanceof ComplexType && typeof p?.projection === 'object') {
      target[fieldName] = {};
      prepare(field.type, target[fieldName], p.projection);
      continue;
    }
    target[fieldName] = 1;
  }
  /** Add additional fields */
  if (dataType.additionalFields) {
    for (k of projectionKeysSet.values()) {
      const n = projectionKeysSet[k];
      if (n?.sign !== '-') target[k] = 1;
    }
  }
}
