var db = require('../db'),
    log = require('../log');

//home page
exports.index = function(req, res) {
    if (req.isAuthenticated()) {
        db.getAllCharities(function(err, charities) {
            if(err || !charities){
                log.warn("error getting all charities", err)
                req.logout()
                res.render('index', {
                    loggedIn: false
                })
                return
            }
            db.getUser(req.user.fbid, function(err, user) {
                if(err || !user){
                    log.warn("error getting user", err)
                    req.logout()
                    res.render('index', {
                        loggedIn: false
                    })
                    return
                }
                res.render('index', {
                    charities: charities,
                    donationsLeft: user.donationsLeft
                })
            })
        })
    } else {
        res.render('index', {})
    }
}

//other pages
exports.about = require('./about')
exports.charities = require('./charities')
exports.contact = require('./contact')
exports.advertisers = require('./advertisers')
exports.donate = require('./donate')
exports.profile = require('./profile')
exports.charityPage = require('./charityPage')
exports.ajax = require('./ajax')