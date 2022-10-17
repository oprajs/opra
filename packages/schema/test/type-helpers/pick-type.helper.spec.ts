import 'reflect-metadata';
import { Column, Entity } from '@sqb/connect';
import {
  extractComplexTypeMetadata, OprComplexType,
  OprField
} from '../../src/index.js';
import { PickType } from '../../src/type-helpers/extend-type.helper.js';
import { Customer } from '../_support/app-sqb/index.js';

describe('PickType() helper', function () {

  it('Should create type with picked properties only', async function () {

    @OprComplexType({description: 'TestClass schema'})
    class TestClass extends PickType(Customer, ['givenName', 'familyName']) {
      @OprField()
      @Column()
      sex: string;
    }

    const meta = await extractComplexTypeMetadata(TestClass);
    expect(meta).toStrictEqual({
      kind: 'ComplexType',
      name: 'TestClass',
      description: 'TestClass schema',
      ctor: TestClass,
      extends: [
        {type: Customer, pick: ['givenName', 'familyName']}
      ],
      fields: {
        sex: {
          type: 'string'
        }
      }
    });
    const sqbMeta = Entity.getMetadata(TestClass);
    expect(sqbMeta).toBeDefined();
    expect(Object.keys((sqbMeta as any).fields)).toStrictEqual(
        ['givenname', 'familyname', 'sex']);
  })

  it('Should create from already picked type', async function () {

    @OprComplexType({description: 'TestClass schema'})
    class Customer2 extends PickType(Customer, ['givenName', 'familyName']) {
      @OprField()
      sex: string;
    }

    @OprComplexType({description: 'TestClass schema'})
    class TestClass extends PickType(Customer2, ['givenName']) {
      @OprField()
      @Column()
      sex: number;
    }

    const meta = await extractComplexTypeMetadata(TestClass);
    expect(meta).toStrictEqual({
      kind: 'ComplexType',
      name: 'TestClass',
      description: 'TestClass schema',
      ctor: TestClass,
      extends: [
        {type: Customer2, pick: ['givenName']}
      ],
      fields: {
        sex: {
          type: 'number'
        }
      }
    });

    const sqbMeta = Entity.getMetadata(TestClass);
    expect(sqbMeta).toBeDefined();
    expect(Object.keys((sqbMeta as any).fields)).toStrictEqual(
        ['givenname', 'sex']);
  })


})
