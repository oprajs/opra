/* eslint-disable import/extensions */
import { MongoClient } from 'mongodb';
import { countriesData } from './countries.data';
import { customersData } from './customers.data';

export async function initMongodb() {
  const dbname = process.env.MONGO_DATABASE || 'opra_test';
  const client = new MongoClient(process.env.MONGO_HOST || 'mongodb://localhost:27017');
  await client.connect();
  try {
    const db = client.db(dbname);
    await db.dropDatabase();
    await db.collection('Countries').insertMany(countriesData.map(x => ({...x})));
    await db.collection<any>('Customers').insertMany(customersData.map(x => ({...x})));
    await db.collection<any>('BestCustomer').insertOne({...customersData[0]});
  } finally {
    await client.close();
  }
}
