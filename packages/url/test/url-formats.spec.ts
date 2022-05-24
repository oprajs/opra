import {$eq, $field, BooleanFormat, Expression, FilterFormat, IntegerFormat, NumberFormat, StringFormat} from '../src';
import {DateFormat} from '../src/formats/date-format';

describe('URL search param formats', () => {

  describe('StringFormat', () => {
    it('Should parse', () => {
      const format = new StringFormat();
      expect(format.parse('1')).toStrictEqual('1');
      expect(format.parse('')).toStrictEqual('');
    })

    it('Should stringify to url string', () => {
      const format = new StringFormat();
      expect(format.stringify('1|2')).toStrictEqual('1|2');
      expect(format.stringify(null)).toStrictEqual('');
      expect(format.stringify(undefined)).toStrictEqual('');
    })

    it('Should validate min length', () => {
      const format = new StringFormat({minLength: 3});
      expect(() => format.parse('ab')).toThrow('must be at least');
    })

    it('Should set max length', () => {
      const format = new StringFormat({maxLength: 3});
      expect(() => format.parse('abcde')).toThrow('can be up to');
    })

    it('Should validate enum values', () => {
      const format = new StringFormat({enum: ['a', 'b']});
      expect(format.parse('a')).toStrictEqual('a');
      expect(() => format.parse('c')).toThrow('enum');
    })
  });

  describe('NumberFormat', () => {
    it('Should parse', () => {
      const format = new NumberFormat();
      expect(format.parse('-1.1')).toStrictEqual(-1.1);
    })

    it('Should stringify to url string', () => {
      const format = new NumberFormat();
      expect(format.stringify(-5.5)).toStrictEqual('-5.5');
      expect(format.stringify(null)).toStrictEqual('');
      expect(format.stringify(undefined)).toStrictEqual('');
    })

    it('Should validate min length', () => {
      const format = new NumberFormat({min: 3});
      expect(() => format.parse('2')).toThrow('or greater');
    })

    it('Should set max length', () => {
      const format = new NumberFormat({max: 3});
      expect(() => format.parse('5')).toThrow('or less');
    })

    it('Should validate values', () => {
      const format = new NumberFormat();
      expect(() => format.parse('notANumber')).toThrow('not a valid number');
    })
  });

  describe('IntegerFormat', () => {
    it('Should parse', () => {
      const format = new IntegerFormat();
      expect(format.parse('-1')).toStrictEqual(-1);
    })

    it('Should stringify to url string', () => {
      const format = new IntegerFormat();
      expect(format.stringify(-5)).toStrictEqual('-5');
      expect(format.stringify(null)).toStrictEqual('');
      expect(format.stringify(undefined)).toStrictEqual('');
    })

    it('Should validate min length', () => {
      const format = new IntegerFormat({min: 3});
      expect(() => format.parse('2')).toThrow('or greater');
    })

    it('Should set max length', () => {
      const format = new IntegerFormat({max: 3});
      expect(() => format.parse('5')).toThrow('or less');
    })

    it('Should validate values', () => {
      const format = new IntegerFormat();
      expect(() => format.parse('notANumber')).toThrow('not a valid number');
      expect(() => format.parse('1.1')).toThrow('not a valid integer');
    })

    it('Should validate enum values', () => {
      const format = new IntegerFormat({enum: [1, 2]});
      expect(format.parse('1')).toStrictEqual(1);
      expect(() => format.parse('5')).toThrow('enum');
    })
  });

  describe('BooleanFormat', () => {
    it('Should parse', () => {
      const format = new BooleanFormat();
      expect(format.parse('true')).toStrictEqual(true);
      expect(format.parse('t')).toStrictEqual(true);
      expect(format.parse('yes')).toStrictEqual(true);
      expect(format.parse('y')).toStrictEqual(true);
      expect(format.parse('1')).toStrictEqual(true);
      expect(format.parse('false')).toStrictEqual(false);
      expect(format.parse('f')).toStrictEqual(false);
      expect(format.parse('no')).toStrictEqual(false);
      expect(format.parse('n')).toStrictEqual(false);
      expect(format.parse('0')).toStrictEqual(false);
    })

    it('Should stringify to url string', () => {
      const format = new BooleanFormat();
      expect(format.stringify(true)).toStrictEqual('true');
      expect(format.stringify(false)).toStrictEqual('false');
      expect(format.stringify(null)).toStrictEqual('');
      expect(format.stringify(undefined)).toStrictEqual('');
    })

    it('Should validate values', () => {
      const format = new BooleanFormat();
      expect(() => format.parse('notABoolean')).toThrow('not a valid boolean');
    })
  })

  describe('DateFormat', () => {
    it('Should parse', () => {
      const format = new DateFormat();
      expect(format.parse('')).toStrictEqual('');
      expect(format.parse('2020')).toStrictEqual('2020-01-01T00:00:00');
      expect(format.parse('202003')).toStrictEqual('2020-03-01T00:00:00');
      expect(format.parse('2020-03')).toStrictEqual('2020-03-01T00:00:00');
      expect(format.parse('20200315')).toStrictEqual('2020-03-15T00:00:00');
      expect(format.parse('2020-03-15')).toStrictEqual('2020-03-15T00:00:00');
      expect(format.parse('202003151030')).toStrictEqual('2020-03-15T10:30:00');
      expect(format.parse('2020-03-15T10:30')).toStrictEqual('2020-03-15T10:30:00');
      expect(format.parse('202003151030.123')).toStrictEqual('2020-03-15T10:30:00.123');
      expect(format.parse('2020-03-15T10:30.123')).toStrictEqual('2020-03-15T10:30:00.123');
      expect(format.parse('202003151030.123Z')).toStrictEqual('2020-03-15T10:30:00.123Z');
      expect(format.parse('2020-03-15T10:30.123Z')).toStrictEqual('2020-03-15T10:30:00.123Z');
      expect(format.parse('202003151030.123+02:00')).toStrictEqual('2020-03-15T10:30:00.123+02:00');
      expect(format.parse('2020-03-15T10:30.123+02:00')).toStrictEqual('2020-03-15T10:30:00.123+02:00');
    })

    it('Should ignore time if options.time=false', () => {
      const format = new DateFormat({time: false});
      expect(format.parse('202003151030')).toStrictEqual('2020-03-15');
      expect(format.parse('2020-03-15T10:30')).toStrictEqual('2020-03-15');
    })

    it('Should ignore timezone if options.timeZone=false', () => {
      const format = new DateFormat({timeZone: false});
      expect(format.parse('202003151030.123Z')).toStrictEqual('2020-03-15T10:30:00.123');
      expect(format.parse('2020-03-15T10:30.123Z')).toStrictEqual('2020-03-15T10:30:00.123');
      expect(format.parse('202003151030.123+02:00')).toStrictEqual('2020-03-15T10:30:00.123');
      expect(format.parse('2020-03-15T10:30.123+02:00')).toStrictEqual('2020-03-15T10:30:00.123');
    })

    it('Should stringify to url string', () => {
      const format = new DateFormat();
      expect(format.stringify('2020')).toStrictEqual('2020-01-01T00:00:00');
    })

    it('Should validate min value', () => {
      const format = new DateFormat({min: '20210410'});
      expect(() => format.parse('20210409')).toThrow('or greater');
    })

    it('Should set max value', () => {
      const format = new DateFormat({max: '20210410'});
      expect(() => format.parse('20210411')).toThrow('or less');
    })

    it('Should validate values', () => {
      const format = new DateFormat();
      expect(() => format.parse('notADate')).toThrow('not a valid date');
    })
  });

  describe('FilterFormat', () => {
    it('Should parse', () => {
      const format = new FilterFormat();
      expect(format.parse('a=1')).toBeInstanceOf(Expression);
    })

    it('Should stringify to url string', () => {
      const format = new FilterFormat();
      expect(format.stringify($eq($field('a'), 1))).toStrictEqual('a=1');
    })

  });

})

