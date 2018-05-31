const mongoose = require('mongoose');

var keepSchema = new mongoose.Schema({
  owner_id: { type: String, unique: true, required: true },
  name: String,
  allNames: [String],
  peaceshield: Boolean,
  sop: Boolean,
  allegiance: String,
  allAllegiances: [String],
  level: Number,
  location: {
    x: Number,
    y: Number
  },
  power: Number
});

module.exports = exports = mongoose.model('Keep', keepSchema);
