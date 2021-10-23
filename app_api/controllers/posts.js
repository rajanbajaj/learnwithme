const mongoose = require('mongoose');
// const logger = require('../../logger');
const post = mongoose.model('Post');
const comment = mongoose.model('Comment');
const review = mongoose.model('Review');
const Like = mongoose.model('Like');
const Bookmark = mongoose.model('Bookmark');
// const client = require("../cache/redisDb");

const sendJsonResponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

const onlyUnique = function(value, index, self) {
  return self.indexOf(value) === index;
};

module.exports.countPosts = function(req, res) {
  const keyword = req.query && req.query.keyword ? req.query.keyword : null;
  const status = req.query && req.query.status ? req.query.status : null;
  let queryJSON = {};
  // let linkBase = '/api/posts?';

  if (keyword) {
    queryJSON.tags = {$elemMatch: {$regex: keyword}};
    // linkBase = linkBase+`keyword=${keyword}&`;
  }

  if (status) {
    queryJSON.publish_status = status;
    if (status !== 'PUBLIC') {
      queryJSON.id = req.user.id;
    }
    // linkBase = linkBase+"status="+status+"&";
  } else {
    queryJSON.publish_status = 'PUBLIC';
  }

  post.countDocuments(queryJSON).exec(function(err, count) {
    if (err) { // mongoose returned error
      sendJsonResponse(res, 404, err);
      return;
    }

    // cache member data for 3600 secs
    // client.set(req.params.memberId, JSON.stringify(data.toJSON()), 'EX', 3600);

    sendJsonResponse(res, 200, count);
  });
};

// read latest post
module.exports.readLatestPost = function(req, res) {
  post.findOne({})
      .sort({
        createdAt: 'desc',
      })
      .exec(function(err, data) {
        if (!data) { // mongoose does not return data
          sendJsonResponse(res, 404, {'message': 'postId not found'});
          return;
        } else if (err) { // mongoose returned error
          sendJsonResponse(res, 404, err);
          return;
        }

        // cache member data for 3600 secs
        // client.set(req.params.postId, JSON.stringify(data.toJSON()), 'EX', 3600);

        sendJsonResponse(res, 200, data);
      });
};

module.exports.postsReadOne = function(req, res) {
  if (req.params && req.params.postId) {
    post.findById(req.params.postId).exec(function(err, data) {
      if (!data) { // mongoose does not return data
        sendJsonResponse(res, 404, {'message': 'postId not found'});
        return;
      } else if (err) { // mongoose returned error
        sendJsonResponse(res, 404, err);
        return;
      }

      // cache member data for 3600 secs
      // client.set(req.params.postId, JSON.stringify(data.toJSON()), 'EX', 3600);

      sendJsonResponse(res, 200, data);
    });
  } else {
    sendJsonResponse(res, 404, {'message': 'postId no found in request'});
  }
};

module.exports.postsList = function(req, res) {
  const limit = req.query.limit ? Math.max(0, req.query.limit) : 10;
  const start = req.query.start ? Math.max(0, req.query.start) : 0;
  const keyword = req.query && req.query.keyword ? req.query.keyword : null;
  const status = req.query && req.query.status ? req.query.status : null;
  let queryJSON = {};
  let linkBase = '/api/posts?';

  if (keyword) {
    queryJSON.tags = {$elemMatch: {$regex: keyword}};
    linkBase = linkBase+`keyword=${keyword}&`;
  }

  if (status) {
    queryJSON.publish_status = status;
    if (status !== 'PUBLIC') {
      queryJSON.id = req.user.id;
    }
    linkBase = linkBase+"status="+status+"&";
  } else {
    queryJSON.publish_status = 'PUBLIC';
  }

  post.find(queryJSON)
  .skip(start)
  .limit(limit)
  .sort({
    updatedAt: 'desc',
  })
  .exec(function(err, data) {
    if (!data) {
      // mongoose does not return data
      sendJsonResponse(res, 404, {'message': 'Posts not found'});
      return;
    } else if (err) {
      // mongoose return error
      sendJsonResponse(res, 404, err);
      return;
    }

    sendJsonResponse(res, 200, {
      '_links': {
        base: req.headers.host,
        self: linkBase+'start=' + String(start) + '&limit=' + limit,
        prev: linkBase+'start=' + (start-limit>=0 ? String((start-limit)) : '0') + '&limit=' + limit,
        next: linkBase+'start=' + String(start+limit) + '&limit=' + limit,
      },
      'limit': limit,
      'size': data.length,
      'start': start,
      'results': data,
    });
  });
};

