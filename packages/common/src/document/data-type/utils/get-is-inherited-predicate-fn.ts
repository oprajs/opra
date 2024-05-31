export function getIsInheritedPredicateFn(pick?: string[], omit?: string[]) {
  const pickKeys = pick?.map(x => String(x).toLowerCase());
  const omitKeys = omit?.map(x => String(x).toLowerCase());
  return (propertyName: string): boolean => {
    if (omitKeys && omitKeys.includes(propertyName.toLowerCase())) return false;
    if (pickKeys) return pickKeys.includes(propertyName.toLowerCase());
    return true;
  };
}
