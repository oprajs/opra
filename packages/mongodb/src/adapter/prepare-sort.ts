import mongodb from 'mongodb';

/**
 * Prepares the MongoDB sort object from an array of sort strings.
 *
 * @param sort - An array of strings representing the sort order (e.g., ['+name', '-age']).
 * @returns The prepared MongoDB sort object, or `undefined` if no sort is provided.
 */
export default function prepareSort(sort?: string[]): mongodb.Sort | undefined {
  if (!(sort && sort.length)) return;
  const out: any = {};
  sort.forEach(k => {
    if (k.startsWith('-')) out[k.substring(1)] = -1;
    else if (k.startsWith('+')) out[k.substring(1)] = 1;
    else out[k] = 1;
  });
  return out;
}
