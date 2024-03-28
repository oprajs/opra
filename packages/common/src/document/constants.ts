export const DATATYPE_METADATA = Symbol.for('opra.type.metadata');
export const RESOURCE_METADATA = Symbol('opra.resource.metadata');
export const DECODER = Symbol.for('opra.type.decoder');
export const ENCODER = Symbol('opra.type.encoder');
export const DECORATOR = Symbol.for('DECORATOR');
export const BUILTIN = Symbol.for('BUILTIN');

export const API_NAME_PATTERN = /^[a-z][\w_]*$/i;
export const NAMESPACE_PATTERN = /([a-z$_]\w+)(:.+)/i;
export const TYPENAME_PATTERN = /([a-z][\w_]+)/i;
export const EXTRACT_TYPENAME_PATTERN = /^(.*)Type(\d*)$/;
export const SORT_FIELD_PATTERN = /^([+-])?([a-z$_][\w.]*)$/i;
export const FIELD_NAME_PATTERN = /^[a-z$_]\w*$/i
export const FIELD_PATH_PATTERN = /^[a-z$_][\w.]*$/i


