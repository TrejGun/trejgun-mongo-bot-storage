"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongodb = _interopRequireDefault(require("mongodb"));

var _replace = _interopRequireDefault(require("../utils/replace"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class MongoDBStorageClient
/* implements IStorageClient */
{
  constructor(options) {
    _defineProperty(this, "options", {
      collectionName: "sessions"
    });

    Object.assign(this.options, options);
  }

  retrieve(partitionKey, rowKey, callback) {
    this.collection.findOne({
      partitionKey,
      rowKey
    }, (error, result) => callback(error, (0, _replace.default)(result, /@/g, ".")));
  }

  insertOrReplace(partitionKey, rowKey, data, callback) {
    this.collection.findOneAndUpdate({
      partitionKey,
      rowKey
    }, {
      partitionKey,
      rowKey,
      data: (0, _replace.default)(data, /\./g, "@")
    }, {
      upsert: true,
      multi: false
    }, callback);
  }

  initialize(callback) {
    const cb = this.handleNewConnection(callback);

    if (this.options.url) {
      // New native connection using url + mongoOptions
      _mongodb.default.connect(this.options.url, this.options.mongoOptions || {}, cb);
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
      this.options.dbPromise.then(db => cb(null, db)).catch(err => cb(err));
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

exports.default = MongoDBStorageClient;