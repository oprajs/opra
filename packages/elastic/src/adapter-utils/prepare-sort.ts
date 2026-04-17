const SIGN_PATTERN = /^([+-])?(.+)$/;

/**
 * Prepares an Elasticsearch sort array from the provided sort strings.
 *
 * @param sort - An array of sort strings (e.g., '+field' or '-field').
 * @returns An array of Elasticsearch sort objects, or undefined if no sort is provided.
 */
export default function prepareSort(sort?: string[]): any[] | undefined {
  if (!(sort && sort.length)) return;
  const out: any[] = [];
  sort.forEach(k => {
    const m = SIGN_PATTERN.exec(k);
    if (m) {
      out.push({ [m[2]]: { order: m[1] === '-' ? 'desc' : 'asc' } });
    }
  });
  return out;
}
