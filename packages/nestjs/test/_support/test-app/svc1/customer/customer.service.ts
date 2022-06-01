import filedirname from 'filedirname'
import {readFileSync} from 'fs';
import path from 'path';
import {Injectable} from '@nestjs/common';
import {DataService} from '../../common/DataService.js';

const data: any[] = JSON.parse(readFileSync(path.join(filedirname()[1], './customers.json'), 'utf-8'));
const AllElements = ['id', 'givenName', 'familyName', 'gender', 'birthDate', 'city',
  'countryCode', 'active', 'vip', 'addressCity', 'addressStreet', 'zipCode'];

@Injectable()
export class CustomerService extends DataService {

  constructor() {
    super(data, 'id', AllElements);
  }

}
