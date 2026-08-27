import 'reflect-metadata';
import {
  ApiDocument,
  ApiDocumentFactory,
  EnumType,
  OpraSchema,
} from '@opra/common';
import { expect } from 'expect';
import { TestHttpApiDocument } from '../../_support/test-http-api/index.js';

enum Color {
  black = 'black',
  white = 'white',
  gray = 'gray',
}

EnumType(Color, {
  name: 'Color',
  description: 'A color',
  meanings: {
    black: 'Black color',
    white: 'White color',
    gray: 'Gray color',
  },
});

const Size = ['S', 'M', 'L'] as const;

EnumType(Size, {
  name: 'Size',
  description: 'A size',
  meanings: {
    S: 'Small',
    M: 'Medium',
    L: 'Large',
  },
});

enum ExtendedColor {
  red = 'red',
  blue = 'blue',
}

EnumType(ExtendedColor, {
  name: 'ExtendedColor',
  base: Color,
  description: 'An extended color',
  meanings: {
    red: 'Red color',
    blue: 'Blue color',
  },
});

describe('common:EnumType', () => {
  let doc: ApiDocument;

  before(async () => {
    const baseDoc = await TestHttpApiDocument.create();
    doc = await ApiDocumentFactory.createDocument({
      spec: OpraSchema.SpecVersion,
      references: {
        base: baseDoc,
      },
      types: [Color, Size, ExtendedColor],
    });
  });

  it('Should getEnumType(name) return EnumType instance', async () => {
    const dt = doc.node.getEnumType('Color');
    expect(dt).toBeDefined();
    expect(dt).toBeInstanceOf(EnumType);
    expect(dt.kind).toStrictEqual(OpraSchema.EnumType.Kind);
    expect(dt.name).toStrictEqual('Color');
  });

  it('Should getEnumType(ctor) return EnumType instance', async () => {
    const dt = doc.node.getEnumType(Color);
    expect(dt).toBeDefined();
    expect(dt.name).toStrictEqual('Color');
  });

  it('Should create EnumType from a TS enum (object) with meanings', async () => {
    const dt = doc.node.getEnumType('Color');
    expect(dt.description).toStrictEqual('A color');
    expect(dt.attributes).toStrictEqual({
      black: { alias: 'black', description: 'Black color' },
      white: { alias: 'white', description: 'White color' },
      gray: { alias: 'gray', description: 'Gray color' },
    });
  });

  it('Should create EnumType from an array with meanings', async () => {
    const dt = doc.node.getEnumType('Size');
    expect(dt.description).toStrictEqual('A size');
    expect(dt.attributes).toStrictEqual({
      S: { description: 'Small' },
      M: { description: 'Medium' },
      L: { description: 'Large' },
    });
  });

  it('Should extend EnumType via base', async () => {
    const dt = doc.node.getEnumType('ExtendedColor');
    expect(dt.base).toBeInstanceOf(EnumType);
    expect(dt.base!.name).toStrictEqual('Color');
    expect(dt.ownAttributes).toStrictEqual({
      red: { alias: 'red', description: 'Red color' },
      blue: { alias: 'blue', description: 'Blue color' },
    });
    expect(dt.attributes).toStrictEqual({
      black: { alias: 'black', description: 'Black color' },
      white: { alias: 'white', description: 'White color' },
      gray: { alias: 'gray', description: 'Gray color' },
      red: { alias: 'red', description: 'Red color' },
      blue: { alias: 'blue', description: 'Blue color' },
    });
  });

  it('Should extendsFrom() return true for itself', async () => {
    const dt = doc.node.getEnumType('Color');
    expect(dt.extendsFrom('Color')).toBe(true);
  });

  it('Should extendsFrom() return true for its base type', async () => {
    const dt = doc.node.getEnumType('ExtendedColor');
    expect(dt.extendsFrom('Color')).toBe(true);
    expect(dt.extendsFrom(Color)).toBe(true);
  });

  it('Should extendsFrom() return false for an unrelated type', async () => {
    const dt = doc.node.getEnumType('Color');
    expect(dt.extendsFrom('Size')).toBe(false);
  });

  it('Should generateCodec() return a validator accepting own values', async () => {
    const dt = doc.node.getEnumType('Color');
    const decode = dt.generateCodec();
    expect(decode('black')).toStrictEqual('black');
  });

  it('Should generateCodec() throw for a value outside the enum', async () => {
    const dt = doc.node.getEnumType('Color');
    const decode = dt.generateCodec();
    expect(() => decode('purple')).toThrow('must be one of enumeration member');
  });

  it('Should generateCodec() accept values inherited from base type', async () => {
    const dt = doc.node.getEnumType('ExtendedColor');
    const decode = dt.generateCodec();
    expect(decode('black')).toStrictEqual('black');
    expect(decode('red')).toStrictEqual('red');
  });

  it('Should toJSON() return schema for a root EnumType', async () => {
    const dt = doc.node.getEnumType('Color');
    const x = dt.toJSON();
    expect(x).toStrictEqual({
      kind: 'EnumType',
      description: 'A color',
      attributes: {
        black: { alias: 'black', description: 'Black color' },
        white: { alias: 'white', description: 'White color' },
        gray: { alias: 'gray', description: 'Gray color' },
      },
    });
  });

  it('Should toJSON() return schema with base reference and own attributes only', async () => {
    const dt = doc.node.getEnumType('ExtendedColor');
    const x = dt.toJSON();
    expect(x).toStrictEqual({
      kind: 'EnumType',
      description: 'An extended color',
      base: 'Color',
      attributes: {
        red: { alias: 'red', description: 'Red color' },
        blue: { alias: 'blue', description: 'Blue color' },
      },
    });
  });

  it('Should resolve the shared "Gender" EnumType from a referenced document', async () => {
    const dt = doc.node.getEnumType('Gender');
    expect(dt).toBeDefined();
    expect(dt.kind).toStrictEqual(OpraSchema.EnumType.Kind);
    expect(dt.name).toStrictEqual('Gender');
    expect(dt.attributes.M).toStrictEqual({
      alias: 'MALE',
      description: 'Male',
    });
  });
});
