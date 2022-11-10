import { from } from 'rxjs';
import { ObservablePromiseLike } from './types.js';

export function observablePromise<T>(promise: Promise<T>): ObservablePromiseLike<T> {
  const observable = from(promise) as unknown as ObservablePromiseLike<T>;
  observable.then = (...args) => promise.then(...args);
  return observable as unknown as ObservablePromiseLike<T>;
}
