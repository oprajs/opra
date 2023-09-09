/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  DocumentFactory,
  OpraSchema,
  Storage,
} from '@opra/common';

describe('DocumentFactory - Storage resource with decorated classes', function () {

  const baseArgs: DocumentFactory.InitArguments = {
    version: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    }
  };

  it('Should add Storage resource', async () => {
    @Storage({
      description: 'Storage resource',
    })
    class MyStorageResource {

    }

    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      resources: [MyStorageResource]
    })
    expect(doc).toBeDefined();
    const t = doc.getStorage('MyStorage');
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual(OpraSchema.Storage.Kind);
    expect(t.name).toStrictEqual('MyStorage');
    expect(t.description).toStrictEqual('Storage resource');
    expect(t.controller).toBe(MyStorageResource);
  })

  it('Should define "delete" operation endpoint', async () => {
    @Storage()
    class MyStorageResource {
      @Storage.Delete()
      delete() {
        return {};
      }
    }

    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      resources: [MyStorageResource]
    })
    expect(doc).toBeDefined();
    const t = doc.getStorage('MyStorage');
    expect(t.controller).toBe(MyStorageResource);
    expect(t.getOperation('delete')).toBeDefined();
  })

  it('Should define "get" operation endpoint', async () => {
    @Storage()
    class MyStorageResource {
      @Storage.Get()
      get() {
        return {};
      }
    }

    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      resources: [MyStorageResource]
    })
    expect(doc).toBeDefined();
    const t = doc.getStorage('MyStorage');
    expect(t.controller).toBe(MyStorageResource);
    expect(t.getOperation('get')).toBeDefined();
  })

  it('Should define "put" operation endpoint', async () => {
    @Storage()
    class MyStorageResource {
      @Storage.Post()
      post() {
        return {};
      }
    }

    const doc = await DocumentFactory.createDocument({
      ...baseArgs,
      resources: [MyStorageResource]
    })
    expect(doc).toBeDefined();
    const t = doc.getStorage('MyStorage');
    expect(t.controller).toBe(MyStorageResource);
    expect(t.getOperation('post')).toBeDefined();
  })


});
