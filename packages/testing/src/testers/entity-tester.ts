import {
  CreateInstanceQueryOptions,
  DeleteCollectionQueryOption,
  DeleteInstanceQueryOptions,
  GetInstanceQueryOptions,
  UpdateCollectionQueryOptions,
  UpdateInstanceQueryOptions
} from '@opra/schema';
import { ResourceKey } from '@opra/url';
import { BaseTester, OpraTesterParams } from './base-tester.js';
import { OpraEntityCreateTester } from './entity-create-tester.js';
import { OpraEntityDeleteManyTester } from './entity-delete-many-tester.js';
import { OpraEntityDeleteTester } from './entity-delete-tester.js';
import { OpraEntityGetTester } from './entity-get-tester.js';
import { OpraEntitySearchTester } from './entity-search-tester.js';
import { OpraEntityUpdateManyTester } from './entity-update-many-tester.js';
import { OpraEntityUpdateTester } from './entity-update-tester.js';

export type OpraEntityTesterParams = OpraTesterParams & {
  path: string;
}

export class OpraEntityTester extends BaseTester {
  protected declare readonly _params: OpraEntityTesterParams;

  constructor(params: OpraEntityTesterParams) {
    super(params);
  }


  create(data: {}, options: CreateInstanceQueryOptions = {}): OpraEntityCreateTester {
    return new OpraEntityCreateTester({
      ...this._params,
      headers: {...this._params.headers},
      data,
      options
    });
  }

  get(keyValue: ResourceKey, options: GetInstanceQueryOptions = {}): OpraEntityGetTester {
    return new OpraEntityGetTester({
      ...this._params,
      headers: {...this._params.headers},
      keyValue,
      options
    });
  }

  search(options: GetInstanceQueryOptions = {}): OpraEntitySearchTester {
    return new OpraEntitySearchTester({
      ...this._params,
      headers: {...this._params.headers},
      options
    });
  }

  update(keyValue: ResourceKey, data: {}, options: UpdateInstanceQueryOptions = {}): OpraEntityUpdateTester {
    return new OpraEntityUpdateTester({
      ...this._params,
      keyValue,
      headers: {...this._params.headers},
      data,
      options
    });
  }

  updateMany(data: {}, options: UpdateCollectionQueryOptions = {}): OpraEntityUpdateManyTester {
    return new OpraEntityUpdateManyTester({
      ...this._params,
      headers: {...this._params.headers},
      data,
      options
    });
  }

  delete(keyValue: ResourceKey, options: DeleteInstanceQueryOptions = {}): OpraEntityDeleteTester {
    return new OpraEntityDeleteTester({
      ...this._params,
      keyValue,
      headers: {...this._params.headers},
      options
    });
  }

  deleteMany(options: DeleteCollectionQueryOption = {}): OpraEntityDeleteManyTester {
    return new OpraEntityDeleteManyTester({
      ...this._params,
      headers: {...this._params.headers},
      options
    });
  }

}
