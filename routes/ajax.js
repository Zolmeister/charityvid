var db = require('../db'),
    log = require('../log');

function profile(req, res) {
    var quote = req.param("quote", "").substring(0,120)
    var fbid = req.user.fbid

    //TODO - add error handling
    db.setUserQuote(fbid, quote, function(err){
        if(err){
            log.warn("error setting user quote", err)
            res.write('{"success":false}')
            res.end()
            return
        }
        res.write('{"success":true}')
        res.end()
    })
    
}

function adcheck(req, res){
    log.debug('adcheck')
    var cvparam = req.param("cvparam","")
    if(!cvparam){
        res.write('{"success":false}')
        res.end()
        return
    }
    db.getDonateTracker(cvparam, function(err, data){
        if(err || !data){
            log.warn("tracker lookup failed", err)
            res.write('{"success":false,"error":"tracker lookup failed"}')
            res.end()
            return
        }
        //credited view
        if(data.done){
            res.write('{"success":true}')
            res.end()
            db.removeDonateTracker(cvparam)
            return
        }
        res.write('{"success":false}')
        res.end()
        return
    })
}

module.exports = function(req, res) {
    res.writeHead(200, {
        'Content-Type': 'application/json'
    })
    if (req.params.target === "profile") profile(req, res)
    else if (req.params.target === "adcheck") adcheck(req,res)
}