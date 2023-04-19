import { OpraSchema } from '../../schema/index.js';
import { ComplexType } from '../data-type/complex-type.js';
import { DataType } from '../data-type/data-type.js';
import { EnumType } from '../data-type/enum-type.js';
import { MappedType } from '../data-type/mapped-type.js';
import { SimpleType } from '../data-type/simple-type.js';
import { UnionType } from '../data-type/union-type.js';
import type { DocumentFactory } from './factory.js';

export async function processTypes(this: DocumentFactory) {
  const {document, typeQueue} = this;
  // Create DataType instances
  for (const [name, schema] of typeQueue.entries()) {
    const dataType = this.createDataTypeInstance(schema.kind, name);
    document.types.set(name, dataType);
  }
  // Process schemas
  const typeNames = Array.from(typeQueue.keys());
  for (const name of typeNames) {
    if (!typeQueue.has(name))
      continue;
    this.addDataType(name);
  }
  document.invalidate();
}

export function createDataTypeInstance(
    this: DocumentFactory,
    kind: OpraSchema.DataType.Kind, name?: string
): DataType {
  const dataType = {
    document: this.document,
    kind,
    name
  } as DataType;
  switch (kind) {
    case OpraSchema.ComplexType.Kind:
      Object.setPrototypeOf(dataType, ComplexType.prototype);
      break;
    case OpraSchema.EnumType.Kind:
      Object.setPrototypeOf(dataType, EnumType.prototype);
      break;
    case OpraSchema.MappedType.Kind:
      Object.setPrototypeOf(dataType, MappedType.prototype);
      break;
    case OpraSchema.SimpleType.Kind:
      Object.setPrototypeOf(dataType, SimpleType.prototype);
      break;
    case OpraSchema.UnionType.Kind:
      Object.setPrototypeOf(dataType, UnionType.prototype);
      break;
    default:
      throw new TypeError(`Unknown DataType kind (${kind})`);
  }
  return dataType;
}

export function addDataType(
    this: DocumentFactory,
    schemaOrName: OpraSchema.DataType | string
): DataType {
  const {document, typeQueue, circularRefs, curPath} = this;
  const name = typeof schemaOrName === 'string' ? schemaOrName : undefined;
  let schema: OpraSchema.DataType | undefined;
  let dataType: DataType | undefined;
  if (name) {
    // Check if data type exists in document
    dataType = document.getDataType(name);
    // Get schema from stack, it is already done if not exist
    schema = typeQueue.get(name);
    if (!schema)
      return dataType;
    // Detect circular refs
    if (circularRefs.has(name))
      throw new TypeError(`Circular reference detected. ${[...Array.from(circularRefs.keys()), name].join('>')}`)
    circularRefs.set(name, 1);
  } else
    schema = schemaOrName as OpraSchema.DataType;

  try {
    // Init base
    let base: any;
    if ((OpraSchema.isSimpleType(schema) || OpraSchema.isComplexType(schema) || OpraSchema.isEnumType(schema)) && schema.base) {
      curPath.push(typeof schema.base === 'string' ? schema.base : '[base]');
      base = this.addDataType(schema.base);
      curPath.pop();
    }

    // **** Init SimpleType ****
    if (OpraSchema.isSimpleType(schema)) {
      const initArgs: SimpleType.InitArguments = {
        ...schema,
        name,
        base
      }
      dataType = dataType || this.createDataTypeInstance(schema.kind, name);
      if (name) curPath.push(name);
      SimpleType.apply(dataType, [document, initArgs] as any);
      if (name) curPath.pop();
      return dataType;
    }

    // **** Init ComplexType ****
    if (OpraSchema.isComplexType(schema)) {
      const initArgs: ComplexType.InitArguments = {
        ...schema,
        name,
        base
      }
      dataType = dataType || this.createDataTypeInstance(schema.kind, name);
      if (name) curPath.push(name);
      ComplexType.apply(dataType, [document, initArgs] as any);
      if (name)
        typeQueue.delete(name);

      // process fields
      if (schema.fields) {
        for (const [elemName, v] of Object.entries(schema.fields)) {
          const elemSchema = typeof v === 'object' ? v : {type: v};
          curPath.push(`${name}.${elemName}[type]`);
          const elemType = this.addDataType(elemSchema.type);
          (dataType as ComplexType).addField({
            ...elemSchema,
            name: elemName,
            type: elemType
          });
          curPath.pop();
        }
      }
      if (name) curPath.pop();
      return dataType;
    }

    // **** Init EnumType ****
    if (OpraSchema.isEnumType(schema)) {
      const initArgs: EnumType.InitArguments = {
        ...schema,
        name,
        base
      }
      dataType = dataType || this.createDataTypeInstance(schema.kind, name);
      if (name) curPath.push(name);
      EnumType.apply(dataType, [document, initArgs] as any);
      if (name) curPath.pop();
      return dataType;
    }

    // **** Init UnionType ****
    if (OpraSchema.isUnionType(schema)) {
      const unionTypes = schema.types.map(t => this.addDataType(t)) as any;
      const initArgs: UnionType.InitArguments = {
        ...schema,
        name,
        types: unionTypes
      }
      dataType = dataType || this.createDataTypeInstance(schema.kind, name);
      if (name) curPath.push(name);
      UnionType.apply(dataType, [document, initArgs] as any);
      if (name) curPath.pop();
      return dataType;
    }

    // **** Init MappedType ****
    if (OpraSchema.isMappedType(schema)) {
      const dt = this.addDataType(schema.type);
      if (!(dt instanceof ComplexType))
        throw new TypeError(`MappedType requires a ComplexType`);
      const initArgs: MappedType.InitArguments = {
        ...schema,
        name,
        type: dt
      }
      dataType = dataType || this.createDataTypeInstance(schema.kind, name);
      if (name) curPath.push(name);
      MappedType.apply(dataType, [document, initArgs] as any);
      if (name) curPath.pop();
      return dataType;
    }

  } catch (e: any) {
    if (curPath.length)
      e.message = `Error at ${curPath.join('/')}: ` + e.message;
    throw e;
  } finally {
    if (name) {
      circularRefs.delete(name);
      typeQueue.delete(name);
    }
  }
  throw new TypeError(`Invalid DataType schema: ${JSON.stringify(schema).substring(0, 20)}...`);
}
