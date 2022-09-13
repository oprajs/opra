import { Injectable } from '@nestjs/common';
import photosData from './photos.data.js';

@Injectable()
export class PhotosService {

  create(v: any) {
    photosData.push(v);
    return v;
  }

  search(filter?: any) {
    return this._find(filter);
  }

  read(id: any) {
    return photosData.find(x => '' + x.id === '' + id);
  }

  update(id: any, values: any) {
    const data = photosData.find(x => '' + x.id === '' + id);
    if (data) {
      delete values.id;
      Object.assign(data, values);
    }
    return data;
  }

  updateMany(values: any, filter?: any) {
    const found = this._find(filter);
    found.forEach(x => {
      Object.assign(x, values);
    })
    return found.length;
  }

  delete(id: any) {
    const i = photosData.findIndex(x => '' + x.id === '' + id);
    if (i >= 0) {
      photosData[i] = undefined;
      return true;
    }
  }

  deleteMany(filter: any) {
    const found = this._find(filter);
    found.forEach(x => {
      const i = photosData.indexOf(x);
      if (i >= 0) photosData[i] = undefined;
    })
    return found.length;
  }

  protected _find(filter?: any): any[] {
    return photosData.filter(x => {
      if (!(x && filter))
        return;
      switch (filter.op) {
        case '=': {
          return x.id === filter.right.value
        }
        case '<': {
          return x.id < filter.right.value
        }
        case '<=': {
          return x.id <= filter.right.value
        }
        case '>': {
          return x.id > filter.right.value
        }
        case '>=': {
          return x.id >= filter.right.value
        }
      }
    });
  }

}