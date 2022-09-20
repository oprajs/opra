import { ApiExpectBody } from './api-expect-body.js';

export class ApiExpectFail extends ApiExpectBody {

  constructor(protected _errors: any) {
    super();
  }

  toContain(...issue: any[]) {
    expect(this._errors).toEqual(
        expect.arrayContaining(issue.map(o => expect.objectContaining(o))
        )
    );
  }

}
