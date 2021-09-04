const mongoose = require('mongoose');
const readLine = require('readline');
const logger = require('../../logger');

require('./posts');
require('./members');
require('./media');

let dbURI = 'mongodb://127.0.0.1/learnwithme';
if (process.env.NODE_ENV === 'production') {
  dbURI = 'mongodb+srv://admin:admin@lonewolf-x1.pn9g6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
}
if (process.env.NODE_ENV === 'test') {
  dbURI = 'mongodb://127.0.0.1/learnwithme';
}

mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true});

// catch SIGINT on windows
if (process.platform === 'win32') {
  const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.on('SIGINT', function() {
    process.emit('SIGINT');
  });
}


mongoose.connection.on('connected', function() {
  logger.info('Mongoose connected to ' + dbURI);
});
mongoose.connection.on('error', function(err) {
  logger.error('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function() {
  logger.info('Mongoose disconnected');
});
