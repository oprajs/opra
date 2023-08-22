import { Injectable } from '@nestjs/common';
import { Collection, DECORATOR, Singleton, Storage } from '@opra/common';

/*
  Overrides Collection decorator function to call NestJS's Injectable() when Collection decorator called
 */
const oldCollectionDecorator = Collection[DECORATOR];
Collection[DECORATOR] = function CollectionDecorator(...args) {
  const collectionDecorator = oldCollectionDecorator(...args);
  const injectableDecorator = Injectable();
  return (target: Function) => {
    collectionDecorator(target);
    injectableDecorator(target);
  }
}

/*
  Overrides Singleton decorator function to call NestJS's Injectable() when Singleton decorator called
 */
const oldSingletonDecorator = Singleton[DECORATOR];
Singleton[DECORATOR] = function SingletonDecorator(...args) {
  const singletonDecorator = oldSingletonDecorator(...args);
  const injectableDecorator = Injectable();
  return (target: Function) => {
    singletonDecorator(target);
    injectableDecorator(target);
  }
}


/*
  Overrides Singleton decorator function to call NestJS's Injectable() when Singleton decorator called
 */
const oldStorageDecorator = Storage[DECORATOR];
Storage[DECORATOR] = function StorageDecorator(...args) {
  const storageDecorator = oldStorageDecorator(...args);
  const injectableDecorator = Injectable();
  return (target: Function) => {
    storageDecorator(target);
    injectableDecorator(target);
  }
}
