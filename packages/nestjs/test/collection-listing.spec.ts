import {Server} from 'http';
import request from 'supertest';
import {INestApplication} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import {OpraURL} from '@opra/url';
import {ApplicationModule} from './_support/test-app/app.module';

describe('Requesting collection', function () {

  let server: Server;
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ApplicationModule],
    }).compile();
    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  })

  afterAll(() => app.close());

  it('Should parse url into required parts', async function () {
    const url = new OpraURL()
      .setPrefix('/api/v1/svc1')
      .addPath('Airport')
      .setLimit(10)
      .setSkip(1)
      .setFilter("Name like 'A%'")
      .setElements('Name')
      .setInclude('ID', 'ShortName')
      .setExclude('Frequency')
      .setDistinct(true)
      .setTotal(true);

    const res = await request(server)
      .get(url.toString());
    expect(res.status).toStrictEqual(200);
    expect(res.body).toBeDefined();
    expect(res.body.request).toStrictEqual({
      "scope": "collection",
      "collection": "Photo",
      "distinct": true,
      "elements": ["Name"],
      "exclude": ["Frequency"],
      "include": ["ID", "ShortName"],
      "limit": 10,
      "skip": 1,
      "total": true,
      "filter": {
        "left": {
          "type": "QualifiedIdentifier",
          "value": "Name"
        },
        "op": "like",
        "right": {
          "type": "StringLiteral",
          "value": "A%"
        },
        "type": "ComparisonExpression"
      }
    });
  });

});
