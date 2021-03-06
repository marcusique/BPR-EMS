const express = require('express'),
  router = express.Router({ mergeParams: true }),
  Employee = require('../models/employee'),
  Notification = require('../models/notification'),
  { check, validationResult } = require('express-validator/check'),
  middleware = require('../middleware/index');

/* Get the list of employees */
router.get(
  '/',
  middleware.isLoggedIn,
  middleware.checkEmployeeDirectoryAuthorization,
  (req, res) => {
    Employee.find({}, (err, allEmployees) => {
      if (err) {
        req.flash('error', 'Error. Please try again');
        res.redirect('back');
      } else {
        res.render('employees/index', {
          employees: allEmployees
        });
      }
    });
  }
);

/* Get the New Employee form */
router.get(
  '/new',
  middleware.isLoggedIn,
  middleware.checkNewEmployeeAuthorization,
  (req, res) => {
    res.render('employees/new');
  }
);

/* Create a new employee */
router.post(
  '/new',
  middleware.isLoggedIn,
  middleware.checkNewEmployeeAuthorization,
  [
    check('firstName')
      .isAlpha()
      .withMessage('First name must contain alpha characters only')
      .trim(),
    check('lastName')
      .isAlpha()
      .withMessage('First name must contain alpha characters only')
      .trim(),
    check('postalCode')
      .isNumeric()
      .withMessage('Postal code must contain digits only')
      .trim(),
    check('phoneNumber')
      .isNumeric()
      .withMessage('Phone number must contain digits only')
      .trim(),
    check('email')
      .isEmail()
      .withMessage('Enter a valid email address')
      .trim()
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      errors.array().forEach(e => {
        req.flash('error', ' ' + e.msg);
      });
      res.redirect('back');
    } else {
      let newEmployee = new Employee({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userRole: req.body.userRole,
        username: req.body.username,
        address: {
          postalCode: req.body.postalCode,
          city: req.body.city,
          addressLine: req.body.addressLine
        },
        phoneNumber: req.body.phoneNumber,
        email: req.body.email,
        labourHours: req.body.labourHours
      });
      Employee.register(newEmployee, req.body.password, (err, employee) => {
        if (err) {
          console.log(err);
          req.flash('error', err.message);
          res.redirect('back');
        }
        req.flash(
          'success',
          'Employee has been saved (' +
            employee.firstName +
            ' ' +
            employee.lastName +
            ')'
        );
        res.redirect('/employees');
      });
    }
  }
);

/* Render edit form for a found employee */
router.get(
  '/:id/edit',
  middleware.isLoggedIn,
  middleware.checkNewEmployeeAuthorization,
  (req, res) => {
    Employee.findById(req.params.id, (err, foundEmployee) => {
      if (err) {
        req.flash('error', 'Error. Please try again');
        res.redirect('back');
      } else {
        res.render('employees/edit', {
          employee: foundEmployee
        });
      }
    });
  }
);

/* Update an employee information */
router.put(
  '/:id',
  middleware.isLoggedIn,
  middleware.checkNewEmployeeAuthorization,
  (req, res) => {
    Employee.findByIdAndUpdate(
      req.params.id,
      req.body.employee,
      (err, updatedEmployee) => {
        if (err) {
          req.flash('error', 'Error. Please try again');
          res.redirect('back');
          console.log(err);
        } else {
          req.flash('success', 'Employee updated');
          res.redirect('/employees');
        }
      }
    );
  }
);

/* Remove an employee */
router.delete(
  '/:id',
  middleware.isLoggedIn,
  middleware.checkNewEmployeeAuthorization,
  (req, res) => {
    if (req.user._id == req.params.id) {
      req.flash('error', 'Error. You cannot delete your own accout');
      res.redirect('back');
    } else {
      Employee.findByIdAndRemove(req.params.id, err => {
        if (err) {
          req.flash('error', 'Error. Please try again');
          res.redirect('back');
        } else {
          Notification.deleteMany({ applicant: req.params.id }, err => {
            if (err) {
              req.flash('error', 'Error has occured. Please try again');
              res.redirect('back');
            } else {
              req.flash('success', 'Employee removed');
              res.redirect('/employees');
            }
          });
        }
      });
    }
  }
);

module.exports = router;
