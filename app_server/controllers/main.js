var request = require('request');
var apiOptions = { 
 server : "http://localhost:3000" 
};

/* GET home page. */
module.exports.index = function(req, res, next) {
  var path = "/api/posts";

  if (req.query && req.query.keyword) {
    path = path+"?keyword="+req.query.keyword;
  }

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

module.exports.deletePost = function(req, res, next) {
  if (req.params && req.params.postId) {
    var path = "/api/posts/"+req.params.postId;

    var requestOptions = { 
      url : apiOptions.server + path, 
      method : "DELETE", 
      json : {},
    };

    request(requestOptions, function(err, response, body) { 
      if (err) { 
        console.log(err); 
      } else if (response.statusCode === 204) { 
        res.redirect('/'); 
      } else { 
        console.log(response.statusCode); 
      } 
    });
  } else {
    res.status(404);
    res.render('error');
  }
}

module.exports.registerPost = function(req, res, next) {
  var path = "/api/posts";

  var requestOptions = { 
    url : apiOptions.server + path, 
    method : "POST", 
    json : {
      title: req.body.postTitle,
      author: req.body.postAuthor,
      body: req.body.postBody,
      rating: req.body.postRating,
      tags: req.body.postTags.replace(/ /g,'').replace(",,",","),
    }
  };

  request(requestOptions, function(err, response, body) { 
    if (err) { 
      console.log(err); 
    } else if (response.statusCode === 201) { 
      res.redirect('/'); 
    } else { 
      console.log(response.statusCode); 
    } 
  });
}

module.exports.editPost = function(req, res, next) {
  var path = "/api/posts/"+req.body.postId;

  var requestOptions = { 
    url : apiOptions.server + path, 
    method : "PUT", 
    json : {
      title: req.body.postTitle,
      author: req.body.postAuthor,
      body: req.body.postBody,
      rating: req.body.postRating,
      tags: req.body.postTags.replace(/ /g,'').replace(",,",","),
    }
  };

  request(requestOptions, function(err, response, body) { 
    if (err) { 
      console.log(err); 
    } else if (response.statusCode === 200) { 
      res.redirect('/'); 
    } else { 
      console.log(response.statusCode); 
    } 
  });
}