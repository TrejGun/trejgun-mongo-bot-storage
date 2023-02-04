"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MongoDbBotStorage = void 0;
var _async = _interopRequireDefault(require("async"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const HASH = "HASH";
const FIELDS = {
  UserDataField: "userData",
  ConversationDataField: "conversationData",
  PrivateConversationDataField: "privateConversationData"
};
function addWrite(list, data, field, partitionKey, rowKey, botData) {
  const hashKey = field + HASH;
  const hash = JSON.stringify(botData);
  if (!data[hashKey] || data[hashKey] !== hash) {
    Object.assign(data, {
      [hashKey]: hash
    });
    list.push({
      field,
      partitionKey,
      rowKey,
      botData,
      hash
    });
  }
}
class MongoDbBotStorage /* implements IBotStorage */ {
  constructor(storageClient) {
    this.storageClient = storageClient;
  }
  getData(context, callback) {
    this.initializeStorageClient().then(() => {
      const list = [];
      if (context.userId && context.persistUserData) {
        list.push({
          partitionKey: context.userId,
          rowKey: FIELDS.UserDataField,
          field: FIELDS.UserDataField
        });
      }
      if (context.userId && context.conversationId) {
        list.push({
          partitionKey: context.conversationId,
          rowKey: context.userId,
          field: FIELDS.PrivateConversationDataField
        });
      }
      if (context.persistConversationData && context.conversationId) {
        list.push({
          partitionKey: context.conversationId,
          rowKey: FIELDS.ConversationDataField,
          field: FIELDS.ConversationDataField
        });
      }
      const data = {};
      _async.default.each(list, (entry, errorCallback) => {
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
    }).catch(callback);
  }
  saveData(context, data, callback = Function) {
    this.initializeStorageClient().then(() => {
      const list = [];
      if (context.userId && context.persistUserData) {
        addWrite(list, data, FIELDS.UserDataField, context.userId, FIELDS.UserDataField, data.userData);
      }
      if (context.userId && context.conversationId) {
        addWrite(list, data, FIELDS.PrivateConversationDataField, context.conversationId, context.userId, data.privateConversationData);
      }
      if (context.persistConversationData && context.conversationId) {
        addWrite(list, data, FIELDS.ConversationDataField, context.conversationId, FIELDS.ConversationDataField, data.conversationData);
      }
      _async.default.each(list, (entry, errorCallback) => {
        this.storageClient.insertOrReplace(entry.partitionKey, entry.rowKey, entry.botData, errorCallback);
      }, callback);
    }).catch(callback);
  }
  initializeStorageClient() {
    if (!this.initializeTableClientPromise) {
      this.initializeTableClientPromise = new Promise((resolve, reject) => {
        this.storageClient.initialize((error, db) => {
          if (error) {
            reject(new Error(`Failed to initialize MongoDB client. Error: ${error.toString()}`));
          } else {
            resolve(db);
          }
        });
      });
    }
    return this.initializeTableClientPromise;
  }
}
exports.MongoDbBotStorage = MongoDbBotStorage;