import _prepareFilter from './adapter-utils/prepare-filter.js';
import _prepareKeyValues from './adapter-utils/prepare-key-values.js'
import _preparePatch from './adapter-utils/prepare-patch.js';
import _prepareProjection from './adapter-utils/prepare-projection.js';
import _prepareSort from './adapter-utils/prepare-sort.js';

export namespace MongoAdapter {
  export const prepareKeyValues = _prepareKeyValues;
  export const prepareFilter = _prepareFilter;
  export const preparePatch = _preparePatch;
  export const prepareProjection = _prepareProjection;
  export const prepareSort = _prepareSort;
}
