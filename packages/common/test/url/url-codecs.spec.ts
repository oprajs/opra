import {
  $eq, $field, BooleanCodec, DateCodec, Expression,
  FilterCodec, IntegerCodec, NumberCodec, StringCodec
} from '../../src/index.js';

describe('URL search param formats', () => {

  describe('StringCodec', () => {
    it('Should parse', () => {
      const format = new StringCodec();
      expect(format.decode('1')).toStrictEqual('1');
      expect(format.decode('')).toStrictEqual('');
    })

    it('Should stringify to url string', () => {
      const format = new StringCodec();
      expect(format.encode('1|2')).toStrictEqual('1|2');
      expect(format.encode(null)).toStrictEqual('');
      expect(format.encode(undefined)).toStrictEqual('');
    })

    it('Should validate min length', () => {
      const format = new StringCodec({minLength: 3});
      expect(() => format.decode('ab')).toThrow('must be at least');
    })

    it('Should set max length', () => {
      const format = new StringCodec({maxLength: 3});
      expect(() => format.decode('abcde')).toThrow('can be up to');
    })

    it('Should validate enum values', () => {
      const format = new StringCodec({enum: ['a', 'b']});
      expect(format.decode('a')).toStrictEqual('a');
      expect(() => format.decode('c')).toThrow('enum');
    })
  });

  describe('NumberCodec', () => {
    it('Should parse', () => {
      const format = new NumberCodec();
      expect(format.decode('-1.1')).toStrictEqual(-1.1);
    })

    it('Should stringify to url string', () => {
      const format = new NumberCodec();
      expect(format.encode(-5.5)).toStrictEqual('-5.5');
      expect(format.encode(null)).toStrictEqual('');
      expect(format.encode(undefined)).toStrictEqual('');
    })

    it('Should validate min length', () => {
      const format = new NumberCodec({min: 3});
      expect(() => format.decode('2')).toThrow('or greater');
    })

    it('Should set max length', () => {
      const format = new NumberCodec({max: 3});
      expect(() => format.decode('5')).toThrow('or less');
    })

    it('Should validate values', () => {
      const format = new NumberCodec();
      expect(() => format.decode('notANumber')).toThrow('not a valid number');
    })
  });

  describe('IntegerCodec', () => {
    it('Should parse', () => {
      const format = new IntegerCodec();
      expect(format.decode('-1')).toStrictEqual(-1);
    })

    it('Should stringify to url string', () => {
      const format = new IntegerCodec();
      expect(format.encode(-5)).toStrictEqual('-5');
      expect(format.encode(null)).toStrictEqual('');
      expect(format.encode(undefined)).toStrictEqual('');
    })

    it('Should validate min length', () => {
      const format = new IntegerCodec({min: 3});
      expect(() => format.decode('2')).toThrow('or greater');
    })

    it('Should set max length', () => {
      const format = new IntegerCodec({max: 3});
      expect(() => format.decode('5')).toThrow('or less');
    })

    it('Should validate values', () => {
      const format = new IntegerCodec();
      expect(() => format.decode('notANumber')).toThrow('not a valid number');
      expect(() => format.decode('1.1')).toThrow('not a valid integer');
    })

    it('Should validate enum values', () => {
      const format = new IntegerCodec({enum: [1, 2]});
      expect(format.decode('1')).toStrictEqual(1);
      expect(() => format.decode('5')).toThrow('enum');
    })
  });

  describe('BooleanCodec', () => {
    it('Should parse', () => {
      const format = new BooleanCodec();
      expect(format.decode('true')).toStrictEqual(true);
      expect(format.decode('t')).toStrictEqual(true);
      expect(format.decode('yes')).toStrictEqual(true);
      expect(format.decode('y')).toStrictEqual(true);
      expect(format.decode('1')).toStrictEqual(true);
      expect(format.decode('false')).toStrictEqual(false);
      expect(format.decode('f')).toStrictEqual(false);
      expect(format.decode('no')).toStrictEqual(false);
      expect(format.decode('n')).toStrictEqual(false);
      expect(format.decode('0')).toStrictEqual(false);
    })

    it('Should stringify to url string', () => {
      const format = new BooleanCodec();
      expect(format.encode(true)).toStrictEqual('true');
      expect(format.encode(false)).toStrictEqual('false');
      expect(format.encode(null)).toStrictEqual('');
      expect(format.encode(undefined)).toStrictEqual('');
    })

    it('Should validate values', () => {
      const format = new BooleanCodec();
      expect(() => format.decode('notABoolean')).toThrow('not a valid boolean');
    })
  })

  describe('DateCodec', () => {
    it('Should parse', () => {
      const format = new DateCodec();
      expect(format.decode('')).toStrictEqual('');
      expect(format.decode('2020')).toStrictEqual('2020-01-01T00:00:00');
      expect(format.decode('202003')).toStrictEqual('2020-03-01T00:00:00');
      expect(format.decode('2020-03')).toStrictEqual('2020-03-01T00:00:00');
      expect(format.decode('20200315')).toStrictEqual('2020-03-15T00:00:00');
      expect(format.decode('2020-03-15')).toStrictEqual('2020-03-15T00:00:00');
      expect(format.decode('202003151030')).toStrictEqual('2020-03-15T10:30:00');
      expect(format.decode('2020-03-15T10:30')).toStrictEqual('2020-03-15T10:30:00');
      expect(format.decode('202003151030.123')).toStrictEqual('2020-03-15T10:30:00.123');
      expect(format.decode('2020-03-15T10:30.123')).toStrictEqual('2020-03-15T10:30:00.123');
      expect(format.decode('202003151030.123Z')).toStrictEqual('2020-03-15T10:30:00.123Z');
      expect(format.decode('2020-03-15T10:30.123Z')).toStrictEqual('2020-03-15T10:30:00.123Z');
      expect(format.decode('202003151030.123+02:00')).toStrictEqual('2020-03-15T10:30:00.123+02:00');
      expect(format.decode('2020-03-15T10:30.123+02:00')).toStrictEqual('2020-03-15T10:30:00.123+02:00');
    })

    it('Should ignore time if options.time=false', () => {
      const format = new DateCodec({time: false});
      expect(format.decode('202003151030')).toStrictEqual('2020-03-15');
      expect(format.decode('2020-03-15T10:30')).toStrictEqual('2020-03-15');
    })

    it('Should ignore timezone if options.timeZone=false', () => {
      const format = new DateCodec({timeZone: false});
      expect(format.decode('202003151030.123Z')).toStrictEqual('2020-03-15T10:30:00.123');
      expect(format.decode('2020-03-15T10:30.123Z')).toStrictEqual('2020-03-15T10:30:00.123');
      expect(format.decode('202003151030.123+02:00')).toStrictEqual('2020-03-15T10:30:00.123');
      expect(format.decode('2020-03-15T10:30.123+02:00')).toStrictEqual('2020-03-15T10:30:00.123');
    })

    it('Should stringify to url string', () => {
      const format = new DateCodec();
      expect(format.encode('2020')).toStrictEqual('2020-01-01T00:00:00');
    })

    it('Should validate min value', () => {
      const format = new DateCodec({min: '20210410'});
      expect(() => format.decode('20210409')).toThrow('or greater');
    })

    it('Should set max value', () => {
      const format = new DateCodec({max: '20210410'});
      expect(() => format.decode('20210411')).toThrow('or less');
    })

    it('Should validate values', () => {
      const format = new DateCodec();
      expect(() => format.decode('notADate')).toThrow('not a valid date');
    })
  });

  describe('FilterCodec', () => {
    it('Should parse', () => {
      const format = new FilterCodec();
      expect(format.decode('a=1')).toBeInstanceOf(Expression);
    })

    it('Should stringify to url string', () => {
      const format = new FilterCodec();
      expect(format.encode($eq($field('a'), 1))).toStrictEqual('a=1');
    })

  });

})

