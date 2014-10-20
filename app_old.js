/* 
 * Setup Server and Dependencies
 */
var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');
var server = require('http').createServer(app);
// var io = require('socket.io')(server);
// var favicon = require('static-favicon');
var exphbs = require('express-handlebars');
var logger = require('morgan');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var dbConfig = require('./db');
var mongoose = require('mongoose');
var debug = require('debug')('passport-mongo');

var port = process.env.PORT || 5000;


/* 
 * App Configurations
 */

// Connect to DB
mongoose.connect(dbConfig.url);

// Initialize the express app
var app = express();

// Setup port
app.set('port', process.env.PORT || 3000);

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

var routes = require('./routes/index')(passport);
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

//  // Initialize variables
// var usernames = {};
// var numUsers = 0;
// var userStates = {};
// var treeState = {};
// var log = {};
// var messageID = -1;

// io.on('connection', function (socket) {
  
//   var addedUser = false;

//   // when the client emits 'tree change', this listens and executes
//   socket.on('tree change', function (updateData) {
    
//     treeState = updateData['data'];
//     console.log(treeState);
//     socket.broadcast.emit('tree update', updateData)

//     // Add the event to the message log
//     ++messageID;
//     log[messageID] = 'tree updated by ' + updateData['user'];

//   });



//   // when the client emits 'add user', this listens and executes
//   socket.on('add user', function (username) {

//     // we store the username in the socket session for this client
//     socket.username = username;

//     // add the client's username to the global list
//     usernames[username] = username;
//     ++numUsers;
//     addedUser = true;
//     socket.emit('login', {
//       numUsers: numUsers,
//       "username": username
//     });

//     // add the message to the log
//     ++messageID;
//     log[messageID] = socket.username + ' joined';

//     // echo globally (all clients) that a person has connected
//     socket.broadcast.emit('user joined', {
//       username: socket.username,
//       numUsers: numUsers,
//       logMessage: log[messageID]
//     });
    
//     // Print it out on the server side
//     console.log("numUsers: " + numUsers);
//     console.log(username + " just joined the app");
//     console.log(log);

//   });

//   // when the client emits 'typing', we broadcast it to others
//   socket.on('typing', function () {
//     socket.broadcast.emit('typing', {
//       username: socket.username
//     });
//   });

//   // when the user disconnects.. perform this
//   socket.on('disconnect', function () {
//     // remove the username from global usernames list
//     if (addedUser) {
//       delete usernames[socket.username];
//       --numUsers;

//       // echo globally that this client has left
//       socket.broadcast.emit('user left', {
//         username: socket.username,
//         numUsers: numUsers
//       });
//     }
//   });
// });

// Start Server
server.listen(port, function () {
  console.log('Server listening on port %d', port);
});