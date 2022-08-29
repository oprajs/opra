import {Term} from './term.js';

export abstract class Literal extends Term {
  declare value: any;

  protected constructor(value: any) {
    super();
    this.value = value;
  }

  toString(): string {
    return '' + this.value;
  }
}
