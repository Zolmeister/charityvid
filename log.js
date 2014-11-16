var winston = require('winston'),
    Loggly = require('winston-loggly').Loggly,
    settings = require('./settings')

winston.add(winston.transports.File, { filename: 'charityvid.log' });

if(!settings.DEBUG){
    winston.add(Loggly, {
        subdomain: 'charityvid',
        inputToken: settings.LOGGLY_KEY
    })
}
//winston.remove(winston.transports.Console);

module.exports = winston
