const CONTEXT_KEY = Symbol.for('opra.schema.context');

export class OpraSchema {
  private [CONTEXT_KEY]: {
    serviceRoot?: string;
  } = {};

  get serviceRoot(): string | undefined {
    return this[CONTEXT_KEY].serviceRoot;
  }

  set serviceRoot(value: string | undefined) {
    this[CONTEXT_KEY].serviceRoot = value;
  }

}
