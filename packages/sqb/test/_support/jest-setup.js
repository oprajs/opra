import {Connection} from 'postgresql-client';
import './env.js';

export default async function globalSetup() {
  const connection = new Connection();
  await connection.connect();
  try {
    await connection.execute('DROP SCHEMA IF EXISTS ' + process.env.DB_SCHEMA +
        ' CASCADE');
  } finally {
    await connection.close(0);
  }
}
