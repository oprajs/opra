import filedirname from 'filedirname'
import {readFileSync} from 'fs';
import path from 'path';
import {Injectable} from '@nestjs/common';
import {DataService} from '../../common/DataService.js';

const data: any[] = JSON.parse(readFileSync(path.join(filedirname()[1], './countries.json'), 'utf-8'));
const AllElements = ['code', 'name', 'phoneCode', 'continentCode', 'hasMarket'];

@Injectable()
export class CountryService extends DataService {

  constructor() {
    super(data, 'code', AllElements);
  }

}

