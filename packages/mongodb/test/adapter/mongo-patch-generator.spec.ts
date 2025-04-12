import { ApiDocument, ComplexType } from '@opra/common';
import { MongoPatchGenerator } from '@opra/mongodb';
import { expect } from 'expect';
import { CustomerApplication } from 'express-mongo';

describe('MongoPatchGenerator', () => {
  let document: ApiDocument;
  let customerType: ComplexType;

  before(async () => {
    document = (await CustomerApplication.create()).document;
    customerType = document.node.getComplexType('Customer');
  });

  describe('Patch input', () => {
    it('Should update simple fields', async () => {
      const generator = new MongoPatchGenerator();
      const { update } = generator.generatePatch(customerType, {
        givenName: 'John',
        active: true,
      });
      expect(update).toEqual({
        $set: {
          givenName: 'John',
          active: true,
        },
      });
    });

    it('Should unset field if value is null', async () => {
      const generator = new MongoPatchGenerator();
      const { update } = generator.generatePatch(customerType, {
        active: null,
        address: {
          city: null,
        },
      });
      expect(update).toEqual({
        $unset: {
          active: 1,
          'address.city': 1,
        },
      });
    });

    it('Should update fields for nested objects', async () => {
      const generator = new MongoPatchGenerator();
      const { update } = generator.generatePatch(customerType, {
        address: {
          city: 'City',
        },
      });
      expect(update).toEqual({
        $set: {
          'address.city': 'City',
        },
      });
    });

    it('Should update array fields', async () => {
      const generator = new MongoPatchGenerator();
      const { update } = generator.generatePatch(customerType, {
        tags: ['a', 'b'],
      });
      expect(update).toEqual({
        $set: {
          tags: ['a', 'b'],
        },
      });
    });

    it('Should update nested entity values in array fields', async () => {
      const generator = new MongoPatchGenerator();
      const { update, arrayFilters } = generator.generatePatch(customerType, {
        notes: [{ _id: 1, text: 'text' }],
      });
      expect(update).toEqual({
        $set: {
          'notes.$[f1].text': 'text',
        },
      });
      expect(arrayFilters).toEqual([{ 'f1._id': 1 }]);
    });

    it('Should replaces non nested values in array fields', async () => {
      const generator = new MongoPatchGenerator();
      const { update } = generator.generatePatch(customerType, {
        phoneNumbers: [{ areaCode: '90', phoneNumber: '1234567' }],
      });
      expect(update).toEqual({
        $set: {
          phoneNumbers: [{ areaCode: '90', phoneNumber: '1234567' }],
        },
      });
    });
  });

  /* ******************************************************************  */

  describe('_$push operator', () => {
    it('Should add single value to array field', async () => {
      const generator = new MongoPatchGenerator();
      const { update } = generator.generatePatch(customerType, {
        _$push: {
          tags: 'a',
        },
      });
      expect(update).toEqual({
        $push: {
          tags: 'a',
        },
      });
    });

    it('Should add multiple values to array field', async () => {
      const generator = new MongoPatchGenerator();
      const { update } = generator.generatePatch(customerType, {
        _$push: {
          tags: ['a', 'b'],
        },
      });
      expect(update).toEqual({
        $push: {
          tags: { $each: ['a', 'b'] },
        },
      });
    });

    it('Should add a complextype to array field', async () => {
      const generator = new MongoPatchGenerator();
      const { update } = generator.generatePatch(customerType, {
        _$push: {
          notes: { _id: 1, text: 'text' },
        },
      });
      expect(update).toEqual({
        $push: {
          notes: { _id: 1, text: 'text' },
        },
      });
    });

    it('Should add multiple complextypes to array field', async () => {
      const generator = new MongoPatchGenerator();
      const { update } = generator.generatePatch(customerType, {
        _$push: {
          notes: [
            { _id: 1, text: 'text1' },
            { _id: 2, text: 'text2' },
          ],
        },
      });
      expect(update).toEqual({
        $push: {
          notes: {
            $each: [
              { _id: 1, text: 'text1' },
              { _id: 2, text: 'text2' },
            ],
          },
        },
      });
    });

    it('Should check if key value defined', async () => {
      const generator = new MongoPatchGenerator();
      expect(() =>
        generator.generatePatch(customerType, {
          _$push: {
            notes: { text: 'text' },
          },
        }),
      ).toThrow('must provide');
      expect(() =>
        generator.generatePatch(customerType, {
          _$push: {
            notes: [{ text: 'text' }],
          },
        }),
      ).toThrow('must provide');
    });
  });

  /* ******************************************************************  */

  describe('$pull operator', () => {
    it('Should remove single value from array field', async () => {
      const generator = new MongoPatchGenerator();
      const { update } = generator.generatePatch(customerType, {
        _$pull: {
          tags: 'a',
        },
      });
      expect(update).toEqual({
        $pull: {
          tags: 'a',
        },
      });
    });

    it('Should multiple values from array field', async () => {
      const generator = new MongoPatchGenerator();
      const { update } = generator.generatePatch(customerType, {
        _$pull: {
          tags: ['a', 'b'],
        },
      });
      expect(update).toEqual({
        $pull: {
          tags: { $in: ['a', 'b'] },
        },
      });
    });

    it('Should remove single value from complextype array field', async () => {
      const generator = new MongoPatchGenerator();
      const { update } = generator.generatePatch(customerType, {
        _$pull: {
          notes: 1,
        },
      });
      expect(update).toEqual({
        $pull: {
          notes: { $elemMatch: { _id: 1 } },
        },
      });
    });
  });
});
