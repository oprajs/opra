const SIGN_PATTERN = /^([+-])?(.+)$/;

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
