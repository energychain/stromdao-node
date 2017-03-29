var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

/*
var storj = require('storj-lib');
// Set the bridge api URL
var api = 'https://api.storj.io';
// Create client for interacting with API
// TODO Make Client Configurable
var storjclient = storj.BridgeClient(api);
*/

// this is a test TODO delete this with next commit.
console.log('hello from Stefan ', '(testing commit workflow)')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/js/ethers-wallet.js',express.static(path.join(__dirname,'node_modules/ethers-wallet/dist/ethers-wallet.min.js')));
app.use('/', index);
app.use('/users', users);

Stromdao=require('./stromdao.js');
//stromdao = new Stromdao();
Stromdao.tx(app);

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
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
