"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "MongoDbBotStorage", {
  enumerable: true,
  get: function () {
    return _MongoDBBotStorage.default;
  }
});
Object.defineProperty(exports, "MongoDBStorageClient", {
  enumerable: true,
  get: function () {
    return _MongoDBStorageClient.default;
  }
});

var _MongoDBBotStorage = _interopRequireDefault(require("./storage/MongoDBBotStorage"));

var _MongoDBStorageClient = _interopRequireDefault(require("./storage/MongoDBStorageClient"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }