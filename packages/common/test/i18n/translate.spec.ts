import { translate } from '@opra/common';
import { expect } from 'expect';

describe('common:translate()', () => {
  it('translate(key)', () => {
    expect(translate('HELLO')).toStrictEqual('$t(HELLO)');
  });

  it('translate(key, options)', () => {
    expect(translate('HELLO', { a: '1' })).toStrictEqual('$t(HELLO,{"a":"1"})');
  });

  it('translate(key, options, fallback)', () => {
    expect(translate('HELLO', { a: '1' }, 'hello (there)')).toStrictEqual(
      '$t(HELLO,{"a":"1"}?hello (there\\))',
    );
  });

  it('translate(key, fallback)', () => {
    expect(translate('HELLO', 'hello (there)')).toStrictEqual(
      '$t(HELLO?hello (there\\))',
    );
  });
});
