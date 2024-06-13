export default function transformSort(sort?: string[]): any[] | undefined {
  if (!(sort && sort.length)) return;
  const out: any[] = [];
  sort.forEach(k => {
    if (k.startsWith('-')) out.push({ [k.substring(1)]: 'desc' });
    else if (k.startsWith('+')) out.push(k.substring(1));
    else out.push(k);
  });
  return out;
}
