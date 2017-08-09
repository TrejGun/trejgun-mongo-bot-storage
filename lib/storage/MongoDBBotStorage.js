"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _async = require("async");

var _async2 = _interopRequireDefault(_async);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HASH = "HASH";
var FIELDS = {
  UserDataField: "userData",
  ConversationDataField: "conversationData",
  PrivateConversationDataField: "privateConversationData"
};

function addWrite(list, data, field, partitionKey, rowKey, botData) {
  var hashKey = field + HASH;
  var hash = JSON.stringify(botData);

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

var MongoDbBotStorage
/* implements IBotStorage */
= function () {
  function MongoDbBotStorage(storageClient) {
    _classCallCheck(this, MongoDbBotStorage);

    this.storageClient = storageClient;
  }

  _createClass(MongoDbBotStorage, [{
    key: "getData",
    value: function getData(context, callback) {
      var _this = this;

      this.initializeStorageClient().then(function () {
        var list = [];

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

        var data = {};

        _async2.default.each(list, function (entry, errorCallback) {
          _this.storageClient.retrieve(entry.partitionKey, entry.rowKey, function (error, entity) {
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
        }, function (error) {
          callback(error, data);
        });
      }).catch(callback);
    }
  }, {
    key: "saveData",
    value: function saveData(context, data) {
      var _this2 = this;

      var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Function;
      this.initializeStorageClient().then(function () {
        var list = [];

        if (context.userId && context.persistUserData) {
          addWrite(list, data, FIELDS.UserDataField, context.userId, FIELDS.UserDataField, data.userData);
        }

        if (context.userId && context.conversationId) {
          addWrite(list, data, FIELDS.PrivateConversationDataField, context.conversationId, context.userId, data.privateConversationData);
        }

        if (context.persistConversationData && context.conversationId) {
          addWrite(list, data, FIELDS.ConversationDataField, context.conversationId, FIELDS.ConversationDataField, data.conversationData);
        }

        _async2.default.each(list, function (entry, errorCallback) {
          _this2.storageClient.insertOrReplace(entry.partitionKey, entry.rowKey, entry.botData, errorCallback);
        }, callback);
      }).catch(callback);
    }
  }, {
    key: "initializeStorageClient",
    value: function initializeStorageClient() {
      var _this3 = this;

      if (!this.initializeTableClientPromise) {
        this.initializeTableClientPromise = new Promise(function (resolve, reject) {
          _this3.storageClient.initialize(function (error, db) {
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
  }]);

  return MongoDbBotStorage;
}();

exports.default = MongoDbBotStorage;