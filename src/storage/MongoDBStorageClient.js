import MongoClient from "mongodb";
import replace from "../utils/replace";


export default class MongoDBStorageClient /* implements IStorageClient */ {
	options = {
		collectionName: "sessions"
	};

	constructor(options) {
		Object.assign(this.options, options);
	}

	retrieve(partitionKey, rowKey, callback) {
		this.collection.findOne({partitionKey, rowKey}, (error, result) => callback(error, replace(result, /@/g, ".")));
	}

	insertOrReplace(partitionKey, rowKey, data, callback) {
		this.collection.findOneAndUpdate({partitionKey, rowKey}, {partitionKey, rowKey, data: replace(data, /\./g, "@")}, {upsert: true, multi: false}, callback);
	}

	initialize(callback) {
		const cb = this.handleNewConnection(callback);
		if (this.options.url) {
			// New native connection using url + mongoOptions
			MongoClient.connect(this.options.url, this.options.mongoOptions || {}, cb);
		} else if (this.options.mongooseConnection) {
			// Re-use existing or upcoming mongoose connection
			if (this.options.mongooseConnection.readyState === 1) {
				cb(null, this.options.mongooseConnection.db);
			} else {
				this.options.mongooseConnection.once("open", () => cb(null, this.options.mongooseConnection.db));
			}
		} else if (this.options.db && this.options.db.listCollections) {
			// Re-use existing or upcoming native connection
			if (this.options.db.openCalled || this.options.db.openCalled === void 0) {
				cb(null, this.options.db);
			} else {
				this.options.db.open(cb);
			}
		} else if (this.options.dbPromise) {
			this.options.dbPromise
				.then(db => cb(null, db))
				.catch(err => cb(err));
		} else {
			throw new Error("Connection strategy not found");
		}
	}

	handleNewConnection(callback) {
		return (error, db) => {
			if (!error) {
				this.collection = db.collection(this.options.collectionName);
			}
			callback(error, db);
		};
	}
}
