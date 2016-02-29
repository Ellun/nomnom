pry = require('pryjs')

'use strict';

require('dotenv').config(); //used to protect personal info

var express          = require('express');
var logger           = require('morgan');
var bodyParser       = require('body-parser');
var pg               = require('pg');
var session          = require('express-session');
var pgSession        = require('connect-pg-simple')(session);
var dotenv           = require('dotenv');
var request          = require('request');
var path             = require('path');
var methodOverride   = require('method-override');
var db               = require('./db/pg');
var nutMath          = require('./JS/calMath');

if(process.env.ENVIRONMENT === 'production') {
  var connectionString = process.env.DATABASE_URL;
} else {
  var connectionString  = "postgres://" + process.env.DB_USER + ":" + process.env.DB_PASS + "@localhost/account_info";
}

var app = express();
var port = process.env.PORT || 3000; //sets port numbers

var profileRoute = require(path.join(__dirname,'routes/profile'));
var userRoutes = require(path.join(__dirname, '/routes/users'));

app.use(express.static(__dirname + '/CSS'));
app.use(express.static(__dirname + '/JS'));

app.use(session({
  store: new pgSession({
    pg: pg,
    conString : connectionString,
    tableName: 'session'
  }),
  secret : 'recipe for hotdogs: hotdogs and hotdog buns',
  resave: false,
  cookie : {maxAge : 30 * 24 * 60 * 60 * 1000} //30 days
}))

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(logger('dev'));

app.use(methodOverride('_method'));

app.set('views', './views');
app.set('view engine', 'ejs');

app.get('/', (req, res)=>res.render('./pages/home'));
app.use('/users', userRoutes);
app.use('/profile', profileRoute);


app.listen(port,()=>
  console.log('Cogwheals Turning!', port,'//', new Date()) //checks that server is on
);
