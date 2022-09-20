import _ from 'lodash';

export class ApiExpectBody {
  
  protected _toMatchObject<T extends {}>(actuals: any[], expected: T): this {
    const v = _.omitBy(expected, _.isNil);
    for (const actual of actuals)
      expect(actual).toMatchObject(v);
    return this;
  }

  protected _haveKeysOnly(actuals: any[], keys: string[]): this {
    for (const actual of actuals)
      expect(actual).toEqual(expect.objectHaveKeysOnly(keys));
    return this;
  }

  protected _haveKeys(actuals: any[], keys: string[]): this {
    const matcher = keys.reduce((a, k) => {
      a[k] = expect.anything();
      return a;
    }, {});
    for (const actual of actuals)
      expect(actual).toEqual(expect.objectContaining(matcher));
    return this;
  }

  protected _notHaveKeys(actuals: any[], keys: string[]): this {
    const matcher = keys.reduce((a, k) => {
      a[k] = expect.anything();
      return a;
    }, {});
    for (const actual of actuals)
      expect(actual).not.toEqual(expect.objectContaining(matcher));
    return this;
  }

}
