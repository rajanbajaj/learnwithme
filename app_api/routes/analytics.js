const express = require('express');
const router = express.Router();
const postsController = require('../controllers/posts');
const membersController = require('../controllers/members');
const mediaController = require('../controllers/media');
const loginController = require('../controllers/auth/login');
const mongoose = require('mongoose');
const {authenticate} = require('../middlewares/authentication');

// posts
router.get('/posts/count', authenticate, postsController.countPosts);
router.get('/posts/latest', authenticate, postsController.readLatestPost);
router.get('/media/count', authenticate, mediaController.countMedia);
router.get('/media-groups/count', authenticate, mediaController.countMediaGroup);

module.exports = router;