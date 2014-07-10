var needle = require("needle");
var S = require('string');
var yoAPIToken = "YOU MUST FILL YOUR API TOKEN HERE";
var kickstarterProjectURL = "https://www.kickstarter.com/projects/324283889/potato-salad";
var checkInterval = 10000; // 1000 == 1 second.
var yoEveryXBackers = 50; // Multipuls of 10 recommended.

var totalWhenLastYo;

// Executes the callback with a parameter for how many backers there are.
function getBackerCount(completion) {
  console.log("Retrieving backer count.");
  needle.get(kickstarterProjectURL, function(error, response) {
    if (!error && response.statusCode == 200) {
      console.log("Retrieved backer count.")
      var total = parseInt(S(response.body).between('<meta property="twitter:text:backers" content="', '"/>').s.replace(",",""));
      completion(Math.floor(total/yoEveryXBackers) * yoEveryXBackers);
    } else {
      console.log(error);
    }
  });
}

// This will send a Yo to all subscribers unconditionally.
function yoAll() {
  needle.post('http://api.justyo.co/yoall/', {
    api_token: yoAPIToken
  },function(error, response) {
    if (error)
      console.log(error);
    else
      console.log("Yo sent.");
  });
}

// Checks if there are more than 50 new backers. If there are, it sends a Yo.
function checkAndSend() {
  console.log("Checking status.");
  getBackerCount(function(total) {
    if (total > totalWhenLastYo) {
      console.log("Preparing to send Yo.");
      totalWhenLastYo = total;
      yoAll();
    } else {
      console.log("Yo not needed. Value is: " + total);
    }
    setTimeout(checkAndSend(), checkInterval);
  });
}

// Set the starting count.
getBackerCount(function(total) {
  totalWhenLastYo = total;
  console.log("Starting value: " + total);
});
// Start the first check
checkAndSend();
