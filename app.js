//Dependencies
var settings = require('./settings')

var express = require('express'),
    routes = require('./routes'),
    user = require('./routes/user'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),
    cons = require('consolidate'),
    dustfs = require('dustfs'),
    util = require('util'),
    auth = require('./auth'),
    belt = require('./util'),
    MongoStore = require('connect-mongo')(express),
    tracker = require('pixel-tracker'),
    trackerCallback = require('./tracker'),
    child = require('child_process'),
    log = require('./log')

tracker.use(trackerCallback)

var app = express()
app.engine('dust', cons.dust) //dustjs template engine
//order matters
app.configure('production', function() {
    app.use(express.logger())
    app.use(express.compress()) //gzip all the things
})

app.configure('development', function() {
    app.use(express.logger('dev')) //verbose logging
    app.use(express.errorHandler())
})

app.configure(function() {
    app.set('port', process.env.PORT || 3000)
    app.set('views', __dirname + '/views')
    app.set('view engine', 'dust') //dust.js default
    app.set('view options', {
        layout: false //disable layouts, use of master template system
    })
    app.locals({
        layout: false
    }) //sessions
    app.disable('x-powered-by');
    app.use(express.cookieParser(settings.SESSION_SECRET))
    app.use(express.bodyParser())
    app.use(express.methodOverride()) //sessions
    app.use(express.session({
        secret: settings.SESSION_SECRET,
        store: new MongoStore({
            url: settings.MONGO_URL
        })
    })) //auth
    app.use(auth.passport.initialize())
    app.use(auth.passport.session()) //defaults
    app.use(belt.templateDefaults)
    app.use(express.csrf())
    app.use(app.router)
    app.use(express.static(path.join(__dirname, 'public')))
})

app.configure('development', function() {
    http.createServer(app).listen(app.get('port'), function() {
        log.info("Express server listening on port " + app.get('port'))
    })
})
app.configure('production', function() {
    module.exports = http.Server(app) //launch command: up -w app.js
})

//force non-www
app.get('/*', function(req, res, next) {
    if (req.headers.host.match(/^www/) !== null ) res.redirect(301,'http://' + req.headers.host.replace(/^www\./, '') + req.url);
    else next();
});

//auth urls
app.get('/account', belt.ensureAuthenticated, function(req, res) {
    res.render('account', {
        user: req.user
    })
})
app.get('/auth/facebook/callback', auth.passport.authenticate('facebook', {
    failureRedirect: '/'
}), function(req, res) {
    res.redirect('/')
})
app.get('/logout', function(req, res) {
    req.logout()
    res.redirect('/')
})
app.get('/auth/facebook', auth.passport.authenticate('facebook'), function(req, res) { /* function will not be called.(redirected to Facebook for authentication)*/
})
app.get('/login', function(req, res) {
    res.render('login', {
        user: req.user
    })
})

/*
 * TODO - client side templating with ajax loading of pages
 *
 * var compiled = []
 * var templates = ['404.dust', 'about.dust', 'base.dust', 'charities.dust', 'contact.dust', 'index.dust', 'profile.dust', 'watch.dust']
 * dustfs.dirs('views')
 * for (var i = 0; i < templates.length; i++) {
 *     fin=fs.readFileSync('views/'+templates[i])
 *     compiled.push(dustfs.compile('views/' + templates[i]))
 * }
 * write out compiled templates
 * fs.writeFileSync('public/js/compiled-templates.js',compiled.join(' '))
 */

app.get('/', routes.index)
app.all('/advertisers', routes.advertisers)
app.get('/donate/:charity', routes.donate)
app.get('/about', routes.about)
app.all('/contact', routes.contact)
app.get('/charities', routes.charities)
app.get('/profile/:userId', routes.profile)
app.get('/watch', routes.watch)
app.get('/charity/:charity', routes.charityPage)
//TODO: seperate ajax get and post
app.post('/ajax/:target', routes.ajax)
app.all('/pixel', tracker.middleware)

//error handler
app.use(function(req, res, next) {
    // respond with html page
    if (req.accepts('html')) {
        res.status(404) //custom 404 page
        res.render('404', {
            url: req.url
        })
        return
    }
    // respond with json
    if (req.accepts('json')) {
        res.send({
            error: 'Not found'
        })
        return
    }
    // default to plain-text. send()
    res.type('txt').send('Not found')
})

var recycler = child.fork('recycler.js');
function recycleLoop(){
    recycler.send({
        recycle: "users",
        dailyLimit: settings.DAILY_LIMIT,
        timeDiff: settings.USERS_TIMER
    })
    recycler.send({
        recycle: "charities"
    })
    setTimeout(recycleLoop, settings.RECYCLE_INTERVAL)
}

setTimeout(recycleLoop, settings.RECYCLE_INTERVAL)
//recycleLoop()
