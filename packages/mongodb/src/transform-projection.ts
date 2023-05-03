import mongodb from 'mongodb';
import { ComplexType, pathToObjectTree } from '@opra/common';

export default function transformProjection(
    dataType: ComplexType,
    args: {
      pick?: string[],
      omit?: string[],
      include?: string[],
    }
): mongodb.Document | undefined {
  const out: Record<string, boolean> = {};
  // omitExclusiveFields(dataType, out);
  const pick = args.pick && pathToObjectTree(
      args.include ? [...args.pick, ...args.include] : args.pick
  );
  const include = !args.pick && args.include && pathToObjectTree(args.include);
  const omit = args.omit && pathToObjectTree(args.omit);
  if (pick || include) {
    _transformInclusionProjection(dataType, out, pick, include, omit);
  } else
    _transformExclusionProjection(dataType, out, omit, !omit);
  return Object.keys(out).length ? out : undefined;
}

export function _transformInclusionProjection(
    dataType: ComplexType,
    target: mongodb.Document,
    pick?: any,
    include?: any,
    omit?: any,
    defaultFields?: boolean
) {
  defaultFields = defaultFields ?? !pick;
  let n;
  for (const [k, f] of dataType.fields.entries()) {
    if (omit?.[k] === true)
      continue;
    n = (defaultFields && !f.exclusive) ||
        pick === true || pick?.[k] || include === true || include?.[k];
    if (n) {
      if (f.type instanceof ComplexType && (typeof n === 'object' || typeof omit?.[k] === 'object')) {
        target[k] = {};
        _transformInclusionProjection(f.type, target[k],
            pick?.[k] || include?.[k],
            undefined,
            omit?.[k],
            defaultFields
        );
        continue;
      }
      target[k] = 1;
    }
  }
}

export function _transformExclusionProjection(
    dataType: ComplexType,
    target: mongodb.Document,
    omit?: any,
    omitExclusiveFields?: boolean
) {
  let n;
  for (const [k, f] of dataType.fields.entries()) {
    n = omit?.[k] || (omitExclusiveFields && f.exclusive);
    if (n) {
      if (f.type instanceof ComplexType && typeof n === 'object') {
        target[k] = {};
        _transformExclusionProjection(f.type, target[k], omit?.[k], omitExclusiveFields);
        continue;
      }
      target[k] = 0;
    }
  }
}
