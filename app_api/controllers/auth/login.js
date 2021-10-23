const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const {Member} = require('../../models/members');


const sendJsonResponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.login = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  Member.find({email: email}).exec(function(err, data) {
    if (!data || data.length === 0) {
      // mongoose does not return data
      sendJsonResponse(res, 401, {'message': 'Invalid Credntials'});
      return;
    } else if (err) {
      // mongoose return error
      sendJsonResponse(res, 500, err);
      return;
    }

    argon2.verify(data[0].password, password).then((value) => {
      if (value) {
        const user = {
          email: email,
          id: data[0]._id,
          gravatar: data[0].gravatar,
          name: data[0].name,
        };
        const accessToken = jwt.sign(user, process.env.ACESS_TOKEN_SECRET, {expiresIn: '24h'});
        res.json({accessToken: accessToken});
      } else {
        sendJsonResponse(res, 401, {'message': 'Invalid Credntials'});
      }
    }).catch((e) => {
      sendJsonResponse(res, 500, {'message': 'Server Error', 'error': e});
      return;
    });
  });
};
