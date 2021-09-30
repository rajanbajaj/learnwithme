const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const member = require('mongoose').model('Member');


const sendJsonResponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.login = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  member.find({email: email}).exec(function(err, data) {
    if (!data || data.length === 0) {
      // mongoose does not return data
      sendJsonResponse(res, 401, {'message': 'Invalid Credntials'});
      return;
    } else if (err) {
      // mongoose return error
      sendJsonResponse(res, 500, err);
      return;
    }

    argon2.verify(data[0].password, password).then(() => {
      // password match
      const user = {email: email};
      const accessToken = jwt.sign(user, process.env.ACESS_TOKEN_SECRET, {expiresIn: '24h'});
      res.json({accessToken: accessToken});
    }).catch(() => {
      sendJsonResponse(res, 401, {'message': 'Invalid Credntials cr'});
      return;
    });
  });
};
