import { Global, Module, OnApplicationShutdown } from '@nestjs/common';
import { OnApplicationBootstrap } from '@nestjs/common/interfaces/hooks/on-application-bootstrap.interface';
import { Db, MongoClient } from 'mongodb';

@Global()
@Module({
  providers: [
    {
      provide: MongoClient,
      inject: [],
      useFactory: async (): Promise<MongoClient> => {
        const host = process.env.MONGO_HOST || 'mongodb://127.0.0.1:27017/?directConnection=true';
        try {
          const client = new MongoClient(host);
          await client.connect();
          return client;
        } catch (e: any) {
          e.message = 'Unable to connect to MongoDB database. ' + e.message;
          throw e;
        }
      },
    },
    {
      provide: Db,
      inject: [MongoClient],
      useFactory: async (client: MongoClient): Promise<Db> => client.db(process.env.MONGO_DATABASE || 'customer_app'),
    },
  ],
  exports: [MongoClient, Db],
})
export class AppDbModule implements OnApplicationShutdown, OnApplicationBootstrap {
  constructor(protected dbClient: MongoClient) {}

  onApplicationBootstrap() {
    return this.dbClient.connect();
  }

  onApplicationShutdown() {
    return this.dbClient.close(true);
  }
}
