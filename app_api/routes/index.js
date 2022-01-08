const express = require('express');
const router = express.Router();
const postsController = require('../controllers/posts');
const membersController = require('../controllers/members');
const mediaController = require('../controllers/media');
const loginController = require('../controllers/auth/login');
// const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const MediaGroup = mongoose.model('MediaGroup');
const multer = require('multer');
const baseDir = 'storage';
// const fs = require('fs');
const {authenticate} = require('../middlewares/authentication');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    let uploadPath = null;
    if (req.params && req.params.mediaGroupId) {
      MediaGroup.findById(req.params.mediaGroupId)
          .exec(function(err, data) {
            if (!data) { // mongoose does not return data
              cb(new Error('OOPS! Uplaod failed!1'));
              return;
            } else if (err) { // mongoose returned error
              cb(new Error('OOPS! Uplaod failed!1'));
              return;
            }

            uploadPath = `${baseDir}${data.path}${data.name}`;
            if (uploadPath !== null) {
              cb(null, uploadPath);
            } else {
              cb(new Error('OOPS! Uplaod failed!1'));
            }
          });
    } else {
      cb(new Error('OOPS! Uplaod failed!2'));
    }
  },

  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '_' + file.originalname.replace(' ', '_'));
  },
});

const upload = multer({storage: storage});

// posts
router.get('/posts/count', authenticate, postsController.countPosts);
router.get('/posts/latest', authenticate, postsController.readLatestPost);

router.get('/posts', authenticate, postsController.postsList);
router.post('/posts', authenticate, postsController.postsCreate);
router.get('/posts/:postId', authenticate, postsController.postsReadOne);
router.put('/posts/:postId', authenticate, postsController.postsUpdateOne);
router.delete('/posts/:postId', authenticate, postsController.postsDeleteOne);

// post comments
router.get('/posts/:postId/comments', authenticate, postsController.readPostComment);
router.post('/posts/:postId/comments/:memberId', authenticate, postsController.createPostComment);
router.put('/posts/:postId/comments/:commentId', authenticate, postsController.updatePostComment);
router.delete('/posts/:postId/comments/:commentId', authenticate, postsController.deletePostComment);

// post likes
router.get('/posts/:postId/likes/count', authenticate, postsController.readPostLikesCount);
router.get('/posts/:postId/likes/:memberId/count', authenticate, postsController.readPostLikesCountByMember);
router.post('/posts/:postId/likes/:memberId', authenticate, postsController.togglePostLikeByMember);
//router.delete('/posts/:postId/comments/:commentId', authenticate, postsController.deletePostComment);

// post bookmark
router.get('/posts/:postId/bookmarks/count', authenticate, postsController.readPostBookmarksCount);
router.get('/posts/:postId/bookmarks/:memberId/count', authenticate, postsController.readPostBookmarksCountByMember);
router.post('/posts/:postId/bookmarks/:memberId', authenticate, postsController.togglePostBookmarkByMember);


// post reviews
router.get('/posts/:postId/reviews', authenticate, postsController.readPostReviews);
router.post('/posts/:postId/reviews/:memberId', authenticate, postsController.createPostReview);
router.put('/posts/:postId/reviews/:reviewId', authenticate, postsController.updatePostReview);
router.delete('/posts/:postId/reviews/:reviewId', authenticate, postsController.deletePostReview);

// members
router.get('/members/count', authenticate, membersController.countMembers);
router.get('/members', authenticate, membersController.membersList);
router.post('/members', membersController.membersCreate);
router.get('/members/:memberId', authenticate, membersController.membersReadOne);
router.put('/members/:memberId', authenticate, membersController.membersUpdateOne);
router.delete('/members/:memberId', authenticate, membersController.membersDeleteOne);

// mediaGroup
router.get('/media-groups/count', authenticate, mediaController.countMediaGroup);
router.get('/media-groups', authenticate, mediaController.readMediaGroup);
//TODO: create route for media group by id
router.post('/media-groups', authenticate, mediaController.createMediaGroup);
router.put('/media-groups/:mediaGroupId', authenticate, mediaController.updateMediaGroup);
router.delete('/media-groups/:mediaGroupId', authenticate, mediaController.deleteMediaGroup);

// media
router.get('/media/count', authenticate, mediaController.countMedia);
router.get('/media', authenticate, mediaController.readMedia);
router.get('/:mediaGroupId/media', authenticate, mediaController.readMediaByMediaGroupId);
router.post('/:mediaGroupId/media', authenticate, upload.single('file'), mediaController.createMedia);
router.put('/media/:mediaId', authenticate, mediaController.updateMedia);
router.delete('/media/:mediaId', authenticate, mediaController.deleteMedia);

// authentication
router.post('/login', loginController.login);

module.exports = router;
