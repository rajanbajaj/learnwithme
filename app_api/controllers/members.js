var mongoose = require('mongoose');
var member = mongoose.model('Member');

var sendJsonResponse = function(res, status, content) { 
 res.status(status); 
 res.json(content); 
};

module.exports.membersReadOne = function (req, res) {
	if (req.params && req.params.memberId) {
		member.findById(req.params.memberId).exec(function (err, data) {
			if (!data) { // mongoose does not return data
				sendJsonResponse(res, 404, {"message": "memberId not found"});
				return;
			} else if (err) { // mongoose returned error
				sendJsonResponse(res, 404, err);
				return;
			}
			sendJsonResponse(res, 200, data);
		});
	} else {
		sendJsonResponse(res, 404, {"message": "memberId no found in request"});
	}
};

module.exports.membersList = function (req, res) { 
	member.find().exec(function (err, data) {
		if (!data) {	// mongoose does not return data
			sendJsonResponse(res, 404, {"message": "Members not found"});
			return;
		} else if (err) {	// mongoose return error
			sendJsonResponse(res, 404, err)
			return;
		}
		sendJsonResponse(res, 200, data);
	});
};

module.exports.membersCreate = function (req, res) {
	member.create({
		name: req.body.name,
		username: req.body.username,
		birthdate: req.body.birthdate,
		addressLine1: req.body.addressLine1,
		addressLine2: req.body.addressLine2,
		country: req.body.country,
		state: req.body.state,
		pincode: req.body.pincode
	}, function (err, data) {
		if (err) {
			sendJsonResponse(res, 400, err);
		} else {
			sendJsonResponse(res, 201, data);
		}
	});
};


module.exports.membersUpdateOne = function (req, res) {
	if (req.params && req.params.memberId) {
		member.findById(req.params.memberId).exec(function (err, data) {
			if (!data) { // mongoose does not return data
				sendJsonResponse(res, 404, {"message": "memberId not found"});
				return;
			} else if (err) {
				sendJsonResponse(res, 404, err);
				return;
			}

			// update attributes
			data.name = req.body.name;
			data.username = req.body.username;
			data.birthdate = req.body.birthdate;
			data.addressLine1 = req.body.addressLine1;
			data.addressLine2 = req.body.addressLine2;
			data.country = req.body.country;
			data.state = req.body.state;
			data.pincode = req.body.pincode;
			data.save(function (err, data) {
				if (err) {
					sendJsonResponse(res, 404, err);
				} else {
					sendJsonResponse(res, 200, data);
				}
			});
		});
	} else {
		sendJsonResponse(res, 404, {"message": "memberId not found in request"});
	}
};

module.exports.membersDeleteOne = function (req, res) {
	if (req.params && req.params.memberId) {
		member.findByIdAndRemove(req.params.memberId).exec(function (err, data) {
			if (err) {
				sendJsonResponse(res, 404, err);
				return;
			}
			sendJsonResponse(res, 204, null);
		});
	} else {
		sendJsonResponse(res, 404, {"message": "memberId not found in request"});
	}
};