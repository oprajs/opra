import {JsonEntityProvider} from '../../src/api/services/json-entity-provider.js';
import * as customers from './_support/customer.dto.js';
import {ProviderResolver} from '../../src/api/provider-resolver.js';

describe('CrudService/JsonCrudService', function () {

  it('Should construct', async () => {
    const reg = new ProviderResolver();

    const CustomerService = class extends JsonEntityProvider {
      data = customers.data;
      keyProperty = 'id';
    }

    const service = new JsonEntityProvider(customers.data, customers.keyProperty);
    expect(service).toBeInstanceOf(JsonEntityProvider);
    expect(service.data).toBe(customers.data);
    expect(service.keyProperty).toStrictEqual(customers.keyProperty);
    expect(service.propertyNames).toStrictEqual(["id", "givenName", "familyName", "gender",
      "birthDate", "city", "countryCode", "active", "vip", "addressCity", "addressStreet", "zipCode"]);
  })

  it('Should construct', async () => {
    const service = new JsonEntityProvider(customers.data, customers.keyProperty);
    expect(service).toBeInstanceOf(JsonEntityProvider);
    expect(service.data).toBe(customers.data);
    expect(service.keyProperty).toStrictEqual(customers.keyProperty);
    expect(service.propertyNames).toStrictEqual(["id", "givenName", "familyName", "gender",
      "birthDate", "city", "countryCode", "active", "vip", "addressCity", "addressStreet", "zipCode"]);
  })

});
