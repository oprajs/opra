
export abstract class HttpParamCodec {

  abstract decode(value: string): any;

  abstract encode(value: any): string;

}
