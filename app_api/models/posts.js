// TODO:
// 1. track IPs
// 2. reply functionality for comments
// 3. Test db caching layer
const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  post: {type: mongoose.Schema.Types.ObjectId, ref: 'Post'},
  author: {type: mongoose.Schema.Types.ObjectId, ref: 'Member'},
}, {
  timestamps: true,
});
const likeSchema = new mongoose.Schema({
  post: {type: mongoose.Schema.Types.ObjectId, ref: 'Post'},
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
  title: {type: String},
  publish_status: {type: String, default: 'DRAFT'},
  body: String,
  tags: [String],
  banner: String,
  author: {type: mongoose.Schema.Types.ObjectId, ref: 'Member'},
  comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
}, {
  timestamps: true,
});

module.exports.Post = mongoose.model('Post', postSchema);
module.exports.Comment = mongoose.model('Comment', commentSchema);
module.exports.Review = mongoose.model('Review', reviewSchema);
module.exports.Like = mongoose.model('Like', likeSchema);
module.exports.Bookmark = mongoose.model('Bookmark', bookmarkSchema);
