
//Base Metabolic Rate
function calculateDailyConsumption (sex, weight, gWeight, height, age, deadline, activity) {
console.log("working Working Working","Sex: " + sex + " weight: " +  weight + " gWeight: " + gWeight + " height: " + height + " age: " + age + " deadline: " + deadline + "activity: " + activity);

  var brm = 0;
  var multiplyer = 0;

  if (sex === 1) {
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
  var dailyConsmption = 0;
  //goal weight
  if (weight > gWeight) {
    var diff = (weight - gWeight) * 3500;
    var defectPerDay = (diff / deadline);
    dailyConsmption = dailyBurnedCals - defectPerDay;
  } else {
    var diff = (gWeight - weight) * 3500;
    var defectPerDay = (diff / deadline);
    dailyConsmption = dailyBurnedCals + defectPerDay;
  }
  return dailyConsmption;
}

module.exports.calculateDailyConsumption = calculateDailyConsumption;
