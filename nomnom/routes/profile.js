'use strict'

var express        = require('express');
var profile        = express.Router();
var bodyParser     = require('body-parser');
var db             = require('./../db/pg');
var nutMath        = require('./../JS/calMath');
var request        = require('request');
var methodOverride = require('method-override');

var foodData = "https://api.nutritionix.com/v1_1/search/";
var foodNutrition = "?results=0%3A20&cal_min=0&cal_max=50000&fields=item_name%2Cbrand_name%2Cnf_calories&appId=e7718bd7&appKey=ebfec0c4db970029e7138a6bf6e5eb65";

profile.delete('/logout', function(req, res) {
  req.session.destroy(function(err) {
    res.redirect('/');
  })
})

profile.route('/:id/food/search')
  .get(getFoods, function(req, res) {
    res.render('pages/food_search.ejs', {id: req.params.id, data: res.data});
  })
  .post(db.userTable, function(req, res) {
    var id = req.params.id;
    res.redirect('/profile/' + id);
  })

profile.get('/:id/food', function(req, res) {
  res.render('../views/pages/food', {id: req.params.id});
})

profile.route('/:id/programs/edit')
.get(function(req, res) {
  res.render('../views/pages/edit', {id: req.params.id});
})
.put(db.healthTableEdit, function(req, res) {
  var id = req.params.id;
  res.redirect('/profile/' + id);
})

profile.route('/:id/programs')
  .get(function(req, res) {
    res.render('../views/pages/programs', {id: req.params.id});
  })
  .post(db.healthTable, function(req, res) {
    var id = req.params.id;
    res.redirect('/profile/' + id);
  })

profile.get('/:id',db.nutritionMath, db.showConsumedFood, function(req, res) {
    res.render('../views/pages/profile', {id: req.params.id, data: res.diff, answer: res.rows})
  });
profile.delete('/:id',db.removeFood, function(req, res) {
    var id = req.params.id;
    res.redirect('/profile/' + id);
})



function getFoods(req, res, next) {
  request(foodData + req.query.item_name + foodNutrition, function(err, response, body) {
    var data = JSON.parse(body);
    res.data = data.hits;
    next()
  });
}



module.exports = profile;
