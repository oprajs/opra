const dotPattern = /^([^.]+)\.(.*)$/;

export function stringPathToObjectTree(arr: string[]): object | undefined {
  if (!arr.length)
    return;
  return _stringPathToObjectTree(arr, {});
}

function _stringPathToObjectTree(arr: string[], target: object): object {
  for (const k of arr) {
    const m = dotPattern.exec(k);
    if (m) {
      if (target[m[1]] === true)
        continue;
      target[m[1]] = target[m[1]] || {};
      _stringPathToObjectTree([m[2]], target[m[1]]);
    } else {
      target[k] = true;
    }
  }
  return target;
}
