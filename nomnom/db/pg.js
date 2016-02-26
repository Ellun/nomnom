var pg                = require('pg');
var bcrypt            = require('bcrypt');
var salt              = bcrypt.genSaltSync(10);
var session           = require('express-session');
var pgSession         = require('connect-pg-simple')(session);
var dotenv            = require('dotenv');
var connectionString  = "postgres://" + process.env.DB_USER + ":" + process.env.DB_PASS + "@localhost/account_info";
var request           = require('request');

function loginUser(req, res, next) {
  var email = req.body.email;
  var password = req.body.password;

  pg.connect(connectionString, function(err,client, done) {
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    var query = client.query("SELECT * FROM users WHERE email LIKE ($1);", [email], function(err, result) {
      done();
      if (err) {
        return console.error('error running query', err)
      }
      if (result.rows.length === 0) {
        res.status(204).json({success: true, data: 'no content'})
      } else if (bcrypt.compareSync(password, result.rows[0].password_digest)) {
        res.rows = result.rows[0];
      }
      next();
    });
  });
}

function createSecure(email, password, callback) {
  //hashing the password given by the user at signup
  bcrypt.genSalt(function(err, salt) {
    bcrypt.hash(password, salt, function(err, hash) {
      //this callback saves the user to our databoard
      //with the hashed password
      callback(email,hash);
    })
  })
}


function createUser(req, res, next) {
  createSecure(req.body.email, req.body.password, saveUser);

  function saveUser(email, hash) {
    pg.connect(connectionString, function(err,client, done) {
      if(err) {
        done();
        console.log(err);
        return res.status(500).json({success: false, data: err});
      }
      var query = client.query("INSERT INTO users (email, password_digest) VALUES ($1, $2) RETURNING id;", [email, hash], function(err, result) {
        done();
        if (err) {
          return console.error('error running query', err)
        }
        res.rows = result.rows
        next();
      });
    });
  }
}

module.exports.createUser = createUser;
module.exports.loginUser = loginUser;
