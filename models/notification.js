const mongoose = require('mongoose');

let NotificationSchema = new mongoose.Schema({
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  isActive: { type: Boolean, default: true },
  date: Date
});

module.exports = mongoose.model('Notification', NotificationSchema);
