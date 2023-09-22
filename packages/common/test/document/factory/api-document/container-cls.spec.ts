/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ApiDocumentFactory, Container,
  OpraSchema, Singleton,
} from '@opra/common';
import { Profile } from '../../../_support/test-api/index.js';

describe('ApiDocumentFactory - Container resource with decorated classes', function () {

  const baseArgs: ApiDocumentFactory.InitArguments = {
    version: OpraSchema.SpecVersion,
    info: {
      title: 'TestDocument',
      version: 'v1',
      description: 'Document description',
    }
  };

  it('Should add Container resource', async () => {
    @Container({
      description: 'Container resource',
    })
    class UserContainer {

    }

    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      root: {
        resources: [UserContainer]
      }
    })
    expect(doc).toBeDefined();
    const t = doc.getResource('user', true) as Container;
    expect(t).toBeDefined();
    expect(t.kind).toStrictEqual(OpraSchema.Container.Kind);
    expect(t.name).toStrictEqual('User');
    expect(t.description).toStrictEqual('Container resource');
    expect(t.ctor).toBe(UserContainer);
  })

  it('Should add Container resource with sub resources', async () => {
    @Singleton(Profile)
    class MyProfile {
    }

    @Container({
      description: 'Container resource',
      resources: [MyProfile]
    })
    class UserContainer {

    }

    const doc = await ApiDocumentFactory.createDocument({
      ...baseArgs,
      root: {
        resources: [UserContainer]
      }
    })
    expect(doc).toBeDefined();
    const t = doc.getContainer('user');
    expect(t.resources.get('myprofile')).toBeDefined();
    expect(doc.getResource('user/myprofile')).toBeInstanceOf(Singleton);
  })

});
