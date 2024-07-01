const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { check, validationResult } = require('express-validator');

// Bring in User Model
let User = require('../models/user');

// Register Form
router.get('/register', function (req, res) {
  res.render('register');
});

// Register Proccess
router.post('/register', [
  check('name', 'Name is required').notEmpty(),
  check('email', 'Email is required').notEmpty(),
  check('email', 'Email is not valid').isEmail(),
  check('email', 'Email already exists').exists(),
  check('username', 'Username is required').notEmpty(),
  check('username', 'Username already exists').exists(),
  check('password', 'Password is required').notEmpty(),
  check('password', 'Password Min limit is 8').isLength({ min: 8 }),
  check('password2', 'Password is required').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }

    return true;
  })
], (req, res) => {

  // req.check('password2', 'Passwords do not match').equals(req.body.password);
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.render('register', {
      errors: errors.array()
    });
  } else {
    let newUser = new User({
      name: req.body.name,
      email: req.body.email,
      username: req.body.username,
      password: req.body.password
    });

    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(newUser.password, salt, function (err, hash) {
        if (err) {
          console.log(err);
        }
        newUser.password = hash;
        newUser.save().then(() => {
          req.flash('success', 'You are now registered and can log in');
          res.redirect('/users/login');
        }
        ).catch(err => {
          console.log(err);
          res.status(500).json({
            error: err
          });
        });
      });
    });
  }
});

// Login Form
router.get('/login', function (req, res) {
  res.render('login');
});

// Login Process
router.post('/login', function (req, res, next) {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// logout
router.get('/logout', function (req, res) {
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;
