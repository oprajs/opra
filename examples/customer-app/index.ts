/* eslint-disable no-console */
import '@sqb/postgres';
import { app } from './app.js';

app.init().catch(e => console.error(e));
