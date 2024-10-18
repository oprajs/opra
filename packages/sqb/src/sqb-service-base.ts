import { ServiceBase } from '@opra/core';
import { SqbClient, SqbConnection } from '@sqb/connect';

const transactionKey = Symbol.for('transaction');

/**
 * @namespace SqbServiceBase
 */
export namespace SqbServiceBase {
  export interface Options {
    db?: SqbServiceBase['db'];
  }
}

/**
 * @class SqbServiceBase
 * @template T - The data type class type of the resource
 */
export class SqbServiceBase extends ServiceBase {
  /**
   * Represents a SqbClient or SqbConnection object
   */
  db?: (SqbClient | SqbConnection) | ((_this: this) => SqbClient | SqbConnection);

  /**
   * Constructs a new instance
   *
   * @param [options] - The options for the service.
   * @constructor
   */
  constructor(options?: SqbServiceBase.Options) {
    super();
    this.db = options?.db;
  }

  /**
   * Executes the provided function within a transaction.
   *
   * @param callback - The function to be executed within the transaction.
   */
  async withTransaction(callback: (connection: SqbConnection, _this: this) => any): Promise<any> {
    const ctx = this.context;
    let closeSessionOnFinish = false;

    let connection: SqbConnection | undefined = ctx[transactionKey];
    if (!connection) {
      /** Determine the SqbClient or SqbConnection instance */
      const db = await this.getConnection();
      if (db instanceof SqbConnection) {
        connection = db;
      } else {
        /** Acquire a connection. New connection should be at the end */
        connection = await db.acquire({ autoCommit: false });
        closeSessionOnFinish = true;
      }
      /** Store transaction connection in current context */
      ctx[transactionKey] = connection;
    }

    const oldInTransaction = connection.inTransaction;
    connection.retain();
    try {
      if (!oldInTransaction) await connection.startTransaction();
      const out = await callback(connection, this);
      if (!oldInTransaction && connection.inTransaction) await connection.commit();
      return out;
    } catch (e) {
      if (!oldInTransaction && connection.inTransaction) await connection.rollback();
      throw e;
    } finally {
      delete ctx[transactionKey];
      /** Release connection */
      if (closeSessionOnFinish) {
        await connection.close();
      } else connection.release();
    }
  }

  /**
   * Retrieves the database connection.
   *
   * @protected
   *
   * @throws {Error} If the context or database is not set.
   */
  getConnection(): SqbConnection | SqbClient | Promise<SqbConnection | SqbClient> {
    const ctx = this.context;
    let db = ctx[transactionKey];
    if (db) return db;
    db = typeof this.db === 'function' ? this.db(this) : this.db;
    if (db) return db;
    throw new Error(`Database not set!`);
  }
}
