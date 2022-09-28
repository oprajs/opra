import 'reflect-metadata';
import { Column, Entity } from '@sqb/connect';
import {
  extractComplexTypeMetadata, OprComplexType,
  OprEntity,
  OprField
} from '../../src/index.js';
import { MixinType } from '../../src/type-helpers/mixin-type.helper.js';

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

  @OprEntity({description: 'PersonRecord schema'})
  class PersonRecord extends MixinType(Record, Person) {
    @OprField()
    @Column()
    notes: string;
  }


  it('Should create union type', async function () {
    const meta = extractComplexTypeMetadata(PersonRecord);
    expect(meta).toStrictEqual({
      kind: 'EntityType',
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

    @OprEntity({description: 'TestClass schema'})
    class TestClass extends MixinType(PersonRecord, Cancellable) {
      @OprField()
      @Column()
      cancelledAt: string;
    }

    const meta = extractComplexTypeMetadata(TestClass);
    expect(meta).toStrictEqual({
      kind: 'EntityType',
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

  it('Should create union type that contains nested union type', async function () {
    @OprEntity({description: 'TestClass schema'})
    class TestClass extends MixinType(MixinType(Record, Person), Cancellable) {
      @OprField()
      @Column()
      cancelledAt: string;
    }

    const meta = extractComplexTypeMetadata(TestClass);
    expect(meta).toStrictEqual({
      kind: 'EntityType',
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
