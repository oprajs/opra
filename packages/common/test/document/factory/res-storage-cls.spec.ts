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
      _delete() {
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
    expect(t.operations.delete).toBeDefined();
    expect(t.operations.delete?.handlerName).toStrictEqual('_delete');
  })

  it('Should define "get" operation endpoint', async () => {
    @Storage()
    class MyStorageResource {
      @Storage.Get()
      _read() {
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
    expect(t.operations.get).toBeDefined();
    expect(t.operations.get?.handlerName).toStrictEqual('_read');
  })

  it('Should define "put" operation endpoint', async () => {
    @Storage()
    class MyStorageResource {
      @Storage.Put()
      _put() {
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
    expect(t.operations.put).toBeDefined();
    expect(t.operations.put?.handlerName).toStrictEqual('_put');
  })


});
