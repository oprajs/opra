import {Literal} from '../abstract/literal.js';

export class QualifiedIdentifier extends Literal {
  constructor(value: string) {
    super('' + value);
  }
}