module.exports.postsCreate = function(req, res) {
  post.create({
    title: req.body.title && req.body.title.length > 0 ? req.body.title : 'Untitled '+(new Date()).toLocaleString(),
    publish_status: req.body.publish_status,
    author: req.body.author,
    body: req.body.body,
    // TODO: automate summary part
    summary: req.body.body,
    rating: req.body.rating,
    tags: req.body.tags.split(',').filter(onlyUnique),
    // TODO: create tags based on content
  }, function(err, data) {
    if (err) {
      sendJsonResponse(res, 400, err);
    } else {
      sendJsonResponse(res, 201, data);
    }
  });
};

module.exports.postsUpdateOne = function(req, res) {
  if (req.params && req.params.postId) {
    post.findById(req.params.postId).exec(function(err, data) {
      if (!data) { // mongoose does not return data
        sendJsonResponse(res, 404, {'message': 'postId not found'});
        return;
      } else if (err) {
        sendJsonResponse(res, 404, err);
        return;
      }

      // update attributes
      data.title = req.body.title;
      data.author = req.body.author;
      data.body = req.body.body;
      data.summary = req.body.body;
      // TODO: automate summary part
      data.rating = req.body.rating;
      data.tags = req.body.tags.split(',').filter(onlyUnique);
      data.save(function(err, data) {
        if (err) {
          sendJsonResponse(res, 404, err);
        } else {
          sendJsonResponse(res, 200, data);
        }
      });
    });
  } else {
    sendJsonResponse(res, 404, {'message': 'postId not found in request'});
  }
};

module.exports.postsDeleteOne = function(req, res) {
  if (req.params && req.params.postId) {
    post.findByIdAndRemove(req.params.postId).exec(function(err, data) {
      if (err) {
        sendJsonResponse(res, 404, err);
        return;
      }

      // TODO: delete related comments, reviews, and likes

      sendJsonResponse(res, 204, null);
    });
  } else {
    sendJsonResponse(res, 404, {'message': 'postId not found in request'});
  }
};

module.exports.readPostComment = function(req, res) {
  const limit = req.query.limit ? Math.max(0, req.query.limit) : 10;
  const start = req.query.start ? Math.max(0, req.query.start) : 0;

  if (req.params && req.params.postId) {
    comment.find({post: req.params.postId}).exec(function(err, data) {
      if (!data) { // mongoose does not return data
        sendJsonResponse(res, 404, {'message': 'postId not found'});
        return;
      } else if (err) {
        sendJsonResponse(res, 404, err);
        return;
      }

      sendJsonResponse(res, 200, {
        '_links': {
          base: req.headers.host,
          self: `/api/posts/${req.params.postId}/comments?start=` +
                String(start) +
                '&limit=' + limit,
          prev: `/api/posts/${req.params.postId}/comments?start=` +
                (start-limit>=0 ? String((start-limit)) : '0') +
                '&limit=' + limit,
          next: `/api/posts/${req.params.postId}/comments?start=` +
                String(start+limit) +
                '&limit=' + limit,
        },
        'limit': limit,
        'size': data.length,
        'start': start,
        'results': data,
      });
    });
  } else {
    sendJsonResponse(res, 404, 'Unable to parse request params');
  }
};

module.exports.createPostComment = function(req, res) {
  if (req.body && req.params && req.params.postId && req.params.memberId && req.body.commentText) {
    comment.create({
      commentText: req.body.commentText,
      author: req.params.memberId,
      post: req.params.postId,
    }, function(err, data) {
      if (err) {
        sendJsonResponse(res, 400, err);
      } else {
        sendJsonResponse(res, 201, data);
      }
    });
  } else {
    sendJsonResponse(res, 404, 'Unable to parse request params');
  }
};

