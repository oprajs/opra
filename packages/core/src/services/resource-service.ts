import { Type } from 'ts-gems';
import { ComplexType } from '../implementation/data-type/complex-type';

export class ResourceService<T> {

  protected _type: ComplexType;

  constructor(dataType: ComplexType) {
    this._type = dataType;
  }
/*
  get(query: Pick<OpraRequest, 'key' | 'elements'>, userContext: any): Partial<T>{
    if (!this._type.primaryKeys)
      throw new Error(`No primary key defined for model (${this._type.name})`);
    return {};
  }*/

}
