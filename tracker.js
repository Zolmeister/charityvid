var db = require('./db'),
  settings = require('./settings'),
  log = require('./log');

function attributeView(userFbId, charityNameId, trackingId, callback) {
        db.getUser(userFbId, function(err, user) { //user does not exist
            if (err || !user) {
                callback(err)
                return;
            }
            if (user.donationsLeft > 0) {

                log.info("donation " + userFbId + " " + charityNameId)

                //increment donation count for user
                if (user.donations[charityNameId]) {
                    user.donations[charityNameId] += 1
                } else {
                    user.donations[charityNameId] = 1
                }

                db.decrementUserDonations(userFbId, 1)
                db.setDonations(userFbId, user.donations, function() {
                    callback(null)
                })
                db.incrementCharityDonations(charityNameId, 1)

            } else {
                db.removeDonateTracker(trackingId)
                callback(new Error("donation limit reached"))
            }

        })

    }

module.exports = function(error, result) {
    if (error) {
        log.warn(error)
    } else {
        if (!settings.DEBUG && result.referer.indexOf('api.virool.com/widgets/27431') === -1) {
            log.info("incorrect referer")
            return
        }
        var trackingId = result.cvparam
        if (!trackingId) {
            log.info("no tracking id found")
            return
        }
        db.getDonateTracker(trackingId, function(err, token) {
            if (err || !token || !token.userFbId || !token.charityNameId) {
                log.info("bad token")
                return
            }

            attributeView(token.userFbId, token.charityNameId, trackingId, function(err) {
                if (err){
                  log.warn("error attributing view", err)
                  return
                }
                //set redis database value to true
                db.setTrackingToken(trackingId, "done")
            })
        })
    }
}


/*
TRACKBACK
{
  host: '3x73.localtunnel.com',
  cache: { 'no-cache': '' },
  referer: 'http://api.virool.com/widgets/27431?pxtrackback=http://3x73.localtunnel.com/pixel&width=640&height=360',
  params: [],
  decay: 1360008579770,
  useragent: { browser: 'Chrome', version: '24.0' },
  language: [ 'en-US', 'en', { q: '0.8' } ],
  geo: { ip: '127.0.0.1' },
  domain: '3x73.localtunnel.com' }
*/
