export default function transformPatch(doc: any): any {
  const trg = {};
  _transformPatch(doc, trg);
  return trg;
}

function _transformPatch(src: any, trg: any = {}, path: string = '') {
  let fieldName: string;
  for (const [k, v] of Object.entries(src)) {
    fieldName = k.startsWith('*') ? k.substring(1) : k;
    const key = path ? path + '.' + fieldName : fieldName;
    if (v == null) {
      trg.$unset = trg.$unset || {};
      trg.$unset[key] = '';
      continue;
    }
    if (v && typeof v === 'object') {
      // If field name starts with "*", do "replace" operation except "merge"
      if (!k.startsWith('*')) {
        _transformPatch(v, trg, key);
        continue;
      }
    }
    trg.$set = trg.$set || {};
    trg.$set[key] = v;
  }
  return trg;
}
