'use strict'

var express     = require('express');
var profile       = express.Router();
var bodyParser  = require('body-parser');
var db  = require('./../db/pg');


profile.delete('/logout', function(req, res) {
  req.session.destroy(function(err) {
    res.redirect('/');
  })
})

profile.route('/:id')
  .get((req, res)=> {
    res.render('../views/pages/profile', {id: req.params.id});
  // .post()
})

profile.get('/:id/food', function(req, res){
  res.render('../views/pages/food', {id: req.params.id});
})

profile.get('/:id/programs', function(req, res){
  res.render('../views/pages/programs', {id: req.params.id});
})

module.exports = profile;
