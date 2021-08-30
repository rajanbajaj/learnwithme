var mongoose = require('mongoose');
var readLine = require ("readline");
const logger = require('../../logger');

require('./posts');
require('./members');
require('./media');

var dbURI = 'mongodb://localhost/learnwithme';
if (process.env.NODE_ENV === 'production') {
    dbURI = 'mongodb+srv://admin:admin@lonewolf-x1.pn9g6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
}

mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true});

// catch SIGINT on windows
if (process.platform === "win32"){
 var rl = readLine.createInterface ({
 input: process.stdin,
 output: process.stdout
 });
 rl.on ("SIGINT", function (){
 process.emit ("SIGINT");
 });
}


mongoose.connection.on('connected', function () { 
 logger.info('Mongoose connected to ' + dbURI); 
}); 
mongoose.connection.on('error',function (err) { 
 logger.error('Mongoose connection error: ' + err); 
}); 
mongoose.connection.on('disconnected', function () { 
 logger.info('Mongoose disconnected'); 
});