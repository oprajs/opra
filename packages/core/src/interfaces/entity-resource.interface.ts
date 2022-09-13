export interface IEntityResource {

  search?(...args: any[]): any;

  read?(...args: any[]): any;

  create?(...args: any[]): any;

  update?(...args: any[]): any;

  updateMany?(...args: any[]): any;

  delete?(...args: any[]): any;

  deleteMany?(...args: any[]): any;

}
