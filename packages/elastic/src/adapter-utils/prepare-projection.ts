import { ApiField, ComplexType, FieldsProjection, parseFieldsProjection } from '@opra/common';

export interface ElasticProjection {
  includes?: string[];
  excludes?: string[];
}

export default function prepareProjection(
  dataType: ComplexType,
  projection?: string | string[],
): ElasticProjection | undefined {
  const out: ElasticProjection = {};
  const includes: string[] = [];
  const excludes: string[] = [];
  const projection_ =
    typeof projection === 'string' || Array.isArray(projection) ? parseFieldsProjection(projection) : projection;
  prepare(dataType, includes, excludes, '', projection_);
  if (includes.length) out.includes = includes;
  if (excludes.length) out.excludes = excludes;
  return includes.length || excludes.length ? out : undefined;
}

function getNeedIncludes(projection?: FieldsProjection): boolean {
  return !!(projection && Object.values(projection).find(p => !p.sign));
}

export function prepare(
  dataType: ComplexType,
  includes: string[],
  excludes: string[],
  curPath: string,
  projection?: FieldsProjection,
) {
  const needIncludes = getNeedIncludes(projection);
  const projectionKeys = projection && Object.keys(projection);
  const projectionKeysSet = new Set(projectionKeys);
  let fieldName: string;
  let fieldPath: string;
  let field: ApiField;
  let k: string;
  /** Add fields from data type */
  for (field of dataType.fields.values()) {
    fieldName = field.name;
    fieldPath = curPath + (curPath ? '.' : '') + fieldName;
    k = fieldName.toLowerCase();
    projectionKeysSet.delete(k);
    const p = projection?.[k];
    if (
      /** if field is omitted */
      p?.sign === '-' ||
      /** if no projection defined for this field and includeDefaultFields is true and the field is exclusive */
      (!p && field.exclusive)
    ) {
      if (!needIncludes) excludes.push(fieldPath);
      continue;
    }

    if (needIncludes && p && !includes.includes(fieldPath)) {
      if (!getNeedIncludes(p?.projection)) {
        includes.push(fieldPath);
      }
    }
    if (field.type instanceof ComplexType && typeof p?.projection === 'object') {
      prepare(field.type, includes, excludes, fieldPath, p.projection);
    }
  }
  if (dataType.additionalFields) {
    for (k of projectionKeysSet.values()) {
      const n = projection?.[k];
      fieldPath = curPath + (curPath ? '.' : '') + k;
      if (n?.sign === '-') {
        if (!needIncludes) excludes.push(fieldPath);
      } else includes.push(fieldPath);
    }
  }
}
