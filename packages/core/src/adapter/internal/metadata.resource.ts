import { ApiDocument, cloneObject, Singleton } from '@opra/common';

@Singleton(Object, {
  name: '$metadata',
})
export class MetadataResource {
  private _schema: any;

  constructor(readonly document: ApiDocument) {
    this._schema = document.exportSchema();
  }

  @Singleton.GetOperation()
  get() {
    return cloneObject(this.document.exportSchema(), true);
  }
}
