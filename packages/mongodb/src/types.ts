import { ClientSession, ObjectId } from 'mongodb';

export type AnyId = string | number | ObjectId;

export type WithTransactionCallback = (session: ClientSession) => any;
