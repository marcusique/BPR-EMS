const express = require('express'),
  router = express.Router(),
  passport = require('passport'),
  middleware = require('../middleware/index'),
  async = require('async'),
  nodemailer = require('nodemailer'),
  crypto = require('crypto'),
  keys = require('../config/keys'),
  Employee = require('../models/employee'),
  Task = require('../models/task');

/* Get the Landing page*/
router.get('/', (req, res) => {
  if (req.session.passport) {
    res.redirect('calendar');
  } else {
    res.render('landing');
  }
});

/* Get the Calendar (Main Page) */
router.get('/calendar', middleware.isLoggedIn, (req, res) => {
  Task.find({}, (err, allTasks) => {
    if (err) {
      req.flash('error', 'Error. Please try again');
      res.redirect('back');
    } else {
      Task.findById(req.params.id, (err, foundTask) => {
        if (err) {
          req.flash('error', 'Error. Please try again');
          res.redirect('back');
        } else {
          res.render('calendar', {
            tasks: allTasks,
            task: foundTask
          });
        }
      });
    }
  });
});

/* Login route */
router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/calendar',
    failureRedirect: '/',
    failureFlash: 'Invalid credentials, please try again',
    successFlash: 'Welcome to Nordic Clean EMS!'
  })
);

/* Logout route */
router.get('/logout', (req, res) => {
  req.logout();
  req.session.destroy(err => {
    if (err) {
      req.flash('error', 'Error has occured. Please try again');
      res.redirect('back');
    }
    res.redirect('/');
  });
});

/********** Password reset flow **********/

/* Render forgot password page */
router.get('/forgot', (req, res) => {
  res.render('forgot');
});

/* Accept provided email address and send reset link */
router.post('/forgot', (req, res, next) => {
  async.waterfall(
    [
      done => {
        crypto.randomBytes(20, (err, buf) => {
          let token = buf.toString('hex');
          done(err, token);
        });
      },
      (token, done) => {
        Employee.findOne({ email: req.body.email }, (err, employee) => {
          if (!employee) {
            req.flash('error', 'No account with that email address exists');
            return res.redirect('/forgot');
          }

          console.log(
            'password reset for ' + employee.email + ' has been initiated'
          );
          employee.resetPasswordToken = token;
          employee.resetPasswordExpires = Date.now() + 3600000; // 1 hour

          employee.save(err => {
            done(err, token, employee);
          });
        });
      },
      (token, employee, done) => {
        let smtpTransport = nodemailer.createTransport({
          host: 'mail.nordicclean.dk',
          port: 465,
          secure: true,
          auth: {
            user: 'pwd@nordicclean.dk',
            pass: keys.smptPassword
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        let mailOptions = {
          to: employee.email,
          from: 'pwd@nordicclean.dk',
          subject: 'Nordic Clean EMS password reset',
          text:
            'Hi ' +
            employee.firstName +
            ',\n\nyou recently requested to reset your password for your Nordic Clean EMS system.\n\n' +
            'Use the following link to reset it. This password reset is only valid for the next 60 minutes.\n\n' +
            'http://' +
            req.headers.host +
            '/reset/' +
            token +
            '\n\n' +
            'If you did not request a password reset, please ignore this email and your password will remain unchanged.\n\n' +
            'Nordic Clean A/S'
        };
        smtpTransport.sendMail(mailOptions, err => {
          console.log('mail sent to ' + employee.email);
          req.flash(
            'success',
            'An e-mail has been sent to ' +
              employee.email +
              ' with further instructions'
          );
          res.redirect('/');
          done(err, 'done');
        });
      }
    ],
    err => {
      if (err) return next(err);
      res.redirect('/forgot');
    }
  );
});

/* Render unique change password form */
router.get('/reset/:token', (req, res) => {
  Employee.findOne(
    {
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    },
    (err, employee) => {
      if (!employee) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot');
      }
      res.render('reset', { token: req.params.token });
    }
  );
});

/* Accept new password and save it  */
router.post('/reset/:token', (req, res) => {
  async.waterfall(
    [
      done => {
        Employee.findOne(
          {
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
          },
          (err, employee) => {
            if (!employee) {
              req.flash(
                'error',
                'Password reset token is invalid or has expired.'
              );
              return res.redirect('back');
            }
            if (req.body.password === req.body.confirm) {
              employee.setPassword(req.body.password, err => {
                employee.resetPasswordToken = undefined;
                employee.resetPasswordExpires = undefined;

                employee.save(err => {
                  req.logIn(employee, err => {
                    done(err, employee);
                  });
                });
              });
            } else {
              req.flash('error', 'Passwords do not match.');
              return res.redirect('back');
            }
          }
        );
      }
    ],
    err => {
      req.flash('success', 'Password has been changed! You are now logged in');
      res.redirect('/calendar');
    }
  );
});

module.exports = router;
