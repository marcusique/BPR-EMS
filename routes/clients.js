const express = require('express'),
  router = express.Router({ mergeParams: true }),
  Client = require('../models/client'),
  { check, validationResult } = require('express-validator/check'),
  middleware = require('../middleware/index');

/* Get the list of clients*/
router.get(
  '/',
  middleware.isLoggedIn,
  middleware.checkClientDirectoryAuthorization,
  (req, res) => {
    Client.find({}, (err, allClients) => {
      if (err) {
        req.flash('error', 'Error. Please try again');
        res.redirect('back');
        console.log(err);
      } else {
        res.render('clients/index', {
          clients: allClients
        });
      }
    });
  }
);

/* Get the New Client form*/
router.get(
  '/new',
  middleware.isLoggedIn,
  middleware.checkNewClientAuthorization,
  (req, res) => {
    res.render('clients/new');
  }
);

/* Create a new client*/
router.post(
  '/new',
  middleware.isLoggedIn,
  middleware.checkNewClientAuthorization,
  [
    check('phoneNumber')
      .isNumeric()
      .withMessage('Phone number must contain digits only')
      .trim(),
    check('postalCode')
      .isNumeric()
      .withMessage('Postal code must contain digits only')
      .trim(),
    check('city')
      .isAlpha()
      .withMessage('City must contain alpha characters only')
      .trim(),
    check('email')
      .isEmail()
      .withMessage('Enter a valid email')
      .normalizeEmail({ all_lowercase: true })
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
      Client.create({
        name: req.body.name,
        address: {
          postalCode: req.body.postalCode,
          city: req.body.city,
          addressLine: req.body.addressLine
        },
        email: req.body.email,
        phoneNumber: req.body.phoneNumber
      });
      req.flash('success', 'Client has been saved (' + req.body.name + ')');
      res.redirect('/clients');
    }
  }
);

/* Render edit form for a found client */
router.get(
  '/:id/edit',
  middleware.isLoggedIn,
  middleware.checkNewClientAuthorization,
  (req, res) => {
    Client.findById(req.params.id, (err, foundClient) => {
      if (err) {
        req.flash('error', 'Error. Please try again');
        res.redirect('back');
        console.log(err);
      } else {
        res.render('clients/edit', { client: foundClient });
      }
    });
  }
);

/* Update client information */
router.put(
  '/:id',
  middleware.isLoggedIn,
  middleware.checkNewClientAuthorization,
  (req, res) => {
    Client.findByIdAndUpdate(
      req.params.id,
      req.body.client,
      (err, updatedClient) => {
        if (err) {
          req.flash('error', 'Error. Please try again');
          res.redirect('back');
          console.log(err);
        } else {
          req.flash('success', 'Client updated');
          res.redirect('/clients');
        }
      }
    );
  }
);

/* Remove a client */
router.delete(
  '/:id',
  middleware.isLoggedIn,
  middleware.checkNewClientAuthorization,
  (req, res) => {
    Client.findByIdAndRemove(req.params.id, err => {
      if (err) {
        req.flash('error', 'Error. Please try again');
        res.redirect('back');
      } else {
        req.flash('success', 'Client removed');
        res.redirect('/clients');
      }
    });
  }
);

module.exports = router;
