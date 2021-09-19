const request = require('request');
const fs = require('fs'); // File System - for file manipulation
let apiOptions;
if (process.env.server) {
  apiOptions = {      
    server: process.env.server,
  };
} else {
  apiOptions = {      
    server: 'http://localhost:3000',
  };
}

/* GET home page. */
module.exports.index = function(req, res, next) {
  let path = '/api/posts';

  if (req.query && req.query.keyword) {
    path = path+'?keyword='+req.query.keyword;
  }

  const requestOptions = {
    url: apiOptions.server + path,
    method: 'GET',
    json: {},
  };
  request(requestOptions, function(err, response, body) {
    if (err) {
      console.log(err);
    } else if (response.statusCode === 200) {
      let error = null;
      if(req.session && req.session.error) {
        error = req.session.error;
      }

      // unset error
      req.session.error = null;

      res.render('index', {data: body, error: error});
    } else {
      console.log(response.statusCode);
    }
  });
};

module.exports.deletePost = function(req, res, next) {
  if (req.params && req.params.postId) {
    const path = '/api/posts/'+req.params.postId;

    const requestOptions = {
      url: apiOptions.server + path,
      method: 'DELETE',
      json: {},
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
};

module.exports.registerPost = function(req, res, next) {
  const path = '/api/posts';

  const requestOptions = {
    url: apiOptions.server + path,
    method: 'POST',
    json: {
      title: req.body.postTitle,
      author: req.body.postAuthor,
      body: req.body.postBody,
      rating: req.body.postRating,
      tags: req.body.postTags.replace(/ /g, '').replace(',,', ','),
    },
  };

  request(requestOptions, function(err, response, body) {
    if (err) {
      console.log(err);
    } else if (response.statusCode === 201) {
      res.redirect('/');
    } else {
      req.session.error = response.body && response.body.errors && response.body.message ? response.body.message : "An unexpected error occurred!";
      res.redirect('/');
    }
  });
};

module.exports.editPost = function(req, res, next) {
  const path = '/api/posts/'+req.body.postId;

  const requestOptions = {
    url: apiOptions.server + path,
    method: 'PUT',
    json: {
      title: req.body.postTitle,
      author: req.body.postAuthor,
      body: req.body.postBody,
      rating: req.body.postRating,
      tags: req.body.postTags.replace(/ /g, '').replace(',,', ','),
    },
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
};

module.exports.uploadFiles = function(req, res, next) {
  let fstream;
  req.pipe(req.busboy);
  req.busboy.on('file', function(fieldname, file, filename) {
    console.log('Uploading: ' + filename);

    // Path where image will be uploaded
    fstream = fs.createWriteStream('public/images/' + filename);
    file.pipe(fstream);
    fstream.on('close', function() {
      console.log('Upload Finished of ' + filename);
      // Respond to the successful upload with JSON.
      // Use a location key to specify the path to the saved image resource.
      // { location : '/your/uploaded/image/file'}
      res.status(200);
      res.json({'location': '/images/'+filename});
    });
  });
};

module.exports.getFiles = function(req, res, next) {
  // list all files in the directory
  const dir = 'public/images/';
  fs.readdir(dir, (err, files) => {
    if (err) {
      throw err;
    }

    const data = [];
    // files object contains all files names
    files.forEach((file) => {
      data.push({title: file, value: '/images/'+file});
    });
    res.status(200).send({data: data});
  });
};
