var mongoose = require('mongoose');

var memberSchema = new mongoose.Schema({
	name: {type: String, required: true},
	username: {type: String, required: true},
	birthdate: {type: Date, required: true},
	addressLine1: String,
	addressLine2: String,
	country: {type: String, required: true},
	state: String,
	pincode: {type: Number, required: true}
});

mongoose.model("Member", memberSchema);