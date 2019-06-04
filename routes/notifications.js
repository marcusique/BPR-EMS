const express = require('express'),
  router = express.Router({ mergeParams: true }),
  Task = require('../models/task'),
  Notificaion = require('../models/notification'),
  middleware = require('../middleware/index');

/* Get all active notifications */
router.get(
  '/',
  middleware.isLoggedIn,
  middleware.checkTaskAuthorization,
  (req, res) => {
    Notificaion.find({ isActive: true })
      .populate('applicant')
      .populate('task')
      .populate({
        path: 'task',
        populate: {
          path: 'enrolledStaff',
          model: 'Employee'
        }
      })
      .exec((err, result) => {
        if (err) {
          req.flash('error', 'Error. Please try again');
          res.redirect('back');
        } else {
          res.render('tasks/notifications', { notifications: result });
        }
      });
  }
);

/* Approve incoming notification */
router.put(
  '/:id/approve',
  middleware.isLoggedIn,
  middleware.checkTaskAuthorization,
  (req, res) => {
    Task.findByIdAndUpdate(req.body.taskId, req.body, (err, foundTask) => {
      if (err) {
        req.flash('error', 'Error. Please try again');
        res.redirect('back');
        console.log(err);
      } else {
        if (
          !foundTask.enrolledStaff.some(applicant =>
            applicant._id.equals(req.body.applicantId)
          )
        ) {
          foundTask.enrolledStaff.push(req.body.applicantId);
          foundTask.save();
          Notificaion.findByIdAndUpdate(
            req.params.id,
            req.body,
            (err, foundNotificaion) => {
              if (err) {
                req.flash('error', 'Error. Please try again');
                res.redirect('back');
              } else {
                foundNotificaion.isActive = false;
                foundNotificaion.save();
              }
            }
          );
          req.flash('success', 'Task updated');
          res.redirect('back');
        } else {
          req.flash('error', 'User already enrolled');
          res.redirect('back');
        }
      }
    });
  }
);

/* Decline incoming notification */
router.put('/:id/decline', (req, res) => {
  Notificaion.findByIdAndUpdate(
    req.params.id,
    req.body,
    (err, foundNotificaion) => {
      if (err) {
        req.flash('error', 'Error. Please try again');
        res.redirect('back');
      } else {
        foundNotificaion.isActive = false;
        foundNotificaion.save();
        req.flash('success', 'Application declined');
        res.redirect('back');
      }
    }
  );
});

module.exports = router;
