var pg                = require('pg');
var bcrypt            = require('bcrypt');
var salt              = bcrypt.genSaltSync(10); //colin's encryption
var session           = require('express-session');
var pgSession         = require('connect-pg-simple')(session);
var dotenv            = require('dotenv');
var request           = require('request');

if(process.env.ENVIRONMENT === 'production') {
  var connectionString = process.env.DATABASE_URL;
} else {
  var connectionString  = "postgres://" + process.env.DB_USER + ":" + process.env.DB_PASS + "@" + process.env.DB_HOST + "/account_info";
}

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
        res.sendStatus(500);
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

function userTable(req, res, next) {
  var name = req.body.name;
  var brand = req.body.brand_name;
  var cal = req.body.cal;
  var serving = req.body.serving;

  pg.connect(connectionString, function(err,client, done) {
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    var query = client.query("INSERT INTO food_table (name, brand_name, calories, serving_size, user_id) VALUES ($1, $2, $3, $4, $5);", [name, brand, parseInt(cal), serving, req.session.user.id], function(err, result) {
      done();
      if (err) {
        return console.error('error running query', err)
      }
      res.rows = result.rows
      next();
    });
  });
}

function showConsumedFood(req, res, next) {
  pg.connect(connectionString, function(err,client, done) {
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    var query = client.query("SELECT id, name, brand_name, calories, serving_size FROM food_table WHERE user_id = ($1);", [req.params.id], function(err, result) {
      done();
      if (err) {
        return console.error('error running query', err)
      }
      res.diff = result.rows;
      next();
    });
  });
}

function healthTable(req, res, next) {
  var sex = req.body.sex;
  var weight = req.body.weight;
  var gWeight = req.body.gWeight;
  var height = req.body.height;
  var age = req.body.age;
  var deadline = req.body.deadline;
  var activity = req.body.activity;

  pg.connect(connectionString, function(err,client, done) {
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    var query = client.query("INSERT INTO user_info (sex, weight, gWeight, height, age, deadline, activity, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);", [sex, weight, gWeight, height, age, deadline, activity, req.session.user.id], function(err, result) {
      done();
      if (err) {
        return console.error('error running query', err)
      }
      res.rows = result.rows;
      next();
    });
  });
}

function healthTableEdit(req, res, next) {
  var sex = req.body.sex;
  var weight = req.body.weight;
  var gWeight = req.body.gWeight;
  var height = req.body.height;
  var age = req.body.age;
  var deadline = req.body.deadline;
  var activity = req.body.activity;

  pg.connect(connectionString, function(err,client, done) {
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    var query = client.query("UPDATE user_info SET sex=$1, weight=$2, gweight=$3, height=$4, age=$5, deadline=$6, activity=$7 WHERE user_id=$8;", [sex, weight, gWeight, height, age, deadline, activity, req.session.user.id], function(err, result) {
      done();
      if (err) {
        return console.error('error running query', err)
      }
      res.rows = result.rows;
      next();
    });
  });
}

function nutritionMath(req, res, next) {
  pg.connect(connectionString, function(err,client, done) {
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    var query = client.query("SELECT sex, weight, gWeight, height, age, deadline, activity FROM user_info WHERE user_id = ($1);", [req.params.id], function(err, result) {
      done();
      if (err) {
        return console.error('error running query', err)
      }
      res.rows = result.rows
      var answer = calculateDailyConsumption(res.rows[0].sex, parseInt(res.rows[0].weight), parseInt(res.rows[0].gweight), parseInt(res.rows[0].height), parseInt(res.rows[0].age), parseInt(res.rows[0].deadline), res.rows[0].activity);
      res.rows = answer;
      next();
    });
  });
}

function removeFood(req, res, next) {
  pg.connect(connectionString, function(err,client, done) {
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    var query = client.query("DELETE FROM food_table WHERE id = ($1);", [req.body.id], function(err, result) {
      done();
      if (err) {
        return console.error('error running query', err)
      }
      next();
    });
  });
}

//Base Metabolic Rate
function calculateDailyConsumption (sex, weight, gWeight, height, age, deadline, activity) {
  var brm = 0;
  var multiplyer = 0;

  if (sex === "1") {
    bmr = 66 + (6.23 * weight) + (12.7 * height) - (6.8 * age);
  } else {
    bmr = 655 + (4.35 * weight) + (4.7 * height) - (4.7 * age);
  }

  //Multiplyer
  switch (activity) {
    case 1:
      multiplyer = 1.2;
      break;
    case 2:
      multiplyer = 1.375;
      break;
    case 3:
      multiplyer = 1.55;
      break;
    case 4:
      multiplyer = 1.725;
      break;
    default:
  }

  //amount of calories naturally burned a day
  var dailyBurnedCals = bmr * multiplyer;
  var dailyConsumption = 0;
  //goal weight
  if (weight > gWeight) {
    var diff = (weight - gWeight) * 3500;
    var defectPerDay = (diff / deadline);
    dailyConsumption = dailyBurnedCals - defectPerDay;
  } else {
    var diff = (gWeight - weight) * 3500;
    var defectPerDay = (diff / deadline);
    dailyConsumption = dailyBurnedCals + defectPerDay;
  }
  return dailyConsumption;
}

module.exports.removeFood = removeFood;
module.exports.showConsumedFood = showConsumedFood;
module.exports.nutritionMath = nutritionMath;
module.exports.healthTable = healthTable;
module.exports.healthTableEdit = healthTableEdit;
module.exports.userTable = userTable;
module.exports.createUser = createUser;
module.exports.loginUser = loginUser;
