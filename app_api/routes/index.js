const express = require('express');
const router = express.Router();
const postsController = require('../controllers/posts');
const membersController = require('../controllers/members');
const mediaController = require('../controllers/media');
// const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const MediaGroup = mongoose.model('MediaGroup');
const multer = require('multer');
const baseDir = 'storage';
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    let uploadPath = null;
    if (req.body && req.body.mediaGroupId) {
      MediaGroup.findById(req.body.mediaGroupId)
          .exec(function(err, data) {
            if (!data) { // mongoose does not return data
              cb(new Error('OOPS! Uplaod failed!1'));
              return;
            } else if (err) { // mongoose returned error
              cb(new Error('OOPS! Uplaod failed!1'));
              return;
            }

            uploadPath = baseDir+data.path+data.name;
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
});

const upload = multer({storage: storage});

// posts
router.get('/posts', postsController.postsList);
router.post('/posts', postsController.postsCreate);
router.get('/posts/:postId', postsController.postsReadOne);
router.put('/posts/:postId', postsController.postsUpdateOne);
router.delete('/posts/:postId', postsController.postsDeleteOne);

// post comments
router.get('/posts/:postId/comments', postsController.readPostComment);
router.post('/posts/:postId/comments/:memberId', postsController.createPostComment);
router.put('/posts/:postId/comments/:commentId', postsController.updatePostComment);
router.delete('/posts/:postId/comments/:commentId', postsController.deletePostComment);

// post reviews
router.get('/posts/:postId/reviews', postsController.readPostReviews);
router.post('/posts/:postId/reviews/:memberId', postsController.createPostReview);
router.put('/posts/:postId/reviews/:reviewId', postsController.updatePostReview);
router.delete('/posts/:postId/reviews/:reviewId', postsController.deletePostReview);

// members
router.get('/members', membersController.membersList);
router.post('/members', membersController.membersCreate);
router.get('/members/:memberId', membersController.membersReadOne);
router.put('/members/:memberId', membersController.membersUpdateOne);
router.delete('/members/:memberId', membersController.membersDeleteOne);

// mediaGroup
router.get('/media-group', mediaController.readMediaGroup);
router.post('/media-group', mediaController.createMediaGroup);
router.put('/media-group/:mediaGroupId', mediaController.updateMediaGroup);
router.delete('/media-group/:mediaGroupId', mediaController.deleteMediaGroup);

// media
router.get('/media', mediaController.readMedia);
router.post('/media', upload.single('file'), mediaController.createMedia);
router.put('/media/:mediaId', mediaController.updateMedia);
router.delete('/media/:mediaId', mediaController.deleteMedia);

module.exports = router;
