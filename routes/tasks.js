const express = require('express'),
  router = express.Router({ mergeParams: true }),
  { check, validationResult } = require('express-validator/check'),
  Task = require('../models/task'),
  Employee = require('../models/employee'),
  Client = require('../models/client'),
  Notification = require('../models/notification'),
  middleware = require('../middleware/index');

/* Get the list of tasks*/
router.get(
  '/',
  middleware.isLoggedIn,
  middleware.checkTaskAuthorization,
  (req, res) => {
    Task.find()
      .populate('enrolledStaff')
      .populate('assignedToClient')
      .exec((err, result) => {
        if (err) {
          req.flash('error', 'Error. Please try again');
          res.redirect('back');
        } else {
          res.render('tasks/index', { tasks: result });
        }
      });
  }
);

/* Get the New Task form*/
router.get(
  '/new',
  middleware.isLoggedIn,
  middleware.checkTaskAuthorization,
  (req, res) => {
    Employee.find({}, (err, allEmployees) => {
      if (err) {
        req.flash('error', 'Error. Please try again');
        res.redirect('back');
      } else {
        Client.find({}, (err, allClients) => {
          if (err) {
            req.flash('error', 'Error. Please try again');
            res.redirect('back');
          } else {
            res.render('tasks/new', {
              employees: allEmployees,
              clients: allClients
            });
          }
        });
      }
    });
  }
);

/* Get the Labor Hours form*/
router.get(
  '/:id/laborhours',
  middleware.isLoggedIn,
  middleware.checkTaskAuthorization,
  (req, res) => {
    //To grab the list of all employees and pass them to the page
    Task.findById(req.params.id)
      .populate('enrolledStaff')
      .exec((err, foundTask) => {
        if (err) {
          req.flash('error', 'Error. Please try again');
          res.redirect('back');
        } else {
          res.render('tasks/laborHours', { task: foundTask });
        }
      });
  }
);

/* Get task detail on Calendar page */
router.get('/:id', middleware.isLoggedIn, (req, res) => {
  Task.findById(req.params.id)
    .populate('enrolledStaff')
    .populate('comments')
    .populate('assignedToClient')
    .exec((err, foundTask) => {
      if (err) {
        req.flash('error', 'Error. Please try again');
        res.redirect('back');
      } else {
        Task.find({}, (err, allTasks) => {
          if (err) {
            req.flash('error', 'Error. Please try again');
            res.redirect('back');
          } else {
            Notification.find(
              { task: req.params.id },
              (err, allApplications) => {
                if (err) {
                  req.flash('error', 'Error. Please try again');
                  res.redirect('back');
                } else {
                  res.render('calendar', {
                    task: foundTask,
                    tasks: allTasks,
                    applications: allApplications
                  });
                }
              }
            );
          }
        });
      }
    });
});

/* Create a task */
router.post(
  '/new',
  middleware.isLoggedIn,
  middleware.checkTaskAuthorization,
  [
    check('postalCode')
      .isNumeric()
      .withMessage('Postal code must contain digits only'),
    check('laborHours')
      .isNumeric()
      .withMessage('Please enter a valid number of labor hours')
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      errors.array().forEach(e => {
        req.flash('error', ' ' + e.msg);
      });
      res.redirect('back');
    } else {
      Task.create({
        name: req.body.name,
        address: {
          postalCode: req.body.postalCode,
          city: req.body.city,
          addressLine: req.body.addressLine
        },
        date: req.body.date,
        time: req.body.time,
        laborHours: req.body.laborHours,
        requiredStaff: req.body.requiredStaff,
        enrolledStaff: req.body.enrolledStaff,
        assignedToClient: req.body.assignedToClient,
        notes: req.body.notes
      });
      req.flash('success', 'Task has been created (' + req.body.name + ')');
      res.redirect('/tasks');
    }
  }
);

/* Render edit form for a found task */
router.get(
  '/:id/edit',
  middleware.isLoggedIn,
  middleware.checkTaskAuthorization,
  (req, res) => {
    Task.findById(req.params.id)
      .populate('enrolledStaff')
      .exec((err, foundTask) => {
        if (err) {
          req.flash('error', 'Error. Please try again');
          res.redirect('back');
        } else {
          Employee.find({}, (err, allEmployees) => {
            if (err) {
              req.flash('error', 'Error. Please try again');
              res.redirect('back');
            } else {
              Client.find({}, (err, allClients) => {
                if (err) {
                  req.flash('error', 'Error. Please try again');
                  res.redirect('back');
                } else {
                  res.render('tasks/edit', {
                    employees: allEmployees,
                    task: foundTask,
                    clients: allClients
                  });
                }
              });
            }
          });
        }
      });
  }
);

/* Update task information */
router.put(
  '/:id',
  middleware.isLoggedIn,
  middleware.checkTaskAuthorization,
  (req, res) => {
    Task.findByIdAndUpdate(req.params.id, req.body.task, (err, updatedTask) => {
      if (err) {
        req.flash('error', 'Error. Please try again');
        res.redirect('back');
        console.log(err);
      } else {
        if (!req.body.task.enrolledStaff && req.body.task.assignedToClient) {
          updatedTask.enrolledStaff = [];
          updatedTask.save();
          req.flash('success', 'Task updated');
          res.redirect('/tasks');
        } else if (
          req.body.task.enrolledStaff &&
          !req.body.task.assignedToClient
        ) {
          updatedTask.assignedToClient = null;
          updatedTask.save();
          req.flash('success', 'Task updated');
          res.redirect('/tasks');
        } else if (
          !req.body.task.enrolledStaff &&
          !req.body.task.assignedToClient
        ) {
          updatedTask.enrolledStaff = [];
          updatedTask.assignedToClient = null;
          updatedTask.save();
          req.flash('success', 'Task updated');
          res.redirect('/tasks');
        } else {
          req.flash('success', 'Task updated');
          res.redirect('/tasks');
        }
      }
    });
  }
);

/* Remove a task */
router.delete(
  '/:id',
  middleware.isLoggedIn,
  middleware.checkTaskAuthorization,
  (req, res) => {
    Task.findByIdAndRemove(req.params.id, err => {
      if (err) {
        req.flash('error', 'Error. Please try again');
        res.redirect('back');
      } else {
        req.flash('success', 'Task removed');
        res.redirect('/tasks');
      }
    });
  }
);

router.post('/:id/apply', (req, res) => {
  Notification.create(
    {
      applicant: req.user._id,
      task: req.body.taskId,
      date: new Date()
    },
    (err, createdApplication) => {
      if (err) {
        req.flash('error', 'Error. Please try again');
        res.redirect('back');
      } else {
        req.flash('success', 'Application has been sent');
        res.redirect('back');
      }
    }
  );
});

router.post(
  '/:id/assignLaborHours',
  middleware.isLoggedIn,
  middleware.checkTaskAuthorization,
  (req, res) => {
    Task.findById(req.params.id, (err, foundDate) => {
      if (err) {
        req.flash('error', 'Error. Please try again');
        res.redirect('back');
      }
      date = foundDate.date;

      for (let x in req.body) {
        Employee.findById(x, (err, foundEmployee) => {
          foundEmployee.laborHours.push({
            date: date,
            hoursWorked: req.body[x]
          });
          foundEmployee.save();
        });
      }
    });

    res.redirect('back');
  }
);
module.exports = router;
