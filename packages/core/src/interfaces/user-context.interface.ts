export interface IUserContext {

  onRequestFinish?(failed: boolean): void | Promise<void>;

}
