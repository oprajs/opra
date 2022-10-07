import { Response } from 'supertest';

export class ApiExpectErrors {

  constructor(readonly response: Response) {
  }

  toContain(...issues: any[]) {
    try {
      expect(this.response).apiErrorToContain(issues)
    } catch (e: any) {
      Error.captureStackTrace(e, this.toContain);
      throw e;
    }
  }

}

declare global {
  namespace jest {
    interface Matchers<R> {
      apiErrorToContain(...issue: any[]);
    }
  }
}

expect.extend({
  apiErrorToContain(response: Response, issues: any[]) {
    try {
      expect(response.body).toBeDefined();
      expect(response.body.errors).toBeDefined();
      expect(Array.isArray(response.body.errors)).toStrictEqual(true)
      expect(response.body.errors).toEqual(
          expect.arrayContaining(issues.map(o => expect.objectContaining(o))
          )
      );
    } catch (e: any) {
      return {
        pass: false,
        message: () => e.message
      };
    }
    return {actual: true, pass: true, message: () => ''};
  },
})
