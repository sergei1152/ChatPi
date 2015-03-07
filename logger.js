var winston = require('winston');
winston.emitErrs = true;

var logger = new (winston.Logger)({
  transports: [
    //ouputs all messages to the debug.log file
    new winston.transports.File({
      name:'file-debug',
      level: 'debug',
      filename: './logs/debug.log',
      handleExceptions: false,
      json: true,
      maxsize: 5242880, //5MB
      maxFiles: 5,
      colorize: false
    }),
    //outputs all messages excluding info messages to the all-logs file
    new winston.transports.File({
      name:'all-logs',
      level:'info',
      filename: './logs/all-logs.log',
      handleExceptions: false,
      json: true,
      maxsize: 5242880, //5MB
      maxFiles: 5,
      colorize: false
    }),
    //outputs error messgaes to the errors.log file
    new winston.transports.File({
      name:'file-error',
      level: 'error',
      filename: './logs/errors.log',
      handleExceptions: false,
      json: true,
      maxsize: 5242880, //5MB
      maxFiles: 5,
      colorize: false
    }),
    //outputs debug messages to the console
    new winston.transports.Console({
      name:'console-debug',
      level: 'debug',
      handleExceptions: false,
      json: false,
      colorize: true
    })
  ],
  exitOnError: false
});

module.exports = logger;
//for streaming morgan output
module.exports.stream = {
  write: function(message, encoding) {
    logger.log('debug',message);
  }
};
