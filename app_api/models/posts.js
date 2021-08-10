var mongoose = require('mongoose');

var reviewSchema = new mongoose.Schema({
	author: String,
	rating: {type: Number, "default": 0, min: 0, max: 5},
	reviewText: String,
	createdOn: {type: Date, "default": Date.now}
});

var postSchema = new mongoose.Schema({
	title: {type: String, required: true},
	author: String,
	body: String,
	summary: String,
	rating: {type: Number, "default": 0, min: 0, max: 5},
	tags: [String],
	reviews: [reviewSchema],
	createdOn: {type: Date, "default": Date.now}
});

mongoose.model('Post', postSchema);