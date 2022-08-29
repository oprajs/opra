import _ from 'lodash';
import ruleJudgment from 'rule-judgment'
import { Type } from 'ts-gems';
import { OpraSchema } from '@opra/common';
import { OpraDocument } from '../implementation/opra-document.js';
import { DataService } from './data-service.js';

// Fix invalid importing (with ESM) of rule-judgment package
const toArrayFilter = typeof (ruleJudgment as any) === 'function' ? (ruleJudgment as any) : (ruleJudgment as any).default;

export interface JsonDataServiceAgs {
  data: any[];
  primaryKey: string | string[];
}

export class JsonDataService extends DataService {
  public data: any[];
  constructor(args: JsonDataServiceAgs) {
    super();
  }

  /*


    findAll(req: any): Partial<T>[] {
      const skip = req.skip || 0;
      const limit = skip + (req.limit || 10)
      const filter = this._createFilter(req);
      return this.data
          .filter(toArrayFilter(filter))
          .slice(skip, limit)
          .map(x => this._pickElements(req, x));
    }

    get(query: Pick<OpraRequest, 'key' | 'elements'>): Partial<T>
    get(arg0: any): Partial<T> {
      if (!this._model.primaryKeys)
        throw new Error(`No primary key defined for model (${this._model.name})`);
  //     const q = isOpraQueryNode(arg0) ? JsonResourceService.wrapQuery(arg0) : {};
     //  this._model.primaryKeys

      return this.findAll({})[0];
    }

    protected _pickElements(req: any, data: any): any {
      / *
      const elements = this._propertyNames.filter(el =>
          ((!req.elements || req.elements.includes(el)) ||
              (req.include && req.include.includes(el))) &&
          (!req.exclude || !req.exclude.includes(el))
      );
      return _.pick(data, elements);* /
    }

    protected _createFilter(req: any): any {
      const out: any = {};
      if (req.keyValue) {
        // if (!this._primaryKeys)
        //  throw new Error(`No primary key(s) defined for model (${this._model.name})`);
        const keyValues = Array.isArray(req.keyValue) ? req.keyValue : [req.keyValue];
        const $eq = {};
        out.$eq = $eq;
        // let i = 0;
        /*
        for (const k of this._primaryKeys) {
          const p = this._model.properties[k];
          let v = keyValues[i++];
          if (p?.type === Number)
            v = parseFloat(v);
          else if (p?.type === Boolean)
            v = Boolean(v);
          $eq[k] = v;
        }* /
      }
      return out;
    }

    static wrapQuery(req: any): {
      keyValue?: any,
    } {
      const out = {};
  /*
      if (req.keyValue) {
        if (!this._primaryKeys)
          throw new Error(`No primary key(s) defined for model (${this._model.name})`);
        const keyValues = Array.isArray(req.keyValue) ? req.keyValue : [req.keyValue];
        const $eq = {};
        out.$eq = $eq;
        let i = 0;
        for (const k of this._primaryKeys) {
          const p = this._model.properties[k];
          let v = keyValues[i++];
          if (p?.type === Number)
            v = parseFloat(v);
          else if (p?.type === Boolean)
            v = Boolean(v);
          $eq[k] = v;
        }
      }
  * /
      return out;
    }
  */
}
