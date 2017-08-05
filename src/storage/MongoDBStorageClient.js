import mongoose from "mongoose";
import replace from "../utils/replace";
import sessionModel from "../models/session";


export default class MongoDBStorageClient /* implements IStorageClient */ {
	constructor(connection = mongoose) {
		this.model = connection.model("session", sessionModel);
	}

	retrieve(partitionKey, rowKey, callback) {
		this.model.findOne({partitionKey, rowKey}).lean()
			.then(entity => callback(null, replace(entity, /@/g, ".")))
			.catch(error => callback(error, null));
	}

	insertOrReplace(partitionKey, rowKey, data, isCompressed, callback) {
		this.model.findOneAndUpdate({partitionKey, rowKey}, {data: replace(data, /\./g, "@"), isCompressed}, {upsert: true, multi: false})
			.then(() => callback(null, null))
			.catch(error => callback(error, null));
	}
}
