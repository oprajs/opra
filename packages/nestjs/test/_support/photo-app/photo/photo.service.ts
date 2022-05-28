import {Injectable} from '@nestjs/common';

@Injectable()
export class PhotoService {

  async findAll(): Promise<any[]> {
    return [];
  }

  async create(): Promise<any> {
    return {
      name: 'Nest',
      description: 'Is great!',
      views: 6000
    };
  }
}
