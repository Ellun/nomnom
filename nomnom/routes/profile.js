'use strict'

var express     = require('express');
var profile     = express.Router();
var bodyParser  = require('body-parser');
var db          = require('./../db/pg');
var request = require('request');

var foodData = "https://api.nutritionix.com/v1_1/search/";
var foodNutrition = "?results=0%3A20&cal_min=0&cal_max=50000&fields=item_name%2Cbrand_name%2Cnf_calories&appId=e7718bd7&appKey=ebfec0c4db970029e7138a6bf6e5eb65";

profile.delete('/logout', function(req, res) {
  req.session.destroy(function(err) {
    res.redirect('/');
  })
})

profile.route('/:id')
  .get((req, res) => {res.render('../views/pages/profile', {id: req.params.id})})

profile.route('/:id/food')
  .get((req, res) => res.render('../views/pages/food', {id: req.params.id}));


profile.get('/:id/food/search/', getFoods, (req, res) => {
  res.render('pages/food_search.ejs', {id: req.params.id, data: res.data})
})

function getFoods(req, res, next) {
  request(foodData + req.query.item_name + foodNutrition, function(err, response, body) {
    var data = JSON.parse(body);
    console.log(data.hits);
    res.data = data.hits;
    next()
  });
}

profile.get('/:id/programs', (req, res) => {res.render('../views/pages/programs', {id: req.params.id})})

module.exports = profile;
