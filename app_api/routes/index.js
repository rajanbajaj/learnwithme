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

// members
router.get('/members', membersController.membersList);
router.post('/members', membersController.membersCreate);
router.get('/members/:memberId', membersController.membersReadOne);
router.put('/members/:memberId', membersController.membersUpdateOne);
router.delete('/members/:memberId', membersController.membersDeleteOne);

module.exports = router;
