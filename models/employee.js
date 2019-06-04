const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

let EmployeeSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  userRole: String,
  username: {type: String, unique: true, required: true},
  address: {
    postalCode: String,
    city: String,
    addressLine: String
  },
  phoneNumber: String,
  email: {type: String, unique: true, required: true},
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  laborHours: [
    {
      date: Date,
      hoursWorked: Number
    }
  ]
});

EmployeeSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('Employee', EmployeeSchema);
