import type { Type } from 'ts-gems';

export type OpraSchemaProperty = {
  type: Type;
  name: string;
  description?: string;
  format?: string;
  isArray?: boolean;
  default?: any;
  fixed?: string | number;
  enum?: string[] | Record<string, string>;
  enumDescriptions?: Record<string, string>;
  enumName?: string;
  examples?: any[] | Record<string, any>;
  deprecated?: boolean | string;
  // rules
  nullable?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  required?: boolean | string[]; // boolean or array of action
};
