const mongoose = require('mongoose');

let ClientSchema = new mongoose.Schema({
  name: String,
  address: {
    postalCode: String,
    city: String,
    addressLine: String
  },
  email: String,
  phoneNumber: String
});

module.exports = mongoose.model('Client', ClientSchema);
