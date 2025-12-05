import { ChatApp } from './app.js';

const app = new ChatApp();
app
  .start()
  .then(() => {
    const { server } = app.adapter;
    const address = server.httpServer.address();
    if (!address) throw new Error('No address');
    const addressStr =
      typeof address === 'string' ? address : `localhost:${address.port}`;
    console.log(
      `SocketIO server listening on wss://${addressStr + `${server.path()}`}`,
    );
  })
  .catch(e => console.error(e));
