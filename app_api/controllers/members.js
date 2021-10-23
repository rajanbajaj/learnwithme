// TODO: update password separately
const mongoose = require('mongoose');
const gravatar = require('gravatar');
const argon2 = require('argon2');
const logger = require('../../logger');
// const client = require('../cache/redisDb');

const member = mongoose.model('Member');

const sendJsonResponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.countMembers = function(req, res) {
  member.countDocuments({}).exec(function(err, count) {
    if (err) { // mongoose returned error
      sendJsonResponse(res, 404, err);
      return;
    }

    // cache member data for 3600 secs
    // client.set(req.params.memberId, JSON.stringify(data.toJSON()), 'EX', 3600);

    sendJsonResponse(res, 200, count);
  });
};

module.exports.membersReadOne = function(req, res) {
  if (req.params && req.params.memberId) {
    member.findById(req.params.memberId).exec(function(err, data) {
      if (!data) { // mongoose does not return data
        sendJsonResponse(res, 404, {'message': 'memberId not found'});
        return;
      } else if (err) { // mongoose returned error
        sendJsonResponse(res, 404, err);
        return;
      }

      // cache member data for 3600 secs
      // client.set(req.params.memberId, JSON.stringify(data.toJSON()), 'EX', 3600);

      sendJsonResponse(res, 200, data);
    });
  } else {
    sendJsonResponse(res, 404, {'message': 'memberId no found in request'});
  }
};

module.exports.membersList = function(req, res) {
  const limit = req.query.limit ? Math.max(0, req.query.limit) : 10;
  const start = req.query.start ? Math.max(0, req.query.start) : 0;
  let queryJSON = {profileType: 'PUBLIC'}
  member.find(queryJSON)
      .skip(start)
      .limit(limit)
      .sort({
        name: 'asc',
      }).
      exec(function(err, data) {
        if (!data) {
          // mongoose does not return data
          sendJsonResponse(res, 404, {'message': 'Members not found'});
          return;
        } else if (err) {
          // mongoose return error
          sendJsonResponse(res, 404, err);
          return;
        }

        sendJsonResponse(res, 200, {
          '_links': {
            base: req.headers.host,
            self: '/api/members?start=' + String(start) + '&limit=' + limit,
            prev: '/api/members?start=' + (start-limit>=0 ? String((start-limit)) : '0') + '&limit=' + limit,
            next: '/api/members?start='+String(start+limit) + '&limit=' + limit,
          },
          'limit': limit,
          'size': data.length,
          'start': start,
          'results': data,
        });
      });
};

module.exports.membersCreate = function(req, res) {
  if (req.body && req.body.password) {
    argon2.hash(req.body.password).then((hashedPassword)=> {
      member.create({
        name: req.body.name,
        profileType: req.body.profileType,
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
        gravatar: gravatar.url(req.body.email, {protocol: 'https', s: '100'}),
        birthdate: req.body.birthdate,
        addressLine1: req.body.addressLine1,
        addressLine2: req.body.addressLine2,
        country: req.body.country,
        state: req.body.state,
        pincode: req.body.pincode,
      }, function(err, data) {
        if (err) {
          sendJsonResponse(res, 400, err);
        } else {
          sendJsonResponse(res, 201, data);
        }
      });
    }).catch((err)=>logger.error(JSON.stringify(err)));
  } else {
    sendJsonResponse(res, 400, {'message': 'password field missing!'});
  }
};


module.exports.membersUpdateOne = function(req, res) {
  if (req.params && req.params.memberId) {
    member.findById(req.params.memberId).exec(function(err, data) {
      if (!data) { // mongoose does not return data
        sendJsonResponse(res, 404, {'message': 'memberId not found'});
        return;
      } else if (err) {
        sendJsonResponse(res, 404, err);
        return;
      }

      // update attributes
      data.name = req.body.name;
      data.username = req.body.username;
      data.email = req.body.email;
      data.gravatar = gravatar.url(req.body.email, {protocol: 'https', s: '100'});
      data.birthdate = req.body.birthdate;
      data.addressLine1 = req.body.addressLine1;
      data.addressLine2 = req.body.addressLine2;
      data.country = req.body.country;
      data.state = req.body.state;
      data.pincode = req.body.pincode;
      data.save(function(err, data) {
        if (err) {
          sendJsonResponse(res, 404, err);
        } else {
          sendJsonResponse(res, 200, data);
        }
      });
    });
  } else {
    sendJsonResponse(res, 404, {'message': 'memberId not found in request'});
  }
};

module.exports.membersDeleteOne = function(req, res) {
  if (req.params && req.params.memberId) {
    member.findByIdAndRemove(req.params.memberId).exec(function(err, data) {
      if (err) {
        sendJsonResponse(res, 404, err);
        return;
      }
      sendJsonResponse(res, 204, null);
    });
  } else {
    sendJsonResponse(res, 404, {'message': 'memberId not found in request'});
  }
};
