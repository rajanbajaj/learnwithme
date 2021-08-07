var request = require('request');
var apiOptions = { 
 server : "http://localhost:3000" 
};

/* GET home page. */
module.exports.index = function(req, res, next) {
  var path = "/api/posts";
  var requestOptions = { 
    url : apiOptions.server + path, 
    method : "GET", 
    json : {},
  };

  request(requestOptions, function(err, response, body) { 
    if (err) { 
      console.log(err); 
    } else if (response.statusCode === 200) { 
      res.render('index', { data: body }); 
    } else { 
      console.log(response.statusCode); 
    } 
  });
}