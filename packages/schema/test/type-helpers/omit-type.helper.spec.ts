import 'reflect-metadata';
import { Column, Entity } from '@sqb/connect';
import {
  extractComplexTypeMetadata,
  OprComplexType,
  OprField
} from '../../src/index.js';
import { OmitType } from '../../src/type-helpers/extend-type.helper.js';

describe('OmitType() helper', function () {

  @OprComplexType({description: 'Person schema'})
  class Person {
    @OprField()
    @Column()
    givenName: string;
    @OprField()
    @Column()
    familyName: string;
    @OprField()
    @Column()
    gender: string;
  }

  it('Should create type with picked properties only', async function () {

    @OprComplexType({description: 'TestClass schema'})
    class TestClass extends OmitType(Person, ['gender']) {
      @OprField()
      @Column()
      sex: string;
    }

    const meta = extractComplexTypeMetadata(TestClass);
    expect(meta).toStrictEqual({
      kind: 'ComplexType',
      name: 'TestClass',
      description: 'TestClass schema',
      ctor: TestClass,
      extends: [
        {type: Person, omit: ['gender']}
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
    class Person2 extends OmitType(Person, ['gender']) {
      @OprField()
      sex: string;
    }

    @OprComplexType({description: 'TestClass schema'})
    class TestClass extends OmitType(Person2, ['familyName', 'sex']) {
      @OprField()
      @Column()
      sex: number;
    }

    const meta = extractComplexTypeMetadata(TestClass);
    expect(meta).toStrictEqual({
      kind: 'ComplexType',
      name: 'TestClass',
      description: 'TestClass schema',
      ctor: TestClass,
      extends: [
        {type: Person2, omit: ['familyName', 'sex']}
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
