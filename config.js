'use strict';

exports.DATABASE_URL =
  process.env.DATABASE_URL || 'mongodb://localhost/baseServerDb';
exports.TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL || 'mongodb://localhost/test-baseServerDb';
exports.PORT = process.env.PORT || 5000;
