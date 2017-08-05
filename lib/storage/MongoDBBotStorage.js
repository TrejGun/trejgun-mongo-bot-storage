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

var Consts = {
  maxDataLength: 650000,
  Fields: {
    UserDataField: "userData",
    ConversationDataField: "conversationData",
    PrivateConversationDataField: "privateConversationData"
  },
  hash: "Hash",
  base64: "base64",
  ErrorCodes: {
    MessageSize: "EMSGSIZE",
    BadMessage: "EBADMSG"
  }
};

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

      var list = [];

      if (context.userId && context.persistUserData) {
        list.push({
          partitionKey: context.userId,
          rowKey: Consts.Fields.UserDataField,
          field: Consts.Fields.UserDataField
        });
      }

      if (context.userId && context.conversationId) {
        list.push({
          partitionKey: context.conversationId,
          rowKey: context.userId,
          field: Consts.Fields.PrivateConversationDataField
        });
      }

      if (context.persistConversationData && context.conversationId) {
        list.push({
          partitionKey: context.conversationId,
          rowKey: Consts.Fields.ConversationDataField,
          field: Consts.Fields.ConversationDataField
        });
      }

      var data = {};

      _async2.default.each(list, function (entry, errorCallback) {
        _this.storageClient.retrieve(entry.partitionKey, entry.rowKey, function (error, entity) {
          if (error) {
            errorCallback(error);
          } else {
            if (entity) {
              data[entry.field + Consts.hash] = JSON.stringify(entity.data);
              data[entry.field] = entity.data;
              errorCallback(null);
            } else {
              errorCallback(null);
            }
          }
        });
      }, function (error) {
        callback(error, data);
      });
    }
  }, {
    key: "saveData",
    value: function saveData(context, data) {
      var _this2 = this;

      var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Function;
      var list = [];

      function addWrite(field, partitionKey, rowKey, botData) {
        var hashKey = field + Consts.hash;
        var hash = JSON.stringify(botData);

        if (!data[hashKey] || data[hashKey] !== hash) {
          data[hashKey] = hash;
          list.push({
            field,
            partitionKey,
            rowKey,
            botData,
            hash
          });
        }
      }

      if (context.userId && context.persistUserData) {
        addWrite(Consts.Fields.UserDataField, context.userId, Consts.Fields.UserDataField, data.userData);
      }

      if (context.userId && context.conversationId) {
        addWrite(Consts.Fields.PrivateConversationDataField, context.conversationId, context.userId, data.privateConversationData);
      }

      if (context.persistConversationData && context.conversationId) {
        addWrite(Consts.Fields.ConversationDataField, context.conversationId, Consts.Fields.ConversationDataField, data.conversationData);
      }

      _async2.default.each(list, function (entry, errorCallback) {
        if (entry.hash.length > Consts.maxDataLength) {
          var error = new Error("Data of " + entry.hash.length + " bytes exceeds the " + Consts.maxDataLength + " byte limit. Consider setting connectors gzipData option. Can't post to: " + entry.url);
          error.code = Consts.ErrorCodes.MessageSize;
          errorCallback(error);
        } else {
          _this2.storageClient.insertOrReplace(entry.partitionKey, entry.rowKey, entry.botData, false, errorCallback);
        }
      }, callback);
    }
  }]);

  return MongoDbBotStorage;
}();

exports.default = MongoDbBotStorage;