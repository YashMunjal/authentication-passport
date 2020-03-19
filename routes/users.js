const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
//user model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');
//login
router.get('/login', forwardAuthenticated,(req, res) => res.render('login'));
//register

router.get('/register', forwardAuthenticated,(req, res) => res.render('register'));
//Register link handler 
// Ques for me: What if we use GET?
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    console.log(req.body);
    let errors = [];
    //check validation
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please enter all fields' });
    }

    if (password != password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
    }

    console.log(errors[0]);
    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        //validation passed
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    //User exists
                    errors.push({ msg: 'Email already exists' });
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });

                }
                else {
                    //Create a new User
                    //bcrypt added
                    const newUser = new User({
                        name,
                        email,
                        password
                    });
                    //Hash password
                    bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        //Set password to hashed
                        newUser.password = hash;
                        newUser
                            .save()
                            .then(user => {
                                req.flash(
                                    'success_msg',
                                    'You are now registered and can log in'
                                );
                                res.redirect('/users/login');
                            })
                            .catch(err => console.log(err));
                    }));
                }
            });

    }
});
// Login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});
module.exports = router;