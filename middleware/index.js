const middlewareObj = {},
  Comment = require('../models/comment');

middlewareObj.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  req.flash('error', 'Please log in first');
  res.status(401).render('landing');
};

middlewareObj.checkCommentOwnership = (req, res, next) => {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.commentId, (err, foundComment) => {
      if (err) {
        res.redirect('back');
      } else {
        if (
          foundComment.author.id.equals(req.user._id) ||
          req.user.userRole == 'Admin' ||
          req.user.userRole == 'Manager'
        ) {
          next();
        } else {
          res.redirect('back');
        }
      }
    });
  }
};

middlewareObj.checkNewEmployeeAuthorization = (req, res, next) => {
  if (req.isAuthenticated() && req.user.userRole == 'Admin') {
    next();
  } else {
    req.flash('error', 'You are not authorized to do that');
      if (req.user.userRole == 'Cleaner') {
        res.redirect('/calendar');
      } else {
        res.redirect('/employees');
      }
  }
};

middlewareObj.checkEmployeeDirectoryAuthorization = (req, res, next) => {
  if (
    (req.isAuthenticated() && req.user.userRole == 'Manager') ||
    (req.isAuthenticated() && req.user.userRole == 'Admin')
  ) {
    next();
  } else {
    req.flash('error', 'You are not authorized to do that');
    res.redirect('/calendar');
  }
};

middlewareObj.checkNewClientAuthorization = (req, res, next) => {
  if (req.isAuthenticated() && req.user.userRole == 'Admin') {
    next();
  } else {
    req.flash('error', 'You are not authorized to do that');
      if (req.user.userRole == 'Cleaner') {
        res.redirect('/calendar');
      } else {
        res.redirect('/clients');
      }
  }
};

middlewareObj.checkClientDirectoryAuthorization = (req, res, next) => {
  if (
    (req.isAuthenticated() && req.user.userRole == 'Admin') ||
    (req.isAuthenticated() && req.user.userRole == 'Manager')
  ) {
    next();
  } else {
    req.flash('error', 'You are not authorized to do that');
    res.redirect('/calendar');
  }
};

middlewareObj.checkTaskAuthorization = (req, res, next) => {
  if (
    (req.isAuthenticated() && req.user.userRole == 'Admin') ||
    (req.isAuthenticated() && req.user.userRole == 'Manager')
  ) {
    next();
  } else {
    req.flash('error', 'You are not authorized to do that');
    res.redirect('/calendar');
  }
};

module.exports = middlewareObj;
