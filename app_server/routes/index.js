const express = require('express');
const router = express.Router();
const mainController = require('../controllers/main');

router.get('/', mainController.index);
router.get('/delete/:postId', mainController.deletePost);
router.post('/register', mainController.registerPost);
router.post('/edit', mainController.editPost);
router.post('/uploads', mainController.uploadFiles);
router.get('/getFiles', mainController.getFiles);

module.exports = router;
