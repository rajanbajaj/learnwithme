const mongoose = require('mongoose');

var mediaGroupSchema = new mongoose.Schema({
	name: {type: String, required: true},	// name to be displayed
	path: {type: String, required: true},	// path of directory in fs
	attributes: {type:
		{
			readOnly: Boolean,
			hidden: Boolean,
		},
	},
	security: {
		type: {
			group: [mongoose.Schema.Types.ObjectId],
			owner: {type: mongoose.Schema.Types.ObjectId, required: true},
			permissions: {type: String, default: "d777"} // directory with 777 permissions
		}
	}
}, {
	timestamps: true,
});

var mediaSchema = new mongoose.Schema({
	filename: {type: String, required: true},	// name to be displayed
	originalname: {type: String, required: true},	// name to be displayed
	mediaGroup: {type: mongoose.Schema.Types.ObjectId, ref: 'MediaGroup'},
	encoding: {type: String},
	mimetype: {type: String},
	size: {type: Number},
	attributes: {type:
		{
			readOnly: Boolean,
			hidden: Boolean,
		},
	},
	security: {
		type: {
			group: [mongoose.Schema.Types.ObjectId],
			owner: {type: mongoose.Schema.Types.ObjectId, ref: 'Member'},
			permissions: {type: String, "default": "-777"} // directory with 777 permissions
		}
	}
}, {
	timestamps: true,
});

mongoose.model("Media", mediaSchema);
mongoose.model("MediaGroup", mediaGroupSchema);