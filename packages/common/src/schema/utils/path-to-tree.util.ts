const dotPattern = /^([^.]+)\.(.*)$/;

export interface ObjectTree {
  [key: string]: boolean | ObjectTree
}

export function pathToTree(arr: string[]): ObjectTree | undefined {
  if (!arr.length)
    return;
  return _stringPathToObjectTree(arr, {});
}

function _stringPathToObjectTree(arr: string[], target: ObjectTree): ObjectTree {
  for (const k of arr) {
    const m = dotPattern.exec(k);
    if (m) {
      const key = m[1];
      if (target[key] === true)
        continue;
      const sub = target[key] = typeof target[key] === 'object' ? target[key] : {};
      _stringPathToObjectTree([m[2]], sub as ObjectTree);
    } else {
      target[k] = true;
    }
  }
  return target;
}
