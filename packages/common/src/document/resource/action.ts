import { OpraSchema } from '../../schema/index.js';

export namespace Action {
  export interface InitArguments extends OpraSchema.Action {
    name: string;
  }
}

export class Action {
  readonly name: string;

  constructor(init: Action.InitArguments) {
    this.name = init.name;
  }

  exportSchema(): OpraSchema.Action {
    return {};
  }
}
