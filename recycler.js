var db = require('./db'),
    settings = require('./settings'),
    log = require('./log');

process.on('message', function(msg) {
    if (msg.recycle === 'users') {
        recycleUsers()
    } else if (msg.recycle === 'charities') {
        recycleCharities()
    }
})

function recycleUsers() {
    log.info("recycling users")
    db.User.then(function(User) {
        var now = Date.now()
        User.find().toArray(function(err, users) {
            if(err || !users){
                log.warn("error gettings all users for recycling", err)
                return
            }
            users.forEach(function(user) {

                //resets users daily donation limit
                if (now - user.timeFirstDonation > settings.USERS_TIMER) {
                    user.donationsLeft = settings.DAILY_LIMIT
                    user.timeFirstDonation = now
                    User.save(user, function(err) {
                        if (err) {
                            log.warn("error reseting user donation limit", err)
                        }
                    })
                }
            })
        })
    })
}

var lastCharityMonth = -1

function recycleCharities() {
    var time = new Date()

    //recycle on the first of the month, every month
    if (time.getDate() == 1 && lastCharityMonth != time.getMonth()) {
        db.Charity.then(function(Charity) {
            Charity.find().toArray(function(err, charities) {
                if(err || !charities){
                    log.warn("error getting charities for recycling", err)
                    return
                }
                charities.forEach(function(charity) {
                    charity.lastMonth = charity.currentMonth
                    charity.currentMonth = 0
                    Charity.save(charity, function(err) {
                        if (err) {
                            log.warn("error reseting charity donations", err)
                        }
                    })
                })
            })
        })
        lastCharityMonth = time.getMonth()
    }
    log.info("recycling charities")
}