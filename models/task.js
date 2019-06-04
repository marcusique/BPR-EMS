const mongoose = require('mongoose');

let TaskSchema = new mongoose.Schema({
  name: String,
  assignedToClient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  address: {
    postalCode: String,
    city: String,
    addressLine: String
  },
  date: Date,
  time: String,
  laborHours: Number,
  requiredStaff: Number,
  enrolledStaff: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    }
  ],
  notes: String,
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ]
});

module.exports = mongoose.model('Task', TaskSchema);