// update comment on post
module.exports.updatePostComment = function(req, res) {
  if (req.params && req.params.postId && req.params.commentId && req.body.commentText) {
    comment.findById(req.params.commentId).exec(function(err, data) {
      if (!data) { // mongoose does not return data
        sendJsonResponse(res, 404, {'message': 'commentId not found'});
        return;
      } else if (err) {
        sendJsonResponse(res, 404, err);
        return;
      }

      data.commentText = req.body.commentText;

      data.save(function(err, data) {
        if (err) {
          sendJsonResponse(res, 404, err);
        } else {
          sendJsonResponse(res, 200, data);
        }
      });
    });
  } else {
    sendJsonResponse(res, 404, 'Unable to parse request params');
  }
};

// delete comment on post
module.exports.deletePostComment = function(req, res) {
  if (req.params && req.params.postId && req.params.commentId) {
    comment.findByIdAndRemove(req.params.commentId).exec(function(err, data) {
      if (err) {
        sendJsonResponse(res, 404, err);
        return;
      }

      // TODO: delete related replies, reviews, and likes

      sendJsonResponse(res, 204, null);
    });
  } else {
    sendJsonResponse(res, 404, {'message': 'postId not found in request'});
  }
};

/**
 * POST REVIEWS
*/

// read reviews on post
module.exports.readPostReviews = function(req, res) {
  const limit = req.query.limit ? Math.max(0, req.query.limit) : 10;
  const start = req.query.start ? Math.max(0, req.query.start) : 0;

  if (req.params && req.params.postId) {
    review.find({post: req.params.postId}).exec(function(err, data) {
      if (!data) { // mongoose does not return data
        sendJsonResponse(res, 404, {'message': 'postId not found'});
        return;
      } else if (err) {
        sendJsonResponse(res, 404, err);
        return;
      }

      sendJsonResponse(res, 200, {
        '_links': {
          base: req.headers.host,
          self: `/api/posts/${req.params.postId}/reviews?start=` + String(start) + '&limit=' + limit,
          prev: `/api/posts/${req.params.postId}/reviews?start=` +
                (start-limit>=0 ? String((start-limit)) : '0') +
                '&limit=' + limit,
          next: `/api/posts/${req.params.postId}/reviews?start=` +
                String(start+limit) + '&limit=' + limit,
        },
        'limit': limit,
        'size': data.length,
        'start': start,
        'results': data,
      });
    });
  } else {
    sendJsonResponse(res, 404, 'Unable to parse request params');
  }
};

// create review on post
module.exports.createPostReview = function(req, res) {
  if (req.body && req.params && req.params.postId && req.params.memberId && req.body.reviewText) {
    review.create({
      reviewText: req.body.reviewText,
      author: req.params.memberId,
      post: req.params.postId,
    }, function(err, data) {
      if (err) {
        sendJsonResponse(res, 400, err);
      } else {
        sendJsonResponse(res, 201, data);
      }
    });
  } else {
    sendJsonResponse(res, 404, 'Unable to parse request params');
  }
};

// update review on post
module.exports.updatePostReview = function(req, res) {
  if (req.params && req.params.postId && req.params.reviewId && req.body.reviewText) {
    review.findById(req.params.reviewId).exec(function(err, data) {
      if (!data) { // mongoose does not return data
        sendJsonResponse(res, 404, {'message': 'reviewId not found'});
        return;
      } else if (err) {
        sendJsonResponse(res, 404, err);
        return;
      }

      data.reviewText = req.body.reviewText;

      data.save(function(err, data) {
        if (err) {
          sendJsonResponse(res, 404, err);
        } else {
          sendJsonResponse(res, 200, data);
        }
      });
    });
  } else {
    sendJsonResponse(res, 404, 'Unable to parse request params');
  }
};

// delete review on post
module.exports.deletePostReview = function(req, res) {
  if (req.params && req.params.postId && req.params.reviewId) {
    review.findByIdAndRemove(req.params.reviewId).exec(function(err, data) {
      if (err) {
        sendJsonResponse(res, 404, err);
        return;
      }

      // TODO: delete likes

      sendJsonResponse(res, 204, null);
    });
  } else {
    sendJsonResponse(res, 404, {'message': 'postId not found in request'});
  }
};

