export abstract class Ast {

  get type(): string {
    return Object.getPrototypeOf(this).constructor.name;
  }

  abstract toString(): string;

}
