import { faker } from '@faker-js/faker';
import { Product } from '@opra/common/test/_support/test-api/index';

export const productsData: Product[] = [];

for (let _id = 1; _id <= 1000; _id++) {
  const product: Product = {
    _id,
    code: '' + faker.datatype.number({min: 1000, max: 9999}),
    name: faker.commerce.productName(),
    createdAt: new Date()
  };
  productsData.push(product);
}
