/* eslint-disable no-console */
import { CustomerApplication } from './customer-application.js';

CustomerApplication.create()
  .then((app: CustomerApplication) => {
    app.express.listen(3001);
    console.log(`Server listening  http://localhost:${3001}`);
  })
  .catch(e => console.error(e));
