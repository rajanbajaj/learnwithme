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
const fs = require('fs');
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

  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
});

const upload = multer({storage: storage});

// posts
router.get('/posts/count', postsController.countPosts);
router.get('/posts/latest', postsController.readLatestPost);

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
router.get('/posts/:postId/reviews', postsController.readPostReviews);
router.post('/posts/:postId/reviews/:memberId', postsController.createPostReview);
router.put('/posts/:postId/reviews/:reviewId', postsController.updatePostReview);
router.delete('/posts/:postId/reviews/:reviewId', postsController.deletePostReview);

// members
router.get('/members/count', membersController.countMembers);
router.get('/members', membersController.membersList);
router.post('/members', membersController.membersCreate);
router.get('/members/:memberId', membersController.membersReadOne);
router.put('/members/:memberId', membersController.membersUpdateOne);
router.delete('/members/:memberId', membersController.membersDeleteOne);

// mediaGroup
router.get('/media-group/count', mediaController.countMediaGroup);
router.get('/media-group', mediaController.readMediaGroup);
router.post('/media-group', mediaController.createMediaGroup);
router.put('/media-group/:mediaGroupId', mediaController.updateMediaGroup);
router.delete('/media-group/:mediaGroupId', mediaController.deleteMediaGroup);

// media
router.get('/media/count', mediaController.countMedia);
router.get('/media', mediaController.readMedia);
router.post('/:mediaGroupId/media', upload.single('file'), mediaController.createMedia);
router.put('/media/:mediaId', mediaController.updateMedia);
router.delete('/media/:mediaId', mediaController.deleteMedia);

// video
router.get('/video', (req, res) => {
  console.log("video requested");
  const path = `storage/test-videos/1631284949904-696899736-Ubuntu installation.m4a`;
    const stat = fs.statSync(path);
    const fileSize = stat.size;
    const range = req.headers.range;
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1]
            ? parseInt(parts[1], 10)
            : fileSize-1;
        const chunksize = (end-start) + 1;
        const file = fs.createReadStream(path, {start, end});
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(path).pipe(res);
    }
});

router.get('/video/:id', (req, res) => {
    const path = `assets/${req.params.id}.mp4`;
    const stat = fs.statSync(path);
    const fileSize = stat.size;
    const range = req.headers.range;
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1]
            ? parseInt(parts[1], 10)
            : fileSize-1;
        const chunksize = (end-start) + 1;
        const file = fs.createReadStream(path, {start, end});
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(path).pipe(res);
    }
});

module.exports = router;
