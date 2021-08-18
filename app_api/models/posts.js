// TODO: 
// 1. track IPs
// 2. reply functionality for comments
var mongoose = require('mongoose');

var likeSchema = new mongoose.Schema({
	author: String,
	createdOn: {type: Date, "default": Date.now}
});

var reviewSchema = new mongoose.Schema({
	author: String,
	rating: {type: Number, "default": 0, min: 0, max: 5},
	reviewText: String,
	likes: [likeSchema],
	like_count: {type: Number, "default": 0},	// increments on liking a review
	createdOn: {type: Date, "default": Date.now}
});

var commentSchema = new mongoose.Schema({
	author: String,
	commentText: String,
	likes: [likeSchema],
	like_count: {type: Number, "default": 0},	// increments on liking a comment
	createdOn: {type: Date, "default": Date.now}
})

var postSchema = new mongoose.Schema({
	title: {type: String, required: true},
	publish_status: {type: String, default: "DRAFT"},
	author: String,
	body: String,
	summary: String,
	rating: {type: Number, "default": 0, min: 0, max: 5}, // avg of all review ratings
	tags: [String],
	comments: [commentSchema],
	reviews: [reviewSchema],
	likes: [likeSchema], // array of member_ids :: column used for analytics and not frontend
	like_count: {type: Number, "default": 0},	// increments on liking a post
	createdOn: {type: Date, "default": Date.now}
});

mongoose.model('Post', postSchema);