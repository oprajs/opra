import { Type } from 'ts-gems';

export class ResourceService<T> {
  /*
  protected _model: OpraModel;

  constructor(modelCtor: Type<T> | OpraModel) {
    this._model = modelCtor instanceof OpraModel
        ? modelCtor
        : new OpraModel<any>(modelCtor);
  }

  get(query: Pick<OpraRequest, 'key' | 'elements'>, userContext: any): Partial<T>{
    if (!this._model.primaryKeys)
      throw new Error(`No primary key defined for model (${this._model.name})`);
    return {};
  }
*/
}
