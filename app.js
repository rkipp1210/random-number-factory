var express = require('express');
var app = express();
var path = require('path');
// var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs    = require('express-handlebars');
var assert = require('assert');
var dbConfig = require('./db');
var mongoose = require('mongoose');
var debug = require('debug')('passport-mongo');
var port = process.env.PORT || 3000
var server = require('http').createServer(app)

// Connect to DB with mongoose (users)
mongoose.connect(dbConfig.url);
var TreeObj = require('./models/factory');

// if there isn't alread a tree object, create one
TreeObj.findOne({ 'name': 'main' }, function (err, treeObj) {
  if (err) {
    return done(err);
  } else if (!treeObj) {
    var newTree = new TreeObj();
    newTree.name = 'main';
    newTree.save();
    console.log('created a new tree');
  } else {
    console.log('already have a tree object');
  }
})


// Setup port
app.set('port', port);

// Setup view engine
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.engine('html', exphbs({
  defaultLayout: 'main',
  extname: '.html'
}));

// app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configuring Passport
var passport = require('passport');
var expressSession = require('express-session');
// TODO - Why Do we need this key ?
app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());

 // Using the flash middleware provided by connect-flash to store messages in session
 // and displaying in templates
var flash = require('connect-flash');
app.use(flash());

// Initialize Passport
var initPassport = require('./passport/init');
initPassport(passport);

var routes = require('./routes/routes')(passport);
app.use('/', routes);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}


/*
 * Socket.io Functionality
 */
var io = require('socket.io')(server);

//  // Initialize variables
// var usernames = {};
// var numUsers = 0;
// var userStates = {};
// var treeState = {};
// var log = {};
// var messageID = -1;

io.on('connection', function (socket) {

  // when the client emits 'tree change', this listens and executes
  socket.on('tree change', function (updateData) {

    console.log(updateData);
    socket.broadcast.emit('tree update', updateData)
    TreeObj.findOne({ 'name': 'main' }, function (err, treeObj) {
      if (err) {
        return done(err);
      } else {
        treeObj.jstreeObject = updateData;
        treeObj.save();
      }
    })

  });



  // // when the client emits 'add user', this listens and executes
  // socket.on('add user', function (username) {

  //   // we store the username in the socket session for this client
  //   socket.username = username;

  //   // add the client's username to the global list
  //   usernames[username] = username;
  //   ++numUsers;
  //   addedUser = true;
  //   socket.emit('login', {
  //     numUsers: numUsers,
  //     "username": username
  //   });

  //   // add the message to the log
  //   ++messageID;
  //   log[messageID] = socket.username + ' joined';

  //   // echo globally (all clients) that a person has connected
  //   socket.broadcast.emit('user joined', {
  //     username: socket.username,
  //     numUsers: numUsers,
  //     logMessage: log[messageID]
  //   });
    
  //   // Print it out on the server side
  //   console.log("numUsers: " + numUsers);
  //   console.log(username + " just joined the app");
  //   console.log(log);

  // });

  // // when the client emits 'typing', we broadcast it to others
  // socket.on('typing', function () {
  //   socket.broadcast.emit('typing', {
  //     username: socket.username
  //   });
  // });

  // when the user disconnects.. perform this
  // socket.on('disconnect', function () {
  //   // remove the username from global usernames list
  //   if (addedUser) {
  //     delete usernames[socket.username];
  //     --numUsers;

  //     // echo globally that this client has left
  //     socket.broadcast.emit('user left', {
  //       username: socket.username,
  //       numUsers: numUsers
  //     });
  //   }
  // });

});

// Start Server
server.listen(port, function () {
  console.log('Server listening at port %d', port);
});
