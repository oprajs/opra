import mongodb from 'mongodb';
import { ComplexType, pathToObjectTree } from '@opra/common';

export default function prepareProjection(
    dataType: ComplexType,
    options?: {
      pick?: string[],
      omit?: string[],
      include?: string[],
    }
): mongodb.Document | undefined {
  const out: Record<string, boolean> = {};
  const pick = options?.pick && pathToObjectTree(options.pick);
  const include = options?.include && pathToObjectTree(options.include);
  const omit = options?.omit && pathToObjectTree(options.omit);
  // const exclusionProjection = !pick && !!omit;
  _prepareProjection(dataType, out, {
    pickActivated: !!pick,
    pick,
    include,
    omit
  });
  return Object.keys(out).length ? out : undefined;
}

export function _prepareProjection(
    dataType: ComplexType,
    target: mongodb.Document,
    // exclusionProjection: boolean,
    options: {
      pickActivated: boolean,
      include?: any,
      pick?: any,
      omit?: any,
      // defaultFields?: boolean
    }
) {
  // const defaultFields = options?.defaultFields ?? !options?.pick;
  const optionsOmit = options?.omit;
  const optionsPick = options?.pick;
  const optionsInclude = options?.include;
  const pickActivated = options?.pickActivated;

  for (const [k, f] of dataType.fields.entries()) {
    const fieldOmit = optionsOmit?.[k];
    const fieldInclude = optionsInclude?.[k];
    const fieldPick = optionsPick?.[k];

    if (fieldOmit === true ||
        !(
            (pickActivated && fieldPick) ||
            (!pickActivated && (!f.exclusive || fieldInclude))
        )
    )
      continue;

    if (f.type instanceof ComplexType &&
        (typeof fieldInclude === 'object' ||
            typeof fieldPick === 'object' ||
            typeof fieldOmit === 'object'
        )
    ) {
      target[k] = {};
      _prepareProjection(f.type, target[k],
          {
            pickActivated: fieldPick != null && fieldPick !== true,
            include: typeof fieldInclude === 'object' ? fieldInclude : undefined,
            pick: typeof fieldPick === 'object' ? fieldPick : undefined,
            omit: typeof fieldOmit === 'object' ? fieldOmit : undefined
          }
      );
      continue;
    }
    target[k] = 1;
  }
}
