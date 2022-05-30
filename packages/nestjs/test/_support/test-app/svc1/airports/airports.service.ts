import filedirname from 'filedirname'
import {readFileSync} from 'fs';
import path from 'path';
import * as _ from 'underscore';
import {Injectable} from '@nestjs/common';

const data: any[] = JSON.parse(readFileSync(path.join(filedirname()[1], './airports.json'), 'utf-8'));
const AllElements = ['id', 'shortName', 'name', 'region', 'ICAO', 'flags',
  'catalog', 'length', 'elevation', 'runway', 'frequency', 'latitude', 'longitude'];

@Injectable()
export class AirportsService {

  async findAll(options: any): Promise<any[]> {
    return data
      .map(x => {
        const elements = AllElements.filter(el =>
          ((!options.elements || options.elements.includes(el)) ||
            (options.include && options.include.includes(el))) &&
          (!options.exclude || !options.exclude.includes(el))
        );
        return _.pick(x, elements);
      })
      .slice(options.skip || 0, (options.skip || 0) + (options.limit || 10));
  }

  async create(): Promise<any> {
    return {
      name: 'Nest',
      description: 'Is great!',
      views: 6000
    };
  }
}
