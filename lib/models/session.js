"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require("mongoose");

exports.default = new _mongoose.Schema({
  partitionKey: String,
  rowKey: String,
  data: _mongoose.Schema.Types.Mixed
});