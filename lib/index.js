"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MongoDBStorageClient = exports.MongoDbBotStorage = undefined;

var _MongoDBBotStorage = require("./storage/MongoDBBotStorage");

var _MongoDBBotStorage2 = _interopRequireDefault(_MongoDBBotStorage);

var _MongoDBStorageClient = require("./storage/MongoDBStorageClient");

var _MongoDBStorageClient2 = _interopRequireDefault(_MongoDBStorageClient);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.MongoDbBotStorage = _MongoDBBotStorage2.default;
exports.MongoDBStorageClient = _MongoDBStorageClient2.default;