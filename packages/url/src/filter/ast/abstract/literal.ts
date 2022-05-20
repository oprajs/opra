import {Term} from './term';

export abstract class Literal extends Term {
  value: any;

  protected constructor(value: any) {
    super();
    this.value = value;
  }

  toString(): string {
    return '' + this.value;
  }
}
