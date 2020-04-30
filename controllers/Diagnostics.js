'use strict';

var url = require('url');


var Diagnostics = require('./DiagnosticsService');


module.exports.getExample = function getExample (req, res, next) {
  Diagnostics.getExample(req.swagger.params, res, next);
};

module.exports.postExample = function postExample (req, res, next) {
  Diagnostics.postExample(req.swagger.params, res, next);
};
