const mongoose = require('mongoose');

var memberSchema = new mongoose.Schema({
	name: {type: String, required: true},
	email: {type: String, required: true},
	password: {type: String, required: true},
	bio: {type: String},
	gravatar: {type: String},
	birthdate: {type: Date, required: true},
	addressLine1: String,
	addressLine2: String,
	country: {type: String, required: true},
	state: String,
	pincode: {type: Number, required: true},
}, {
	timestamps: true,
});

mongoose.model("Member", memberSchema);