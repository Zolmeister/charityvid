var belt = require('../util'),
    db = require('../db'),
    log = require('../log');

var settings = require('../settings');
module.exports = function(req, res) {
    belt.ensureAuthenticated(req, res, function() {
        var nameId = req.params.charity
        db.getCharity(nameId, function(err, charity) {
            if (err || !charity){
                log.warn("error getting charity", err)     
                res.redirect('/')
                return
            }
            var adDomain = "http://" + settings.DOMAIN
            var trackToken = db.newTrackingToken(req.user, charity)
            res.render('donate', {
                trackToken: trackToken,
                charity: charity,
                DEBUG: settings.DEBUG,
                adDomain: adDomain,
                donateAdUrl: '//api.virool.com/widgets/27431?pxtrackback='+adDomain+'/pixel%3Fcvparam%3D'+trackToken
            })
        })
    })
}