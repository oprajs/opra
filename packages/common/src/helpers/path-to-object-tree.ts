const DOT_PATTERN = /^([^.]+)\.(.*)$/;

export interface ObjectTree {
  [key: string]: boolean | ObjectTree
}

export function pathToObjectTree(arr: string[], lowerCaseKeys?: boolean): ObjectTree | undefined {
  if (!(arr && arr.length))
    return;
  return _pathToObjectTree(arr, {}, lowerCaseKeys);
}

function _pathToObjectTree(arr: string[], target: ObjectTree, lowerCaseKeys?: boolean): ObjectTree {
  for (let k of arr) {
    if (lowerCaseKeys)
      k = k.toLowerCase();
    const m = DOT_PATTERN.exec(k);
    if (m) {
      const key = m[1];
      if (target[key] === true)
        continue;
      const sub = target[key] = typeof target[key] === 'object' ? target[key] : {};
      _pathToObjectTree([m[2]], sub as ObjectTree);
    } else {
      target[k] = true;
    }
  }
  return target;
}
