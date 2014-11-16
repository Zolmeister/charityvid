var private = require("./private"),
    format = require('util').format;

var prod = true
exports.PROD = prod

exports.SESSION_SECRET = "XXX"
exports.TOKEN_SECRET = "XXX"
exports.GMAIL_USERNAME = private.GMAIL_USERNAME
exports.GMAIL_PASSWORD = private.GMAIL_PASSWORD

if (prod) {
    exports.FACEBOOK_APP_ID = "XXX"
    exports.FACEBOOK_APP_SECRET = "XXX"
    exports.LOGGLY_KEY = 'XXX'

    exports.DEBUG = false
    exports.DOMAIN = "charityvid.org"

    exports.DB_HOST = 'XXX'
    exports.DB_PORT = 0000
    exports.DB_APP = 'XXX'
} else {
    exports.FACEBOOK_APP_ID = "XXX"
    exports.FACEBOOK_APP_SECRET = "XXX"
    exports.LOGGLY_KEY = 'XXX'

    exports.DEBUG = true
    exports.DOMAIN = "localhost:3000"

    exports.DB_HOST = 'XXX'
    exports.DB_PORT = 0000
    exports.DB_APP = 'XXX'
}

exports.DAILY_LIMIT = 3

//TODO: implement better time system
exports.RECYCLE_INTERVAL = 1000 * 60 * 60 // 1 hour, ms
exports.REDIS_TIMER = 60 * 60 // 1 hour, seconds
exports.USERS_TIMER = 1000 * 60 * 60 * 19 //19 hours, ms

//database
exports.DB_USER = private.DB_USER
exports.DB_PASS = private.DB_PASS

exports.MONGO_URL = format("mongodb://%s:%s@%s:%s/%s",
                           exports.DB_USER,
                           exports.DB_PASS,
                           exports.DB_HOST,
                           exports.DB_PORT,
                           exports.DB_APP)
