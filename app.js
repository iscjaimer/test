var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var checkip = require('check-ip-address');

var port = process.argv[2] || 444;
var insecurePort = process.argv[3] || 1336;
var insecureServer;

var fs = require("fs");
var https = require('https');
var http = require('http');
var certsPath = path.join(__dirname, 'certs');
var options = {
    key : fs.readFileSync(path.join(certsPath, 'certificate.key')),
    ca :  fs.readFileSync(path.join(certsPath, 'gd_bundle-g2-g1.crt')),
    cert: fs.readFileSync(path.join(certsPath, '78fa81a6daf77206.crt')),
    requestCert: false
, rejectUnauthorized: false
}
var app = express();


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

require('./config/passport')(passport); // pass passport for configuration
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: 'deploymentplantnipsa' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.use(express.static(path.join(__dirname, 'public')));

// routes ======================================================================
require('./config/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport
require('./config/POST.js')(app, passport);
require('./config/reports.js')(app, passport);
require('./config/production.js')(app, passport);
require('./config/PUT.js')(app, passport);
// Take error Messsages
app.use(function(err,req, res, next){
    res.writeHead(err.status || 500,{
        'WWW-Authenticate': 'Basic',
        'Content-Type': 'text/plain'
    });
    res.end(err.message);
})

//app.use('/', index);
//app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development1' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
server = https.createServer(options, app).listen('444', function () {
    console.log('listening on port 444')

})


insecureServer = http.createServer();
insecureServer.on('request', function (req, res) {
     //TODO also redirect websocket upgrades
      try {
        var rep = req.headers.host.replace(/:\d+/, ':' + port)
      }
      catch(err) {
          console.log(err)
          var rep = 'nipsa.com.mx';
      }
        res.setHeader(
        'Location'
        , 'https://' + rep + req.url
        );

   res.statusCode = 302;
    res.end();
});
insecureServer.listen(insecurePort , function () {
    console.log("\nRedirecting all http traffic to https\n");
});
//app.listen(88);
//module.exports = app;
