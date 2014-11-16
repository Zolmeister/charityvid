var db = require('../db'),
    log = require('../log');

module.exports = function(req, res) {
    var userId = req.params.userId
    db.getUser(userId, function(err, user) {//user does not exist
        if (err || !user) {
            log.warn("error getting user", err)
            res.redirect("/404")
            return;
        }
        //sets top charity to most donated charity
        var topCharity={
            name: undefined,
            count: -1
        }
        
        for(charity in user.donations){
            var count = user.donations[charity]
            if(count>topCharity.count){
                topCharity.name = charity
                topCharity.count = count
            }
        }

        db.getCharity(topCharity.name, function(err, charity){
            if(err){
                log.warn("error getting charity", err)
                res.redirect('/')
                return
            }
            res.render('profile', {
                name : user.displayName || "",
                quote : user.quote || "It is during our darkest moments that we must focus to see the light.",
                charityTop : charity,
                charityCount : topCharity.count,
                fbid : userId,
                isUser : req.user && userId === req.user.fbid
            })
        })

    })
}