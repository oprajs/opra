import 'reflect-metadata';
import { Column, Entity } from '@sqb/connect';
import { extractDataTypeSchema, OmitType, OprComplexType, OprField } from '../../../src/index.js';
import { Customer } from '../_support/app-sqb/index.js';

describe('OmitType() helper', function () {

  it('Should create type with omitted properties only', async function () {

    @OprComplexType({description: 'TestClass schema'})
    class TestClass extends OmitType(Customer, ['gender']) {
      @OprField()
      @Column()
      sex: string;
    }

    const schema = await extractDataTypeSchema(TestClass);
    expect(schema).toStrictEqual({
      kind: 'ComplexType',
      name: 'TestClass',
      description: 'TestClass schema',
      ctor: TestClass,
      extends: [
        {type: Customer, omit: ['gender']}
      ],
      fields: {
        sex: {
          type: 'string'
        }
      }
    });
    const sqbMeta = Entity.getMetadata(TestClass);
    expect(sqbMeta).toBeDefined();
    const keys = Object.keys((sqbMeta as any).fields);
    expect(keys).toContain('sex');
    expect(keys).not.toContain('gender');
  })

  it('Should create from already omitted type', async function () {

    @OprComplexType({description: 'TestClass schema'})
    class Person2 extends OmitType(Customer, ['gender']) {
      @OprField()
      sex: string;
    }

    @OprComplexType({description: 'TestClass schema'})
    class TestClass extends OmitType(Person2, ['familyName', 'sex']) {
      @OprField()
      @Column()
      sex: number;
    }

    const schema = await extractDataTypeSchema(TestClass);
    expect(schema).toStrictEqual({
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
    const keys = Object.keys((sqbMeta as any).fields);
    expect(keys).toContain('sex');
    expect(keys).not.toContain('gender');
    expect(keys).not.toContain('familyName');
  })


})
