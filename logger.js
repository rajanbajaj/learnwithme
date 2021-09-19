// TODO: integrate log analysis tools
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
      winston.format.colorize(),
      winston.format.json()
  ),
  // defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    new winston.transports.File({filename: 'error.log', level: 'error'}),
    new winston.transports.File({filename: 'combined.log'}),
  ],
  exitOnError: false,
});

if (process.env.NODE_ENV === "production") {
  // Call exceptions.handle with a transport to handle exceptions
  logger.exceptions.handle(
      new winston.transports.File({filename: 'exceptions.log'})
  );
}

logger.stream = {
  write: (info) => {
    logger.info(info);
  },
};

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(info => {
        const formattedDate = info.timestamp.replace('T', ' ').replace('Z', '');
        return `${formattedDate}|${process.env.npm_package_name}|${info.level}|${info.message}`.replace(/(\r\n|\n|\r)/gm, "")
      }),
   ),
  }));
}

module.exports = logger;
