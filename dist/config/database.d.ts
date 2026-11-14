import { default as mongoose } from 'mongoose';
export declare const OwlTypes: {
    ObjectId: typeof mongoose.Schema.Types.ObjectId;
    Decimal128: typeof mongoose.Schema.Types.Decimal128;
};
export declare const OwlIsValidId: typeof mongoose.isValidObjectId;
export declare const OwlTransaction: <T>(callback: (session: import('mongoose').ClientSession) => Promise<T>, options?: Parameters<typeof mongoose.connection.transaction>[1]) => Promise<T>;
export declare const OwlMongoStatus: () => mongoose.ConnectionStates;
export declare const OwlMongoCommand: (command: Record<string, unknown>, options?: Record<string, unknown>, admin?: boolean) => Promise<mongoose.mongo.BSON.Document>;
export declare const OwlCollection: (name: string) => mongoose.mongo.Collection<mongoose.mongo.BSON.Document>;
export declare const OwlMongoClient: typeof mongoose.mongo.MongoClient;
export declare const OwlObjectId: typeof mongoose.Types.ObjectId;
export declare const OwlDatabase: () => mongoose.mongo.Db;
export declare const OwlAdminCommand: (command: Record<string, unknown>, options?: Record<string, unknown>) => Promise<mongoose.mongo.BSON.Document>;
