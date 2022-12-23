export abstract class Ast {
  readonly kind: string;

  protected constructor() {
    this.kind = Object.getPrototypeOf(this).constructor.name;
  }

  abstract toString(): string;

}
