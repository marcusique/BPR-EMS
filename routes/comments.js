const express = require('express'),
  router = express.Router({ mergeParams: true }),
  { check, validationResult } = require('express-validator/check'),
  Comment = require('../models/comment'),
  Task = require('../models/task'),
  middleware = require('../middleware/index');

/* Add new comment */
router.post(
  '/comments',
  middleware.isLoggedIn,
  [
    check('comment[text]')
      .isLength({ min: 1 })
      .withMessage('Please enter a comment')
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      errors.array().forEach(e => {
        req.flash('error', ' ' + e.msg);
      });
      res.redirect('back');
    } else {
      Task.findById(req.params.id, (err, foundTask) => {
        if (err) {
          console.log(err);
          res.redirect('/tasks');
        } else {
          Comment.create(req.body.comment, (err, comment) => {
            if (err) {
              req.flash('error', 'Error. Please try again');
              res.redirect('back');
            } else {
              comment.author.id = req.user._id;
              comment.author.username = req.user.username;
              comment.save();
              foundTask.comments.push(comment);
              foundTask.save();
              res.redirect('/tasks/' + foundTask._id);
            }
          });
        }
      });
    }
  }
);

/* Delete a comment */
router.delete(
  '/comments/:commentId',
  middleware.isLoggedIn,
  middleware.checkCommentOwnership,
  (req, res) => {
    Comment.findByIdAndRemove(req.params.commentId, err => {
      if (err) {
        req.flash('error', 'Error. Please try again');
        res.redirect('back');
      } else {
        Task.findById(req.params.id, (err, foundTask) => {
          if (err) {
            console.log(err);
          } else {
            foundTask.comments.splice(
              foundTask.comments.indexOf(req.params.commentId),
              1
            );
            foundTask.save();
            req.flash('success', 'Commment has been deleted');
            res.redirect('/tasks/' + req.params.id);
          }
        });
      }
    });
  }
);

module.exports = router;
