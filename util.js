var db = require('./db'),
    nodemailer = require('nodemailer'),
    settings = require('./settings'),
    log = require('./log');

var smtpTransport = nodemailer.createTransport("SMTP", {
    service: "Gmail",
    auth: {
        user: settings.GMAIL_USERNAME,
        pass: settings.GMAIL_PASSWORD
    }
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/')
}

//set values for all templates

function templateDefaults(req, res, next) {
    if (req.isAuthenticated()) {
        res.locals.profileUrl = "/profile/" + req.user.fbid
    }
    res.locals.loggedIn = req.isAuthenticated()
    res.locals.token = req.session._csrf
    res.locals.domain = settings.DOMAIN
    res.locals.FACEBOOK_APP_ID = settings.FACEBOOK_APP_ID
    next()
}

function sendMail(from, to, subject, text, html) {
    var mailOptions = {
        from: from,
        // sender address
        to: to,
        // list of receivers
        subject: subject,
        // Subject line
        text: text,
        // plaintext body
        html: html // html body
    }

    smtpTransport.sendMail(mailOptions, function(error, response) {
        if (error) {
            log.warn(error)
        } else {
            log.info("Message sent: " + response.message)
        }
    })
}

exports.ensureAuthenticated = ensureAuthenticated
exports.templateDefaults = templateDefaults
exports.sendMail = sendMail
