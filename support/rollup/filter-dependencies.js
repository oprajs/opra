import merge from 'putil-merge';

export function filterDependencies(json, external) {
  json = merge({}, json, { deep: true });
  for (const dep of [
    json.dependencies,
    json.devDependencies,
    json.optionalDependencies,
    json.peerDependencies,
  ]) {
    if (!dep) continue;
    for (const k of Object.keys(dep)) {
      if (!external.includes(k)) delete dep[k];
    }
  }
  json.scripts = undefined;
  return json;
}
