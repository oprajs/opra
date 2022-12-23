
export abstract class Format {

  abstract parse(value: string): any;

  abstract stringify(value: any): string;

}
