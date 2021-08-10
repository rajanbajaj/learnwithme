var mongoose = require('mongoose');
var post = mongoose.model('Post');

var sendJsonResponse = function(res, status, content) { 
 res.status(status); 
 res.json(content); 
};

var onlyUnique = function(value, index, self) {
  return self.indexOf(value) === index;
}

module.exports.postsReadOne = function (req, res) { 
	if (req.params && req.params.postId) {
		post.findById(req.params.postId).exec(function (err, data) {
			if (!data) { // mongoose does not return data
				sendJsonResponse(res, 404, {"message": "postId not found"});
				return;
			} else if (err) { // mongoose returned error
				sendJsonResponse(res, 404, err);
				return;
			}
			sendJsonResponse(res, 200, data);
		});
	} else {
		sendJsonResponse(res, 404, {"message": "postId no found in request"});
	}
};

module.exports.postsList = function (req, res) {
	if (req.query && req.query.keyword) {
		post.find({
			tags: { $elemMatch: { $regex: req.query.keyword }}
		}).exec(function (err, data) {
			if (!data) {	// mongoose does not return data
				sendJsonResponse(res, 404, {"message": "Posts not found"});
				return;
			} else if (err) {	// mongoose return error
				sendJsonResponse(res, 404, err)
				return;
			}
			sendJsonResponse(res, 200, data);
		});
	} else {
		post.find().exec(function (err, data) {
			if (!data) {	// mongoose does not return data
				sendJsonResponse(res, 404, {"message": "Posts not found"});
				return;
			} else if (err) {	// mongoose return error
				sendJsonResponse(res, 404, err)
				return;
			}
			sendJsonResponse(res, 200, data);
		});
	}
};

module.exports.postsCreate = function (req, res) { 
	if (req.body && req.body.title && req.body.author && req.body.body && req.body.rating) {
		post.create({
			title: req.body.title,
			author: req.body.author,
			body: req.body.body,
			summary: req.body.body,	// TODO: automate summary part
			rating: req.body.rating,
			tags: req.body.tags.split(",").filter(onlyUnique)
		}, function (err, data) {
			if (err) {
				sendJsonResponse(res, 400, err);
			} else {
				sendJsonResponse(res, 201, data);
			}
		});
	} else {
		sendJsonResponse(res, 404, "Unable to parse request params");
	}
};

module.exports.postsUpdateOne = function (req, res) { 
	if (req.params && req.params.postId) {
		post.findById(req.params.postId).exec(function (err, data) {
			if (!data) { // mongoose does not return data
				sendJsonResponse(res, 404, {"message": "postId not found"});
				return;
			} else if (err) {
				sendJsonResponse(res, 404, err);
				return;
			}

			// update attributes
			data.title = req.body.title;
			data.author = req.body.author;
			data.body = req.body.body;
			data.summary = req.body.body;	// TODO: automate summary part
			data.rating = req.body.rating;
			data.tags = req.body.tags.split(",").filter(onlyUnique);
			data.save(function (err, data) {
				if (err) {
					sendJsonResponse(res, 404, err);
				} else {
					sendJsonResponse(res, 200, data);
				}
			});
		});
	} else {
		sendJsonResponse(res, 404, {"message": "postId not found in request"});
	}
};

module.exports.postsDeleteOne = function (req, res) { 
	if (req.params && req.params.postId) {
		post.findByIdAndRemove(req.params.postId).exec(function (err, data) {
			if (err) {
				sendJsonResponse(res, 404, err);
				return;
			}
			sendJsonResponse(res, 204, null);
		});
	} else {
		sendJsonResponse(res, 404, {"message": "postId not found in request"});
	}
};