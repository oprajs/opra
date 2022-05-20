import {Literal} from '../abstract/literal';

export class QualifiedIdentifier extends Literal {
  constructor(value: string) {
    super('' + value);
  }
}
