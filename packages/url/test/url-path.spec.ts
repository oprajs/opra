import { OpraURLPath, OpraURLPathComponent } from '../src/index.js';

describe('OpraURLPath', () => {

  describe('OpraURLPath', () => {
    it('Should add path component', () => {
      const path = new OpraURLPath();
      path.add('Person');
      expect(path.size).toEqual(1);
      expect(path.get(0)).toEqual({resource: 'Person'});
    })

    it('Should add path component with key', () => {
      const path = new OpraURLPath();
      path.add('Person', '1');
      expect(path.get(0)).toEqual({resource: 'Person', key: '1'});
      expect(path.toString()).toStrictEqual('Person@1');
      path.clear();
      path.add('Person', {a: '1', b: '2'});
      expect(path.get(0)).toEqual({resource: 'Person', key: {a: '1', b: '2'}});
      expect(path.toString()).toStrictEqual('Person@a=1;b=2');
      path.clear();
      path.add(new OpraURLPathComponent('Person', '1'));
      expect(path.get(0)).toEqual({resource: 'Person', key: '1'});
      expect(path.toString()).toStrictEqual('Person@1');
      path.clear();
    })

    it('Should be iterable', () => {
      const path = new OpraURLPath();
      const a = ['Person', 'address'];
      const b = ['1', '2'];
      path.add(a[0], b[0]);
      path.add(a[1], b[1]);
      let k = 0;
      for (const [p, i] of path) {
        expect(i).toStrictEqual(k++);
        expect(p).toBeDefined();
        expect(p.resource).toStrictEqual(a[i]);
        expect(p.key).toStrictEqual(b[i]);
      }
    })

    it('Should entries() return iterable', () => {
      const path = new OpraURLPath();
      const a = ['Person', 'address'];
      const b = ['1', '2'];
      path.add(a[0], b[0]);
      path.add(a[1], b[1]);
      let k = 0;
      for (const [p, i] of path.entries()) {
        expect(i).toStrictEqual(k++);
        expect(p).toBeDefined();
        expect(p.resource).toStrictEqual(a[i]);
        expect(p.key).toStrictEqual(b[i]);
      }
    })


    it('Should values() return iterable', () => {
      const path = new OpraURLPath();
      const a = ['Person', 'address'];
      const b = ['1', '2'];
      path.add(a[0], b[0]);
      path.add(a[1], b[1]);
      let i = 0;
      for (const p of path.values()) {
        expect(p).toBeDefined();
        expect(p.resource).toStrictEqual(a[i]);
        expect(p.key).toStrictEqual(b[i]);
        i++;
      }
    })

    it('Should forEach() iterate', () => {
      const path = new OpraURLPath();
      const a = ['Person', 'address'];
      const b = ['1', '2'];
      path.add(a[0], b[0]);
      path.add(a[1], b[1]);
      let i = 0;
      path.forEach((name, key) => {
        expect(name).toStrictEqual(a[i]);
        expect(key).toStrictEqual(b[i]);
        i++;
      })
    })

    it('Should getResource() return resource name at given index', () => {
      const path = new OpraURLPath();
      path.add('Person', '1');
      expect(path.getResource(0)).toEqual('Person');
    })

    it('Should getKey() return key at given index', () => {
      const path = new OpraURLPath();
      path.add('Person', '1');
      expect(path.getKey(0)).toEqual('1');
    })


  });

});

