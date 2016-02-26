var express     = require('express');
var users       = express.Router();
var bodyParser  = require('body-parser');
var session     = require('express-session');
var db          = require('./../db/pg');

users.route('/') //redirects you to profile
  .post(db.createUser, (req, res) => res.redirect('/profile/' + res.rows[0].id));

users.route('/new') //create a new user
  .get((req, res) => res.render('pages/new'));

users.route('/login') //login to existing user
  .get((req, res) => res.render('pages/login'))
  .post(db.loginUser, (req, res) => {
    req.session.user = res.rows; //no clue what this doessssss

    req.session.save(function() {
        res.redirect('/profile/' + res.rows.id);
    })
  })

module.exports = users;
