import { MongoClient } from 'mongodb';
import type { Country, Customer } from './models/index.js';

export async function initDatabase(options: {
  host?: string;
  database?: string;
  customers?: Customer[];
  countries?: Country[];
}) {
  const dbname = process.env.MONGO_DATABASE || 'customer_app';
  const host = process.env.MONGO_HOST || 'mongodb://127.0.0.1:27017/?directConnection=true';
  const { customers, countries } = options;
  const client = new MongoClient(host);
  await client.connect();
  try {
    const db = client.db(dbname);
    await db.dropDatabase();
    if (countries) await db.collection('Countries').insertMany(countries.map(x => ({ ...x })));
    if (customers) {
      await db.collection<any>('Customers').insertMany(customers.map(x => ({ ...x })));
      await db.collection<any>('BestCustomer').insertOne({ ...customers[0] });
    }
  } finally {
    await client.close();
  }
}
