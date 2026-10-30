import mongoose from "mongoose";
export const OwlTypes={ObjectId:mongoose.Schema.Types.ObjectId,Decimal128:mongoose.Schema.Types.Decimal128};
export const OwlIsValidId=mongoose.isValidObjectId;
export const OwlTransaction=async<T>(callback:(session:import("mongoose").ClientSession)=>Promise<T>,options?:Parameters<typeof mongoose.connection.transaction>[1]):Promise<T>=>mongoose.connection.transaction(callback,options);
export const OwlMongoStatus=()=>mongoose.connection.readyState;
export const OwlMongoCommand=async(command:Record<string,unknown>,options:Record<string,unknown>={},admin=false)=>{
 if(!mongoose.connection.db)throw new Error("MongoDB is not connected.");
 return admin ? mongoose.connection.db.admin().command(command,options) : mongoose.connection.db.command(command,options);
};
export const OwlCollection=(name:string)=>{
 if(!mongoose.connection.db)throw new Error("MongoDB is not connected.");
 return mongoose.connection.db.collection(name);
};
export const OwlMongoClient=mongoose.mongo.MongoClient;

export const OwlObjectId=mongoose.Types.ObjectId;
export const OwlDatabase=()=>{if(!mongoose.connection.db)throw new Error("MongoDB is not connected.");return mongoose.connection.db;};
export const OwlAdminCommand=(command:Record<string,unknown>,options:Record<string,unknown>={})=>OwlMongoCommand(command,options,true);
