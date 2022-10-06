const dotPattern = /^([^.]+)\.(.*)$/;

export interface ObjectTree {
  [key: string]: boolean | ObjectTree
}

export function pathToTree(arr: string[], lowerCaseKeys?: boolean): ObjectTree | undefined {
  if (!arr.length)
    return;
  return _pathToTree(arr, {}, lowerCaseKeys);
}

function _pathToTree(arr: string[], target: ObjectTree, lowerCaseKeys?: boolean): ObjectTree {
  for (let k of arr) {
    if (lowerCaseKeys)
      k = k.toLowerCase();
    const m = dotPattern.exec(k);
    if (m) {
      const key = m[1];
      if (target[key] === true)
        continue;
      const sub = target[key] = typeof target[key] === 'object' ? target[key] : {};
      _pathToTree([m[2]], sub as ObjectTree);
    } else {
      target[k] = true;
    }
  }
  return target;
}
