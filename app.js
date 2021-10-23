// the register/ edit itself contains the images/ file uploads
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('./logger');
const busboy = require('connect-busboy'); // middleware for form/file upload
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const session = require('express-session');
// var stylus = require('stylus');
// const bodyParser = require('body-parser');
// const client = require('./app_api/cache/redisDb');

if (!process.env.DATABASE) {
  console.log('DB NOT DEFINED!');
  exit(1);
}

require('./app_api/models/db');
const apiRouter = require('./app_api/routes/index');

// graphQL integration
const {graphqlHTTP} = require('express-graphql');
// const {buildSchema} = require('graphql');

const app = express();

// Construct a schema, using GraphQL schema language
const schema = require('./app_api/graphQL/schema');

app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true,
}));

app.use(busboy());
app.use(cors({
  origin: '*',
}));
// view engine setup
// app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'jade');

// Use the session middleware
app.use(session({secret: 'fsla3&fkad(#', cookie: {maxAge: 60000}}));

app.use(morgan('combined', {stream: logger.stream}));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}));
app.use(cookieParser());

// app.use(stylus.middleware(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname, '/node_modules/bootstrap/dist')));
// app.use(express.static(path.join(__dirname, '/node_modules/jquery/dist')));
// app.use(express.static(path.join(__dirname, '/node_modules/tinymce')));

// app.use('/', indexRouter);
app.use('/api', apiRouter);
app.use(express.static(path.join(__dirname, '/storage')));

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
  res.json(err);
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
const readLine = require('readline');
if (process.platform === 'win32') {
  const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.on('SIGINT', function() {
    process.emit('SIGINT');
  });
}

const gracefulShutdown = function(msg, callback) {
  mongoose.connection.close(function() {
    logger.info('Mongoose disconnected through ' + msg);
    // client.quit(function() {
    //   console.log('Redis client stopped');
    // });
    callback();
  });
};

// event listeners for terminating the application
process.once('SIGUSR2', function() {
  gracefulShutdown('nodemon restart', function() {
    process.kill(process.pid, 'SIGUSR2');
  });
});
process.on('SIGINT', function() {
  gracefulShutdown('app termination', function() {
    process.exit(0);
  });
});
process.on('SIGTERM', function() {
  gracefulShutdown('Heroku app shutdown', function() {
    process.exit(0);
  });
});

/** ** END GRACEFUL SHUTDOWN ****/

module.exports = app;
