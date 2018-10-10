'use strict';

const mongoose = require('mongoose');

const baseSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    comment: {
      type: String,
      required: true
    }
  },
  { collection: 'baseData' }
);

const Base = mongoose.model('baseModel', baseSchema);
module.exports = { Base };
