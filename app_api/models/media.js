const mongoose = require('mongoose');

const mediaGroupSchema = new mongoose.Schema({
  // name to be displayed
  name: {type: String, required: true},
  // path of directory in fs
  path: {type: String, required: true},
  attributes: {
    type: {
      readOnly: Boolean,
      hidden: Boolean,
    },
  },
  security: {
    type: {
      group: [mongoose.Schema.Types.ObjectId],
      owner: {type: mongoose.Schema.Types.ObjectId},
      // directory with 777 permissions
      permissions: {type: String, default: 'd777'},
    },
  },
}, {
  timestamps: true,
});

const mediaSchema = new mongoose.Schema({
  // name to be displayed
  filename: {type: String, required: true},
  // name to be displayed
  originalname: {type: String, required: true},
  mediaGroup: {type: mongoose.Schema.Types.ObjectId, ref: 'MediaGroup'},
  encoding: {type: String},
  mimetype: {type: String},
  size: {type: Number},
  attributes: {
    type: {
      readOnly: Boolean,
      hidden: Boolean,
    },
  },
  security: {
    type: {
      group: [mongoose.Schema.Types.ObjectId],
      owner: {type: mongoose.Schema.Types.ObjectId, ref: 'Member'},
      // directory with 777 permissions
      permissions: {'type': String, 'default': '-777'},
    },
  },
}, {
  timestamps: true,
});

module.exports.Media = mongoose.model('Media', mediaSchema);
module.exports.MediaGroup = mongoose.model('MediaGroup', mediaGroupSchema);
