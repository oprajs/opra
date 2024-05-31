import 'reflect-metadata';
import { pathToObjectTree } from '@opra/common';

describe('pathToTree()', function () {
  afterAll(() => global.gc && global.gc());

  it('Should wrap array of string paths to object tree', async () => {
    const out = pathToObjectTree(['a', 'b', 'c.a.x', 'c.b']);
    expect(out).toStrictEqual({ a: true, b: true, c: { a: { x: true }, b: true } });
  });

  it('Should ignore sub paths if whole path required', async () => {
    const out = pathToObjectTree(['a.x', 'a', 'a.y', 'b', 'b.x']);
    expect(out).toStrictEqual({ a: true, b: true });
  });
});
