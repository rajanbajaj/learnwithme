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
	var limit = req.query.limit ? Math.max(0, req.query.limit) : 10;
	var start = req.query.start ? Math.max(0, req.query.start) : 0;

	if (req.query && req.query.keyword) {
		post.find({
			tags: { $elemMatch: { $regex: req.query.keyword }}
		})
		.skip(start)
    .limit(limit)
    .sort({
        title: 'asc'
    })
		.exec(function (err, data) {
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
		post.find()
		.skip(start)
	    .limit(limit)
	    .sort({
	        title: 'asc'
	    })
		.exec(function (err, data) {
			if (!data) {	// mongoose does not return data
				sendJsonResponse(res, 404, {"message": "Posts not found"});
				return;
			} else if (err) {	// mongoose return error
				sendJsonResponse(res, 404, err)
				return;
			}

			sendJsonResponse(res, 200, {
				"_links": {
					self: "/api/posts?start=" + String(start) + "&limit=" + limit,
					prev: "/api/posts?start=" + (start-limit>=0 ? String((start-limit)) : "0") + "&limit=" + limit,
					next: "/api/posts?start=" + String(start+limit) + "&limit=" + limit,
				},
				"limit": limit,
				"size": data.length,
				"start": start,
				results: data,
			});
		});
	}
};

module.exports.postsCreate = function (req, res) { 
	if (req.body && req.body.title && req.body.author && req.body.body && req.body.rating) {
		post.create({
			title: req.body.title,
			publish_status: req.body.publish_status,
			author: req.body.author,
			body: req.body.body,
			summary: req.body.body,	// TODO: automate summary part
			rating: req.body.rating,
			tags: req.body.tags.split(",").filter(onlyUnique)	// TODO: create tags based on content
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

// read comments on post
module.exports.readPostComment = function(req, res) {
	var limit = req.query.limit ? Math.max(0, req.query.limit) : 10;
	var start = req.query.start ? Math.max(0, req.query.start) : 0;

	if (req.params && req.params.postId) {
		post.findById(req.params.postId).exec(function (err, data) {
			if (!data) { // mongoose does not return data
				sendJsonResponse(res, 404, {"message": "postId not found"});
				return;
			} else if (err) {
				sendJsonResponse(res, 404, err);
				return;
			}

			sendJsonResponse(res, 200, {
				"_links": {
					self: `/api/posts/${req.params.postId}/comments?start=` + String(start) + "&limit=" + limit,
					prev: `/api/posts/${req.params.postId}/comments?start=` + (start-limit>=0 ? String((start-limit)) : "0") + "&limit=" + limit,
					next: `/api/posts/${req.params.postId}/comments?start=` + String(start+limit) + "&limit=" + limit,
				},
				"limit": limit,
				"size": data.comments.slice(start, start+limit).length,
				"start": start,
				results: data.comments.slice(start, start+limit),
			});
		});
	} else {
		sendJsonResponse(res, 404, "Unable to parse request params");
	}
}

// create comment on post
module.exports.createPostComment = function(req, res) {
	if (req.params && req.params.postId) {
		post.findById(req.params.postId).exec(function (err, data) {
			if (!data) { // mongoose does not return data
				sendJsonResponse(res, 404, {"message": "postId not found"});
				return;
			} else if (err) {
				sendJsonResponse(res, 404, err);
				return;
			}

			// add comment to comments array
			temp = data.comments.push({
				author: req.body.author,
				commentText: req.body.commentText,
			});
			data.save(function (err, data) {
				if (err) {
					sendJsonResponse(res, 404, err);
				} else {
					sendJsonResponse(res, 200, data);
				}
			});
		});
	} else {
		sendJsonResponse(res, 404, "Unable to parse request params");
	}
}

// update comment on post
module.exports.updatePostComment = function(req, res) {
	if (req.params && req.params.postId && req.params.commentId) {
		post.findById(req.params.postId).exec(function (err, data) {
			if (!data) { // mongoose does not return data
				sendJsonResponse(res, 404, {"message": "postId not found"});
				return;
			} else if (err) {
				sendJsonResponse(res, 404, err);
				return;
			}

			// add comment to comments array
			comments = data.comments;
			for (var i = comments.length - 1; i >= 0; i--) {
				if (String(comments[i]._id) === req.params.commentId) {
					comments[i] = {
						author: comments[i].author,
						commentText: req.body.commentText ? req.body.commentText : "",
					};
				}
			}
			data.comments = comments;

			data.save(function (err, data) {
				if (err) {
					sendJsonResponse(res, 404, err);
				} else {
					sendJsonResponse(res, 200, data);
				}
			});
		});
	} else {
		sendJsonResponse(res, 404, "Unable to parse request params");
	}
}

// delete comment on post
module.exports.deletePostComment = function(req, res) {
	if (req.params && req.params.postId && req.params.commentId) {
		post.findById(req.params.postId).exec(function (err, data) {
			if (!data) { // mongoose does not return data
				sendJsonResponse(res, 404, {"message": "postId not found"});
				return;
			} else if (err) {
				sendJsonResponse(res, 404, err);
				return;
			}

			// add comment to comments array
			comments = data.comments;
			for (var i = comments.length - 1; i >= 0; i--) {
				if (String(comments[i]._id) === req.params.commentId) {
					comments.splice(i,1);
				}
			}
			data.comments = comments;

			data.save(function (err, data) {
				if (err) {
					sendJsonResponse(res, 404, err);
				} else {
					sendJsonResponse(res, 200, data);
				}
			});
		});
	} else {
		sendJsonResponse(res, 404, "Unable to parse request params");
	}
}

/**
 * POST REVIEWS
*/

// read reviews on post
module.exports.readPostReviwes = function(req, res) {
	var limit = req.query.limit ? Math.max(0, req.query.limit) : 10;
	var start = req.query.start ? Math.max(0, req.query.start) : 0;

	if (req.params && req.params.postId) {
		post.findById(req.params.postId).exec(function (err, data) {
			if (!data) { // mongoose does not return data
				sendJsonResponse(res, 404, {"message": "postId not found"});
				return;
			} else if (err) {
				sendJsonResponse(res, 404, err);
				return;
			}

			sendJsonResponse(res, 200, {
				"_links": {
					self: `/api/posts/${req.params.postId}/reviews?start=` + String(start) + "&limit=" + limit,
					prev: `/api/posts/${req.params.postId}/reviews?start=` + (start-limit>=0 ? String((start-limit)) : "0") + "&limit=" + limit,
					next: `/api/posts/${req.params.postId}/reviews?start=` + String(start+limit) + "&limit=" + limit,
				},
				"limit": limit,
				"size": data.reviews.slice(start, start+limit).length,
				"start": start,
				results: data.reviews.slice(start, start+limit),
			});
		});
	} else {
		sendJsonResponse(res, 404, "Unable to parse request params");
	}
}

// create review on post
module.exports.createPostReview = function(req, res) {
	if (req.params && req.params.postId) {
		post.findById(req.params.postId).exec(function (err, data) {
			if (!data) { // mongoose does not return data
				sendJsonResponse(res, 404, {"message": "postId not found"});
				return;
			} else if (err) {
				sendJsonResponse(res, 404, err);
				return;
			}

			// add review to reviews array
			temp = data.reviews.push({
				author: req.body.author,
				reviewText: req.body.commentText,
				rating: req.body.rating,
			});
			data.save(function (err, data) {
				if (err) {
					sendJsonResponse(res, 404, err);
				} else {
					sendJsonResponse(res, 200, data);
				}
			});
		});
	} else {
		sendJsonResponse(res, 404, "Unable to parse request params");
	}
}

// update review on post
module.exports.updatePostReview = function(req, res) {
	if (req.params && req.params.postId && req.params.reviewId) {
		post.findById(req.params.postId).exec(function (err, data) {
			if (!data) { // mongoose does not return data
				sendJsonResponse(res, 404, {"message": "postId not found"});
				return;
			} else if (err) {
				sendJsonResponse(res, 404, err);
				return;
			}

			// add review to reviews array
			reviews = data.reviewText;
			for (var i = reviews.length - 1; i >= 0; i--) {
				if (String(reviews[i]._id) === req.params.reviewId) {
					reviews[i] = {
						author: reviews[i].author,
						reviewText: req.body.reviewText ? req.body.reviewText : "",
						rating: req.body.rating ? req.body.rating : "0",
					};
				}
			}
			data.reviews = reviews;

			data.save(function (err, data) {
				if (err) {
					sendJsonResponse(res, 404, err);
				} else {
					sendJsonResponse(res, 200, data);
				}
			});
		});
	} else {
		sendJsonResponse(res, 404, "Unable to parse request params");
	}
}

// delete review on post
module.exports.deletePostReview = function(req, res) {
	if (req.params && req.params.postId && req.params.reviewId) {
		post.findById(req.params.postId).exec(function (err, data) {
			if (!data) { // mongoose does not return data
				sendJsonResponse(res, 404, {"message": "postId not found"});
				return;
			} else if (err) {
				sendJsonResponse(res, 404, err);
				return;
			}

			// add review to reviews array
			reviews = data.reviews;
			for (var i = reviews.length - 1; i >= 0; i--) {
				if (String(reviews[i]._id) === req.params.reviewId) {
					reviews.splice(i,1);
				}
			}
			data.reviews = reviews;

			data.save(function (err, data) {
				if (err) {
					sendJsonResponse(res, 404, err);
				} else {
					sendJsonResponse(res, 200, data);
				}
			});
		});
	} else {
		sendJsonResponse(res, 404, "Unable to parse request params");
	}
}