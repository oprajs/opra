import { ComplexType } from '@opra/common';
import { Record } from './record.js';

@ComplexType({
  additionalFields: true,
  scopePattern: 'db',
})
export class Config extends Record {}
