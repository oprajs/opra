import mongodb from 'mongodb';

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
