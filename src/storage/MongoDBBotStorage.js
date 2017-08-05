import async from "async";


const HASH = "HASH";
const FIELDS = {
	UserDataField: "userData",
	ConversationDataField: "conversationData",
	PrivateConversationDataField: "privateConversationData",
};


export default class MongoDbBotStorage /* implements IBotStorage */ {
	constructor(storageClient) {
		this.storageClient = storageClient;
	}

	getData(context, callback) {
		const list = [];

		if (context.userId && context.persistUserData) {
			list.push({
				partitionKey: context.userId,
				rowKey: FIELDS.UserDataField,
				field: FIELDS.UserDataField,
			});
		}
		if (context.userId && context.conversationId) {
			list.push({
				partitionKey: context.conversationId,
				rowKey: context.userId,
				field: FIELDS.PrivateConversationDataField,
			});
		}
		if (context.persistConversationData && context.conversationId) {
			list.push({
				partitionKey: context.conversationId,
				rowKey: FIELDS.ConversationDataField,
				field: FIELDS.ConversationDataField,
			});
		}

		const data = {};
		async.each(list, (entry, errorCallback) => {
			this.storageClient.retrieve(entry.partitionKey, entry.rowKey, (error, entity) => {
				if (error) {
					errorCallback(error);
				} else if (entity) {
					data[entry.field + HASH] = JSON.stringify(entity.data);
					data[entry.field] = entity.data;
					errorCallback(null);
				} else {
					errorCallback(null);
				}
			});
		}, error => {
			callback(error, data);
		});
	}

	saveData(context, data, callback = Function) {
		const list = [];

		function addWrite(field, partitionKey, rowKey, botData) {
			const hashKey = field + HASH;
			const hash = JSON.stringify(botData);
			if (!data[hashKey] || data[hashKey] !== hash) {
				Object.assign(data, {[hashKey]: hash});
				list.push({field, partitionKey, rowKey, botData, hash});
			}
		}

		if (context.userId && context.persistUserData) {
			addWrite(FIELDS.UserDataField, context.userId, FIELDS.UserDataField, data.userData);
		}
		if (context.userId && context.conversationId) {
			addWrite(FIELDS.PrivateConversationDataField, context.conversationId, context.userId, data.privateConversationData);
		}
		if (context.persistConversationData && context.conversationId) {
			addWrite(FIELDS.ConversationDataField, context.conversationId, FIELDS.ConversationDataField, data.conversationData);
		}

		async.each(list, (entry, errorCallback) => {
			this.storageClient.insertOrReplace(entry.partitionKey, entry.rowKey, entry.botData, false, errorCallback);
		}, callback);
	}
}
