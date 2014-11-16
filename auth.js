var passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy,
    db = require('./db'),
    settings = require('./settings'),
    log = require('./log');

var FACEBOOK_APP_ID = settings.FACEBOOK_APP_ID
var FACEBOOK_APP_SECRET = settings.FACEBOOK_APP_SECRET

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "//" + settings.DOMAIN + "/auth/facebook/callback"
}, function(accessToken, refreshToken, profile, done) {
    db.getUser(profile.id, function(err, result){
        if (err || !result) { //user does not exist, create
            //default user object
            var user = {
                fbid: profile.id,
                username: profile.username,
                displayName: profile.displayName,
                donations: {},
                donationsLeft: settings.DAILY_LIMIT,
                timeFirstDonation: -1,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                gender: profile.gender,
                fbProfileUrl: profile.profileUrl,
                quote: ""
            }
            log.info("creating new user: "+user.fbid, user)

            db.getNextQuote(function(err, quote) {
                if(err || !quote){
                    log.warn("error getting next quote", err)
                }

                user.quote = quote || "CharityVid.org"
                
                db.addUser(user, function(err, result) {
                    if(err || !result){
                        log.warn("error adding user", err)
                        return done(err)
                    }
                    return done(null, user)
                })
            })

        } else {
            return done(null, result)
        }
    })

}))

passport.serializeUser(function(user, done) {
    done(null, user)
})

passport.deserializeUser(function(obj, done) {
    done(null, obj)
})

exports.passport = passport