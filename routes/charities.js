var db = require('../db'),
	log = require('../log');

module.exports = function(req, res) {
    db.getAllCharities(function(err, charities) {
    	if (err || !charities){
    		log.warn("error getting charities", err)
    	}
        charities = charities || []
        var charityLike = req.param('charity');
        if(charityLike){
            db.getCharity(charityLike, function(err, charityLike){
                if (err || !charityLike){
                    log.warn("error getting charity", err)
                }
                res.render('charities', {
                    charities: charities,
                    charityLike: charityLike
                })
            })
        }
        else{
            res.render('charities', {
                charities: charities
            })
        }
    })
}