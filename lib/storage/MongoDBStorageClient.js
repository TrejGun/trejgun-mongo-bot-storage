"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mongodb = require("mongodb");

var _mongodb2 = _interopRequireDefault(_mongodb);

var _replace = require("../utils/replace");

var _replace2 = _interopRequireDefault(_replace);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MongoDBStorageClient
/* implements IStorageClient */
= function () {
  function MongoDBStorageClient(options) {
    _classCallCheck(this, MongoDBStorageClient);

    this.options = {
      collectionName: "sessions"
    };
    Object.assign(this.options, options);
  }

  _createClass(MongoDBStorageClient, [{
    key: "retrieve",
    value: function retrieve(partitionKey, rowKey, callback) {
      this.collection.findOne({
        partitionKey,
        rowKey
      }, function (error, result) {
        return callback(error, (0, _replace2.default)(result, /@/g, "."));
      });
    }
  }, {
    key: "insertOrReplace",
    value: function insertOrReplace(partitionKey, rowKey, data, callback) {
      this.collection.findOneAndUpdate({
        partitionKey,
        rowKey
      }, {
        partitionKey,
        rowKey,
        data: (0, _replace2.default)(data, /\./g, "@")
      }, {
        upsert: true,
        multi: false
      }, callback);
    }
  }, {
    key: "initialize",
    value: function initialize(callback) {
      var _this = this;

      var cb = this.handleNewConnection(callback);

      if (this.options.url) {
        // New native connection using url + mongoOptions
        _mongodb2.default.connect(this.options.url, this.options.mongoOptions || {}, cb);
      } else if (this.options.mongooseConnection) {
        // Re-use existing or upcoming mongoose connection
        if (this.options.mongooseConnection.readyState === 1) {
          cb(null, this.options.mongooseConnection.db);
        } else {
          this.options.mongooseConnection.once("open", function () {
            return cb(null, _this.options.mongooseConnection.db);
          });
        }
      } else if (this.options.db && this.options.db.listCollections) {
        // Re-use existing or upcoming native connection
        if (this.options.db.openCalled || this.options.db.openCalled === void 0) {
          cb(null, this.options.db);
        } else {
          this.options.db.open(cb);
        }
      } else if (this.options.dbPromise) {
        this.options.dbPromise.then(function (db) {
          return cb(null, db);
        }).catch(function (err) {
          return cb(err);
        });
      } else {
        throw new Error("Connection strategy not found");
      }
    }
  }, {
    key: "handleNewConnection",
    value: function handleNewConnection(callback) {
      var _this2 = this;

      return function (error, db) {
        if (!error) {
          _this2.collection = db.collection(_this2.options.collectionName);
        }

        callback(error, db);
      };
    }
  }]);

  return MongoDBStorageClient;
}();

exports.default = MongoDBStorageClient;