module.exports.readPostLikesCount = function(req, res) {
  if (req.params && req.params.postId) {
    Like.countDocuments({post: req.params.postId}).exec(function(err, count) {
      if (err) { // mongoose returned error
        sendJsonResponse(res, 404, err);
        return;
      }
      sendJsonResponse(res, 200, count);
    });
  } else {
    sendJsonResponse(res, 404, {'message': 'postId not found in request'});
  }
};

module.exports.readPostLikesCountByMember = function(req, res) {
  if (req.params && req.params.postId && req.params.memberId) {
    Like.countDocuments({post: req.params.postId, author: req.params.memberId}).exec(function(err, count) {
      if (err) { // mongoose returned error
        sendJsonResponse(res, 404, err);
        return;
      }
      sendJsonResponse(res, 200, count);
    });
  } else {
    sendJsonResponse(res, 404, {'message': 'postId not found in request'});
  }
};

module.exports.togglePostLikeByMember = function(req, res) {
  if (req.params && req.params.postId && req.params.memberId) {
    Like.find({post: req.params.postId, author: req.params.memberId}).exec(function(err, data) {
      if (!data) { // mongoose does not return data
        sendJsonResponse(res, 404, "Not Found");
        return;
      } else if (err) {
        sendJsonResponse(res, 404, err);
        return;
      } else {
        if (data.length === 0) {
          // create
          Like.create({
            author: req.params.memberId,
            post: req.params.postId,
          }, function(err, data) {
            if (err) {
              sendJsonResponse(res, 400, err);
            } else {
              sendJsonResponse(res, 201, data);
            }
          });
        } else {
          // delete likes
          const ids = [];
          data.forEach((ele) => {
            ids.push(ele._id);
          });

          Like.deleteMany({_id: {$in: ids}}, function(err) {
            if (err) {
              sendJsonResponse(res, 404, err);
            } else {
              sendJsonResponse(res, 204, null);
            }
          });
        }
      }
    });
  } else {
    sendJsonResponse(res, 404, 'Unable to parse request params');
  }
};

// bookmark
module.exports.readPostBookmarksCount = function(req, res) {
  if (req.params && req.params.postId) {
    Bookmark.countDocuments({post: req.params.postId}).exec(function(err, count) {
      if (err) { // mongoose returned error
        sendJsonResponse(res, 404, err);
        return;
      }
      sendJsonResponse(res, 200, count);
    });
  } else {
    sendJsonResponse(res, 404, {'message': 'postId not found in request'});
  }
};

module.exports.readPostBookmarksCountByMember = function(req, res) {
  if (req.params && req.params.postId && req.params.memberId) {
    Bookmark.countDocuments({post: req.params.postId, author: req.params.memberId}).exec(function(err, count) {
      if (err) { // mongoose returned error
        sendJsonResponse(res, 404, err);
        return;
      }
      sendJsonResponse(res, 200, count);
    });
  } else {
    sendJsonResponse(res, 404, {'message': 'postId not found in request'});
  }
};

module.exports.togglePostBookmarkByMember = function(req, res) {
  if (req.params && req.params.postId && req.params.memberId) {
    Bookmark.find({post: req.params.postId, author: req.params.memberId}).exec(function(err, data) {
      if (!data) { // mongoose does not return data
        sendJsonResponse(res, 404, 'Not Found');
        return;
      } else if (err) {
        sendJsonResponse(res, 404, err);
        return;
      } else {
        if (data.length === 0) {
          // create
          Bookmark.create({
            author: req.params.memberId,
            post: req.params.postId,
          }, function(err, data) {
            if (err) {
              sendJsonResponse(res, 400, err);
            } else {
              sendJsonResponse(res, 201, data);
            }
          });
        } else {
          // delete likes
          const ids = [];
          data.forEach((ele) => {
            ids.push(ele._id);
          });

          Bookmark.deleteMany({_id: {$in: ids}}, function(err) {
            if (err) {
              sendJsonResponse(res, 404, err);
            } else {
              sendJsonResponse(res, 204, null);
            }
          });
        }
      }
    });
  } else {
    sendJsonResponse(res, 404, 'Unable to parse request params');
  }
};
