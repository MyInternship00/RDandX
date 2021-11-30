const { createLogger, format, transports } = require('winston');

const Logger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  transports: [new transports.Console({})],
});

module.exports = Logger;