// TODO:
// 1. track IPs
// 2. reply functionality for comments
// 3. Test db caching layer
const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  author: {type: mongoose.Schema.Types.ObjectId, ref: 'Member'},
}, {
  timestamps: true,
});

const reviewSchema = new mongoose.Schema({
  rating: {'type': Number, 'default': 0, 'min': 0, 'max': 5},
  reviewText: {type: String, required: true},
  post: {type: mongoose.Schema.Types.ObjectId, ref: 'Post'},
  author: {type: mongoose.Schema.Types.ObjectId, ref: 'Member'},
}, {
  timestamps: true,
});

const commentSchema = new mongoose.Schema({
  commentText: {type: String, required: true},
  author: {type: mongoose.Schema.Types.ObjectId, ref: 'Member'},
  post: {type: mongoose.Schema.Types.ObjectId, ref: 'Post'},
}, {
  timestamps: true,
});

const postSchema = new mongoose.Schema({
  title: {type: String, required: true},
  publish_status: {type: String, default: 'DRAFT'},
  body: String,
  tags: [String],
  author: {type: mongoose.Schema.Types.ObjectId, ref: 'Member'},
  comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
}, {
  timestamps: true,
});

mongoose.model('Post', postSchema);
mongoose.model('Comment', commentSchema);
mongoose.model('Review', reviewSchema);
mongoose.model('Like', likeSchema);
