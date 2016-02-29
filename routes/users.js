var express     = require('express');
var users       = express.Router();
var bodyParser  = require('body-parser');
var session     = require('express-session');
var db          = require('./../db/pg');

users.get('/new', function(req, res) { //create a new user
  res.render('pages/new');
})

users.route('/login') //login to existing user
  .get(function(req, res) {
    res.render('pages/login')
  })
  .post(db.loginUser, function(req, res) {
    req.session.user = res.rows; //no clue what this doessssss

    req.session.save(function() {
        res.redirect('/profile/' + res.rows.id + '/programs');
    })
  })

users.route('/') //redirects you to profile
  .post(db.createUser, (req, res) => res.redirect('/users/login'));

module.exports = users;
