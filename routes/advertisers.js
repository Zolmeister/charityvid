var belt = require('../util'),
    log = require('../log'),
    settings = require('../settings');

module.exports = function(req, res) {
    var company = req.param("company", "")
    var email = req.param("email", "")
    var phone = req.param("phone", "")
    var message = req.param("message", "")
    var messageSent = false

    //TODO make the email a template
    if (email !== "" && company !== "" && phone !== "") {
        log.info("sending advertiser email");
        message = "ADVERTISER <br> email: " + email + "<br> company: " + company + "<br> phone:" + phone + " <br> message:" + message
        belt.sendMail(settings.GMAIL_USERNAME, settings.GMAIL_USERNAME, "ADVERTISER from: " + company, message, message)
        messageSent = true
    }
    res.render('advertisers', {
        sent: messageSent
    })
}
