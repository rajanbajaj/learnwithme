// the register/ edit itself contains the images/ file uploads
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('./logger');
// var morgan = require('morgan');
// var stylus = require('stylus');
var bodyParser = require('body-parser');
var busboy = require('connect-busboy'); //middleware for form/file upload
// const client = require('./app_api/cache/redisDb');
const mongoose = require('mongoose');

require('./app_api/models/db');
var indexRouter = require('./app_server/routes/index');
var apiRouter = require('./app_api/routes/index');

// graphQL integration
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');

var app = express();
var server = app.listen(3000, function () {
  logger.info("Server started @ 3000");
})

// Construct a schema, using GraphQL schema language
var schema = require("./app_api/graphQL/schema");

app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true,
}));

app.use(busboy());

// view engine setup
app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'jade');

// app.use(morgan("combined", {stream: logger.stream}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));
app.use(cookieParser());
// app.use(stylus.middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '/node_modules/bootstrap/dist')));
app.use(express.static(path.join(__dirname, '/node_modules/jquery/dist')));
app.use(express.static(path.join(__dirname, '/node_modules/tinymce')));

app.use('/', indexRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// /**
//  * API Caching Middleware
//  **/
// const cacheMemberById = (req, res, next) => {
//   const { memberId } = req.params;
//   client.get(memberId, (err, data) => {
//     if (err) throw err;
//     if (data !== null) {
//       res.send(getResponse(JSON.parse(data)));
//     } else {
//       next();
//     }
//   });
// };

// const cachePostById = (req, res, next) => {
//   const { postId } = req.params;
//   client.get(postId, (err, data) => {
//     if (err) throw err;
//     if (data !== null) {
//       res.send(getResponse(JSON.parse(data)));
//     } else {
//       next();
//     }
//   });
// };

// app.use("/api/members/:memberId", cacheMemberById);
// app.use("/api/posts/:postId", cachePostById);

/**
 *  Graceful shutdown
 **/
// catch SIGINT on windows
var readLine = require ("readline");
if (process.platform === "win32"){
 var rl = readLine.createInterface ({
 input: process.stdin,
 output: process.stdout
 });
 rl.on ("SIGINT", function (){
 process.emit ("SIGINT");
 });
}

var gracefulShutdown = function (msg, callback) {
    mongoose.connection.close(function () { 
      logger.info('Mongoose disconnected through ' + msg);
      // client.quit(function() {
      //   console.log('Redis client stopped');
      //   callback(); 
      // });
    });
    server.close(function () {
      logger.info("server stopped.");
    })
};

// event listeners for terminating the application
process.once('SIGUSR2', function () { 
  gracefulShutdown('nodemon restart', function () { 
    process.kill(process.pid, 'SIGUSR2'); 
 });
});
process.on('SIGINT', function () { 
  gracefulShutdown('app termination', function () { 
    process.exit(0); 
 });
});
process.on('SIGTERM', function() { 
  gracefulShutdown('Heroku app shutdown', function () { 
    process.exit(0); 
 });
});

/**** END GRACEFUL SHUTDOWN ****/

module.exports = app;
