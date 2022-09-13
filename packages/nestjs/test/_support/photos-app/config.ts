import filedirname from 'filedirname';
import path from 'path';
import { OpraModuleOptions } from '../../../src/index.js';

const config: OpraModuleOptions = {
  prefix: '',
  info: {title: 'service1', version: '1'},
  i18n: {
    resourceDirs: [path.join(filedirname()[1], 'locale')]
  },
  context: () => {
    return {
      user: {
        id: 1,
        name: 'Test User'
      }
    }
  }
}

export default config;