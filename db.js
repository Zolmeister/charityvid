//mongo = require('mongodb'),
//Server = mongo.Server,
//Db = mongo.Db,
var redis = require('redis'),
    redisClient = redis.createClient(),
    Q = require('q'),
    url = require('url'),
    log = require('./log'),
    MongoClient = require('mongodb').MongoClient;
    

settings = require('./settings'), uuid = require('node-uuid');

/*var server = new Server('localhost', 27017, {
    auto_reconnect: true
})

var db = new Db('CharityVid', server, {
    safe: true
})
*/
var User = Q.defer()
var Charity = Q.defer()
var Quote = Q.defer()

MongoClient.connect(settings.MONGO_URL, function(err, db) {
//db.open(function(err, db) {
    if (!err && db) { //User collection
        db.collection('User', function(err, collection) {
            if(err || !collection) {
                log.error("failed to load User collection")
            } else {
                User.resolve(collection)
            }
        }) //Quote collection
        db.collection('Quote', function(err, collection) {
            if(err || !collection) {
                log.error("failed to load Quote collection")
            } else {
                Quote.resolve(collection)
            }
        }) //Charity collection
        db.collection('Charity', function(err, collection) {
            if(err || !collection) {
                log.error("failed to load Charity collection")
            } else {
                Charity.resolve(collection)
            }
        })
    } else {
        log.error("failed to load database")
    }
//})
})

function getAllCharities(callback) {
    log.debug("getting all charities")
    Charity.promise.then(function(Charity) {
        Charity.find({},{
            safe: true,
            sort: [
                ['nameId','1']
            ]
        }).toArray(function(err, charities) {
            if (err) {
                return callback(new Error("error getting charity list"))
            }

            //parse url and set websiteName
            var keys = Object.keys(charities)
            for (var i = 0; i < keys.length; i++) {
                var site = charities[i].website
                var hostname = url.parse(site).hostname
                charities[i].websiteName = hostname.replace("www.", "")
            }

            return callback(null, charities)
        })
    })
}

function getCharity(nameId, callback) {
    Charity.promise.then(function(Charity) {
        Charity.findOne({
            nameId: nameId
        }, callback)
    })
}

function newTrackingToken(user, charity) {
    var token = uuid.v1()
    redisClient.set(token, user.fbid + " " + charity.nameId)
    redisClient.expire(token, settings.REDIS_TIMER)
    return token
}

//user._id charity._id date entropy

function getDonateTracker(token, callback) {
    log.debug("getting donation tracker")
    redisClient.get(token, function(err, data) {
        if (err || !data) {
            callback(err)
            return
        }
        if (data.indexOf("done") !== -1) {
            callback(null, {
                done: true
            })
            return
        }
        var list = data.split(" ")
        var result = {}
        result.userFbId = list[0]
        result.charityNameId = list[1]
        callback(null, result)
    })
}

function getNextQuote(callback) {
    log.debug("getting next quote")
    Quote.promise.then(function(Quote) {
        Quote.findOne({}, { //give user a quote
            safe: true,
            sort: [
                ['used', 1]
            ]
        }, function(err, quote) {
            if(err){
                callback(err)
                return
            }

            callback(null, quote.quote)

            //increment quote usage count
            Quote.update({
                _id: quote._id
            }, {
                $inc: {
                    'used': 1
                }
            }, {}, function(err, result) {
                if (err) {
                    log.warn("error updating quote change in database", err)
                }
            })
        })
    })
}

function setUserQuote(fbid, quote, callback) {
    User.promise.then(function(User) {
        User.update({
            fbid: fbid
        }, {
            $set: {
                quote: quote
            }
        }, callback)
    })
}

function getUser(fbid, callback) {
    User.promise.then(function(User) {
        User.findOne({
            fbid: fbid
        }, {}, callback)
    })
}

function setTrackingToken(trackingId, value) {
    redisClient.set(trackingId, value)
    redisClient.expire(trackingId, settings.REDIS_TIMER)
}

function removeDonateTracker(trackingId){
    redisClient.del(trackingId)
}

function addUser(user, callback) {
    User.promise.then(function(User) {

        //add user to database
        User.insert(user, {
            safe: true
        }, callback)
    })
}

function setDonations(fbid, donations, callback) {
    User.promise.then(function(User) {
        User.update({
            fbid: fbid
        }, {
            $set: {
                donations: donations
            }
        }, callback)
    })
}

function decrementUserDonations(fbid, count) {
    log.debug("decrementing user donations")
    count = -count || -1
    User.promise.then(function(User) {
        User.update({
            fbid: fbid
        }, {
            $inc: {
                'donationsLeft': count
            }
        }, {}, function(err){
            if(err){
                log.warn("error decrementing user donation", err)
            }
        })
    })
}

function incrementCharityDonations(nameId, count) {
    log.debug("incrementing charity donations")
    count = count || 1
    Charity.promise.then(function(Charity) {
        Charity.update({
            nameId: nameId
        }, {
            $inc: {
                'currentMonth': count,
                'totalDonations': count
            }
        }, {}, function(err, result) {
            if (err) {
                log.warn("error incremening charity view", err)
            }
        })
    })
}

exports.User = User.promise
exports.Charity = Charity.promise
exports.Quote = Quote.promise
exports.redisClient = redisClient

exports.getCharity = getCharity
exports.newTrackingToken = newTrackingToken
exports.getDonateTracker = getDonateTracker
exports.removeDonateTracker = removeDonateTracker
exports.getAllCharities = getAllCharities
exports.setUserQuote = setUserQuote
exports.getNextQuote = getNextQuote
exports.getUser = getUser
exports.addUser = addUser
exports.setDonations = setDonations
exports.setTrackingToken = setTrackingToken
exports.incrementCharityDonations = incrementCharityDonations
exports.decrementUserDonations = decrementUserDonations