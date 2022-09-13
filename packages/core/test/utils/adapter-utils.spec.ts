import 'reflect-metadata';
import { stringPathToObjectTree } from '../../src/utils/string-path-to-object-tree.js';

describe('Utils', function () {

  describe('stringPathToObjectTree()', function () {

    it('Should wrap array of string paths to object tree', async () => {
      const out = stringPathToObjectTree(['a', 'b', 'c.a.x', 'c.b']);
      expect(out).toStrictEqual({a: true, b: true, c: {a: {x: true}, b: true}});
    })

    it('Should ignore sub paths if whole path required', async () => {
      const out = stringPathToObjectTree(['a.x', 'a', 'a.y', 'b', 'b.x']);
      expect(out).toStrictEqual({a: true, b: true});
    })

  })

});
