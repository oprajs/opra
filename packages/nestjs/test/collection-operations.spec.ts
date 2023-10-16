import { Server } from 'http';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import photosData from './_support/photos-app/api/photos-module/photos.data.js';
import { ApplicationModule } from './_support/photos-app/app.module.js';

describe('Collection resource operations', function () {

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

  it('Should execute action handler', async function () {
    const resp = await request(server)
        .get('/api/svc1/Photos/sendMessage?message=text');
    expect(resp.body.errors).toStrictEqual(undefined);
    expect(resp.body.payload).toStrictEqual({ok: true, message: 'text'});
    expect(resp.status).toStrictEqual(200);
  });

  it('Should execute "get" operation handler', async function () {
    const resp = await request(server)
        .get('/api/svc1/Photos@1');
    expect(resp.body.errors).toStrictEqual(undefined);
    expect(resp.body.payload).toStrictEqual(photosData[0]);
    expect(resp.status).toStrictEqual(200);
  });

  it('Should execute "findMany" operation handler', async function () {
    const resp = await request(server)
        .get('/api/svc1/Photos?filter=id<=2');
    expect(resp.body.errors).toStrictEqual(undefined);
    expect(resp.body.payload).toStrictEqual(photosData.filter(x => x.id <= 2));
    expect(resp.status).toStrictEqual(200);
  });

  it('Should execute "create" operation handler', async function () {
    const data = {
      id: 4, name: 'Elephant', description: 'Photo of an Elephant', views: 1000
    };
    const resp = await request(server)
        .post('/api/svc1/Photos')
        .send(data)
    expect(resp.body.errors).toStrictEqual(undefined);
    expect(resp.body.payload).toStrictEqual(data);
    expect(resp.status).toStrictEqual(201);
    expect(photosData.find(x => x && x.id === 4)).toMatchObject(data);
  });

  it('Should execute "update" operation handler', async function () {
    const oldData = photosData.find(x => x && x.id === 1);
    const data = {views: 5500};
    const resp = await request(server)
        .patch('/api/svc1/Photos@1')
        .send(data)
    expect(resp.body.errors).toStrictEqual(undefined);
    expect(resp.body.payload).toStrictEqual({...oldData, ...data});
    expect(resp.status).toStrictEqual(200);
    expect(photosData.find(x => x && x.id === 1)).toStrictEqual({...oldData, ...data});
  });

  it('Should execute "updateMany" operation handler', async function () {
    photosData.push({id: 5}, {id: 6});
    const data = {views: 100};
    const resp = await request(server)
        .patch('/api/svc1/Photos?filter=id>=5')
        .send(data)
    expect(resp.body.errors).toStrictEqual(undefined);
    expect(resp.status).toStrictEqual(200);
    expect(photosData.find(x => x && x.id === 5)).toStrictEqual({id: 5, views: 100});
    expect(photosData.find(x => x && x.id === 6)).toStrictEqual({id: 6, views: 100});
  });

  it('Should execute "delete" operation handler', async function () {
    photosData.push({id: 15});
    const resp = await request(server)
        .delete('/api/svc1/Photos@15');
    expect(resp.body.errors).toStrictEqual(undefined);
    expect(resp.body.affected).toEqual(1);
    expect(resp.status).toStrictEqual(200);
    expect(photosData.find(x => x && x.id === 15)).toStrictEqual(undefined);
  });

  it('Should execute "deleteMany" operation handler', async function () {
    photosData.push({id: 16}, {id: 17});
    const resp = await request(server)
        .delete('/api/svc1/Photos?filter=id>=16');
    expect(resp.body.errors).toStrictEqual(undefined);
    expect(resp.body.affected).toBeGreaterThan(1);
    expect(resp.status).toStrictEqual(200);
    expect(photosData.find(x => x && x.id >= 16)).toStrictEqual(undefined);
  });

});
