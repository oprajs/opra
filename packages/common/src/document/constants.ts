export const DATATYPE_METADATA = Symbol.for('opra.type.metadata');
export const HTTP_CONTROLLER_METADATA = Symbol('opra.http-controller.metadata');
export const MQ_CONTROLLER_METADATA = Symbol('opra.mq-controller.metadata');
export const RPC_CONTROLLER_METADATA = Symbol('opra.rpc-controller.metadata');
export const DECODER = Symbol.for('opra.type.decoder');
export const ENCODER = Symbol('opra.type.encoder');
export const DECORATOR = Symbol.for('DECORATOR');
export const BUILTIN = Symbol.for('BUILTIN');

export const NAMESPACE_PATTERN = /([a-z$_]\w+):(.+)/i;
export const CLASS_NAME_PATTERN = /^[a-z][\w_]*$/i;

export const kDataTypeMap = Symbol.for('kDataTypeMap');
export const kCtorMap = Symbol.for('kCtorMap');
export const kTypeNSMap = Symbol.for('kTypeNSMap');
