import { Script } from '@elastic/elasticsearch/lib/api/types.js';

export default function preparePatch(doc: any): Script {
  const script: string[] = [];
  const params: Record<string, any> = {};
  _preparePatch(doc, script, params, '');
  return {
    source: script.join('\n'),
    params,
    lang: 'painless',
  };
}

function _preparePatch(
  src: any,
  script: string[],
  params: Record<string, any>,
  path: string,
) {
  let f: string;
  let field: string;
  for (const [k, v] of Object.entries(src)) {
    f = k.startsWith('*') ? k.substring(1) : k;
    field = path ? path + '.' + f : f;

    if (v == null) {
      script.push(`ctx._source.remove('${field}');`);
      continue;
    }
    if (
      v &&
      typeof v === 'object' &&
      !Array.isArray(v) &&
      /** If field name starts with "*", do "replace" operation except "merge" */
      !k.startsWith('*')
    ) {
      _preparePatch(v, script, params, field);
      continue;
    }

    script.push(`ctx._source['${field}'] = params['${field}'];`);
    params[field] = v;
  }
}
