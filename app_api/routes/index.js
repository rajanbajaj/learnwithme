var express = require('express');
var router = express.Router();
var postsController = require('../controllers/posts');
var membersController = require('../controllers/members');

// posts
router.get('/posts', postsController.postsList);
router.post('/posts', postsController.postsCreate);
router.get('/posts/:postId', postsController.postsReadOne);
router.put('/posts/:postId', postsController.postsUpdateOne);
router.delete('/posts/:postId', postsController.postsDeleteOne);

// post comments
router.get('/posts/:postId/comments', postsController.readPostComment);
router.post('/posts/:postId/comments', postsController.createPostComment);
router.put('/posts/:postId/comments/:commentId', postsController.updatePostComment);
router.delete('/posts/:postId/comments/:commentId', postsController.deletePostComment);

// post reviews
router.get('/posts/:postId/reviews', postsController.readPostReviwes);
router.post('/posts/:postId/reviews', postsController.createPostReview);
router.put('/posts/:postId/reviews/:reviewId', postsController.updatePostReview);
router.delete('/posts/:postId/reviews/:reviewId', postsController.deletePostReview);

// members
router.get('/members', membersController.membersList);
router.post('/members', membersController.membersCreate);
router.get('/members/:memberId', membersController.membersReadOne);
router.put('/members/:memberId', membersController.membersUpdateOne);
router.delete('/members/:memberId', membersController.membersDeleteOne);

module.exports = router;
