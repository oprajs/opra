import { Client } from '@elastic/elasticsearch';
import type { Country, Customer } from './models/index.js';

export async function initDatabase(options: {
  host?: string;
  database?: string;
  recreate?: boolean;
  customers?: Customer[];
  countries?: Country[];
}) {
  const host = process.env.ELASTIC_HOST || 'http://localhost:9200';
  const { customers, countries } = options;
  const client = new Client({ node: host });
  try {
    const countriesExists = await client.indices.exists({ index: 'countries' });
    const customersExists = await client.indices.exists({ index: 'customers' });
    if (countries && (options?.recreate || !countriesExists)) {
      if (countriesExists) await client.indices.delete({ index: 'countries' });
      await client.indices.create({
        index: 'countries',
        mappings: {
          properties: {
            name: { type: 'wildcard' },
          },
        },
      });
      let row: any;
      for (row of countries) {
        await client.create({
          index: 'countries',
          id: String(row.code),
          document: row,
        });
      }
    }
    if (customers && (options?.recreate || !customersExists)) {
      if (customersExists) await client.indices.delete({ index: 'customers' });
      await client.indices.create({
        index: 'customers',
        mappings: {
          properties: {
            givenName: { type: 'wildcard' },
          },
        },
      });
      let row: any;
      for (row of customers) {
        await client.create({
          index: 'customers',
          id: String(row.id),
          document: row,
        });
      }
    }
  } finally {
    await client.close();
  }
}
