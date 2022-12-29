import 'reflect-metadata';
import '@opra/sqb';
import { Column, Entity } from '@sqb/connect';
import { extractDataTypeSchema, MixinType, OprComplexType, OprField } from '../../../src/index.js';

describe('MixinType() helper', function () {

  @OprComplexType({description: 'Record schema'})
  class Record {
    @OprField()
    @Column()
    id: string;

    @Column()
    @OprField()
    createdAt: string;
  }

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

  @OprComplexType({description: 'Cancellable schema'})
  class Cancellable {
    @OprField()
    @Column()
    cancelled: boolean;
  }

  @OprComplexType({description: 'PersonRecord schema'})
  class PersonRecord extends MixinType(Record, Person) {
    @OprField()
    @Column()
    notes: string;
  }

  it('Should create union type', async function () {
    const schema = await extractDataTypeSchema(PersonRecord);
    expect(schema).toStrictEqual({
      kind: 'ComplexType',
      name: 'PersonRecord',
      description: 'PersonRecord schema',
      ctor: PersonRecord,
      extends: [
        {type: Record},
        {type: Person}
      ],
      fields: {
        notes: {
          type: 'string'
        }
      }
    });
    const sqbMeta = Entity.getMetadata(PersonRecord);
    expect(sqbMeta).toBeDefined();
    expect(Object.keys((sqbMeta as any).fields)).toStrictEqual(
        ['id', 'createdat', 'givenname', 'familyname', 'gender', 'notes']);
  })

  it('Should create union type that contains other union type', async function () {

    @OprComplexType({description: 'TestClass schema'})
    class TestClass extends MixinType(PersonRecord, Cancellable) {
      @OprField()
      @Column()
      cancelledAt: string;
    }

    const schema = await extractDataTypeSchema(TestClass);
    expect(schema).toStrictEqual({
      kind: 'ComplexType',
      name: 'TestClass',
      description: 'TestClass schema',
      ctor: TestClass,
      extends: [
        {type: PersonRecord},
        {type: Cancellable},
      ],
      fields: {
        cancelledAt: {
          type: 'string'
        }
      }
    });
    const sqbMeta = Entity.getMetadata(TestClass);
    expect(sqbMeta).toBeDefined();
    expect(Object.keys((sqbMeta as any).fields)).toStrictEqual(
        ['id', 'createdat', 'givenname', 'familyname', 'gender', 'notes', 'cancelled', 'cancelledat']);
  })

  it('Should create mixing type that contains nested mixin type', async function () {
    @OprComplexType({description: 'TestClass schema'})
    class TestClass extends MixinType(MixinType(Record, Person), Cancellable) {
      @OprField()
      @Column()
      cancelledAt: string;
    }

    const schema = await extractDataTypeSchema(TestClass);
    expect(schema).toStrictEqual({
      kind: 'ComplexType',
      name: 'TestClass',
      description: 'TestClass schema',
      ctor: TestClass,
      extends: [
        {type: Record},
        {type: Person},
        {type: Cancellable},
      ],
      fields: {
        cancelledAt: {
          type: 'string'
        }
      }
    });

    const sqbMeta = Entity.getMetadata(TestClass);
    expect(sqbMeta).toBeDefined();
    expect(Object.keys((sqbMeta as any).fields)).toStrictEqual(
        ['id', 'createdat', 'givenname', 'familyname', 'gender', 'cancelled', 'cancelledat']);

  })


})
