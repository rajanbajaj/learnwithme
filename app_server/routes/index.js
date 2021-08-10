var express = require('express');
var router = express.Router();
var mainController = require('../controllers/main');

router.get('/', mainController.index);
router.get('/delete/:postId', mainController.deletePost);
router.post('/register', mainController.registerPost);
router.post('/edit', mainController.editPost);

module.exports = router;
