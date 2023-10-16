import { EnumType } from '../../data-type/enum-type.js';

export enum MetadataMode {
  'none' = 'none',
  'minimal' = 'minimal',
  'full' = 'full'
}

EnumType(MetadataMode, {
  name: 'MetadataMode',
  description: 'Parameter "enumeration" that controls how metadata information sent',
  meanings: {
    'none': 'Specifies that the service will include NO metadata information in the response',
    'minimal': 'Specifies that the service will include ALL metadata information in the response',
    'full': 'Specifies that the service will include MINIMAL metadata information in the response',
  }
})
