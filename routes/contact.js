var belt = require('../util'),
    log = require('../log'),
    settings = require('../settings');

module.exports = function(req, res) {
    var name = req.param("name", "")
    var email = req.param("email", "")
    var message = req.param("message", "")
    var messageSent = false //user makes request with form information
    if (name !== "" && email !== "" && message !== "") {
        log.info("sending email from " + name)
        message = "email: " + email + " <br> name: " + name + " <br> " + message
        belt.sendMail(settings.GMAIL_USERNAME, settings.GMAIL_USERNAME, "CharityVid Contact From: " + name, message, message)
        messageSent = true
    }
    res.render('contact', {
        sent: messageSent
    })
}
