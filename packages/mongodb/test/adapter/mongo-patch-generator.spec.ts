import { ApiDocument, ComplexType } from '@opra/common';
import { MongoPatchGenerator } from '@opra/mongodb';
import { CustomerApplication } from 'express-mongo';

describe('MongoPatchGenerator', () => {
  let document: ApiDocument;
  let customerType: ComplexType;

  beforeAll(async () => {
    document = (await CustomerApplication.create()).document;
    customerType = document.node.getComplexType('Customer');
  });

  afterAll(() => global.gc && global.gc());

  describe('Patch input', () => {
    it('Should set simple fields', async () => {
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

    it('Should not set if field is readonly', async () => {
      const generator = new MongoPatchGenerator();
      const { update } = generator.generatePatch(customerType, {
        country: {
          name: 'x',
        },
        active: true,
      });
      expect(update).toEqual({
        $set: {
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

    it('Should not unset if field is readonly', async () => {
      const generator = new MongoPatchGenerator();
      const { update } = generator.generatePatch(customerType, {
        country: null,
        active: null,
      });
      expect(update).toEqual({
        $unset: {
          active: 1,
        },
      });
    });

    it('Should not unset if parent field is readonly', async () => {
      const generator = new MongoPatchGenerator();
      const { update } = generator.generatePatch(customerType, {
        country: {
          name: null,
        },
        active: null,
      });
      expect(update).toEqual({
        $unset: {
          active: 1,
        },
      });
    });

    it('Should set fields for nested objects', async () => {
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

    it('Should not set fields if parent field is readonly', async () => {
      const generator = new MongoPatchGenerator();
      const { update } = generator.generatePatch(customerType, {
        country: {
          name: 'x',
        },
        active: true,
      });
      expect(update).toEqual({
        $set: {
          active: true,
        },
      });
    });

    it('Should set values for array fields', async () => {
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

    it('Should set nested values for array fields', async () => {
      const generator = new MongoPatchGenerator();
      const { update, arrayFilters } = generator.generatePatch(customerType, {
        notes: [{ _id: 1, text: 'text' }],
      });
      expect(update).toEqual({
        $set: {
          'notes.$[f1].text': 'text',
        },
      });
      expect(arrayFilters).toEqual({
        'f1._id': 1,
      });
    });
  });

  /* ******************************************************************  */

  describe('$remove operator', () => {
    it('Should remove single value from array field', async () => {
      const generator = new MongoPatchGenerator();
      const { update } = generator.generatePatch(customerType, {
        $remove: {
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
        $remove: {
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
        $remove: {
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
