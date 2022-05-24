export abstract class Ast {
  readonly type: string;

  protected constructor() {
    this.type = Object.getPrototypeOf(this).constructor.name;
  }

  abstract toString(): string;

}
