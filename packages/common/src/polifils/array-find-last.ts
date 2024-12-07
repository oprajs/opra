export {};

declare global {
  interface Array<T> {
    findLast<S extends T>(
      predicate: (value: T, index: number, obj: T[]) => value is S,
      thisArg?: any,
    ): S | undefined;

    findLast(
      predicate: (value: T, index: number, obj: T[]) => unknown,
      thisArg?: any,
    ): T | undefined;

    findLastIndex(
      predicate: (value: T, index: number, obj: T[]) => unknown,
      thisArg?: any,
    ): number;
  }
}

if (!Array.prototype.findLast) {
  Array.prototype.findLast = function (
    this: any[],
    predicate: any,
    thisArg: any,
  ) {
    const i = this.findLastIndex(predicate, thisArg);
    return i >= 0 ? this[i] : undefined;
  };

  Array.prototype.findLastIndex = function (
    this: any[],
    predicate: any,
    thisArg: any,
  ) {
    if (this == null) {
      throw new TypeError('this is null or not defined');
    }
    const arr = Object(this);
    const len = this.length;
    thisArg = thisArg || this;
    for (let i = len - 1; i >= 0; i--) {
      if (predicate.call(thisArg, arr[i], i, arr)) {
        return i;
      }
    }
    return -1;
  };
}
