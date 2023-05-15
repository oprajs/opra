import isNil from 'lodash.isnil';
import omitBy from 'lodash.omitby';
import { ComplexType } from '@opra/common';

export default function transformProjection(
    dataType: ComplexType,
    args: {
      pick?: string[],
      omit?: string[],
      include?: string[],
    }
): any {
  let includes: string[] | undefined;
  let excludes: string[] | undefined;

  if (args.include && !args.pick) {
    includes = includes || [];
    for (const [k, f] of dataType.fields) {
      if (f.exclusive)
        continue;
      if (f.type instanceof ComplexType)
        includes.push(k + '.*')
      else includes.push(k);
    }
  }

  if (args.pick) {
    includes = includes || [];
    for (const k of args.pick) {
      const f = dataType.getField(k);
      if (f.type instanceof ComplexType)
        includes.push(k + '.*')
      else includes.push(k);
    }
  }

  if (args.include) {
    includes = includes || [];
    for (const k of args.include) {
      const f = dataType.getField(k);
      if (f.type instanceof ComplexType)
        includes.push(k + '.*')
      else includes.push(k);
    }
  }

  if (args.omit) {
    excludes = excludes || [];
    for (const k of args.omit) {
      const f = dataType.getField(k);
      if (f.type instanceof ComplexType)
        excludes.push(k + '.*')
      else excludes.push(k);
    }
  }

  return omitBy({
    includes,
    excludes
  }, isNil)

}
