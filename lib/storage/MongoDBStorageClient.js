"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _replace = require("../utils/replace");

var _replace2 = _interopRequireDefault(_replace);

var _session = require("../models/session");

var _session2 = _interopRequireDefault(_session);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MongoDBStorageClient
/* implements IStorageClient */
= function () {
  function MongoDBStorageClient() {
    var connection = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _mongoose2.default;

    _classCallCheck(this, MongoDBStorageClient);

    this.model = connection.model("session", _session2.default);
  }

  _createClass(MongoDBStorageClient, [{
    key: "retrieve",
    value: function retrieve(partitionKey, rowKey, callback) {
      this.model.findOne({
        partitionKey,
        rowKey
      }).lean().then(function (entity) {
        return callback(null, (0, _replace2.default)(entity, /@/g, "."));
      }).catch(function (error) {
        return callback(error, null);
      });
    }
  }, {
    key: "insertOrReplace",
    value: function insertOrReplace(partitionKey, rowKey, data, isCompressed, callback) {
      this.model.findOneAndUpdate({
        partitionKey,
        rowKey
      }, {
        data: (0, _replace2.default)(data, /\./g, "@"),
        isCompressed
      }, {
        upsert: true,
        multi: false
      }).then(function () {
        return callback(null, null);
      }).catch(function (error) {
        return callback(error, null);
      });
    }
  }]);

  return MongoDBStorageClient;
}();

exports.default = MongoDBStorageClient;