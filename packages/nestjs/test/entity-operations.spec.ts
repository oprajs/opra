import { Server } from 'http';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ApplicationModule } from './_support/photos-app/app.module.js';
import photosData from './_support/photos-app/photos-module/photos.data.js';

describe('Entity operations', function () {

  let server: Server;
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ApplicationModule],
    }).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    server = app.getHttpServer();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('Should retrieve single instance', async function () {
    const resp = await request(server)
        .get('/api/svc1/Photos@1');
    expect(resp.status).toStrictEqual(200);
    expect(resp.body).toStrictEqual(photosData[0]);
  });

  it('Should search from entity collection', async function () {
    const resp = await request(server)
        .get('/api/svc1/Photos?$filter=id<=2');
    expect(resp.status).toStrictEqual(200);
    expect(resp.body).toStrictEqual({
      items: photosData.filter(x => x.id <= 2)
    });
  });

  it('Should create new instance into entity', async function () {
    const data = {
      id: 4, name: 'Elephant', description: 'Photo of an Elephant', views: 1000
    };
    const resp = await request(server)
        .post('/api/svc1/Photos')
        .send(data)
    expect(resp.status).toStrictEqual(201);
    expect(resp.body).toStrictEqual(data);
    expect(photosData.find(x => x && x.id === 4)).toStrictEqual(data);
  });

  it('Should update an instance', async function () {
    const oldData = photosData.find(x => x && x.id === 1);
    const data = {views: 5500};
    const resp = await request(server)
        .patch('/api/svc1/Photos@1')
        .send(data)
    expect(resp.status).toStrictEqual(200);
    expect(resp.body).toStrictEqual({...oldData, ...data});
    expect(photosData.find(x => x && x.id === 1)).toStrictEqual({...oldData, ...data});
  });

  it('Should update multiple instances', async function () {
    photosData.push({id: 5}, {id: 6});
    const data = {views: 100};
    const resp = await request(server)
        .patch('/api/svc1/Photos?$filter=id>=5')
        .send(data)
    expect(resp.status).toStrictEqual(200);
    expect(photosData.find(x => x && x.id === 5)).toStrictEqual({id: 5, views: 100});
    expect(photosData.find(x => x && x.id === 6)).toStrictEqual({id: 6, views: 100});
  });

  it('Should delete an instance', async function () {
    photosData.push({id: 15});
    const resp = await request(server)
        .delete('/api/svc1/Photos@15');
    expect(resp.status).toStrictEqual(200);
    expect(resp.body).toStrictEqual({affected: 1});
    expect(photosData.find(x => x && x.id === 15)).toStrictEqual(undefined);
  });

  it('Should delete multiple instances', async function () {
    photosData.push({id: 16}, {id: 17});
    const resp = await request(server)
        .delete('/api/svc1/Photos?$filter=id>=16');
    expect(resp.status).toStrictEqual(200);
    expect(resp.body).toStrictEqual({affected: 2});
    expect(photosData.find(x => x && (x.id === 16 || x.id === 17))).toStrictEqual(undefined);
  });

});
