/* 
 * Setup Server and Dependencies
 */
var express = require('express'),
    app = express(),
    path = require('path'),
    fs = require('fs'),
    server = require('http').createServer(app),
    io = require('socket.io')(server);
    exphbs = require('express-handlebars'),
    mongoose = require('mongoose');
    passport = require('passport'),
    expressSession = require('express-session'),
    LocalStrategy = require('passport-local').Strategy,
    bcrypt = require('bcrypt'),
    flash = require('connect-flash'),
    port = process.env.PORT || 5000;


/* 
 * App Configurations
 */
app.set('port', port);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.engine('html', exphbs({
  defaultLayout: 'main',
  extname: '.html'
}));
app.use(express.static(path.join(__dirname, '/public')));
app.use(expressSession({secret: 'passport-parking-test'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

/* 
 * Database Configurations
 */
mongoose.connect('mongodb://rkippenbrock:password@ds035750.mongolab.com:35750/random-number-factory');


// Initialize Passport
var initPassport = require('./passport/init');
initPassport(passport);

/*
 * Route Handling
 */
// Setup Router
var routes = require('./routes/index')(passport);
app.use('/', routes);

// catch anything other uri than we specified and render the 404 page
app.get('*', function(req, res) {
  res.render('404');
});




/*
 * Socket.io Functionality
 */

 // Initialize variables
var usernames = {};
var numUsers = 0;
var userStates = {};
var treeState = {};
var log = {};
var messageID = -1;

io.on('connection', function (socket) {
  
  var addedUser = false;

  // when the client emits 'tree change', this listens and executes
  socket.on('tree change', function (updateData) {
    
    treeState = updateData['data'];
    console.log(treeState);
    socket.broadcast.emit('tree update', updateData)

    // Add the event to the message log
    ++messageID;
    log[messageID] = 'tree updated by ' + updateData['user'];

  });



  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {

    // we store the username in the socket session for this client
    socket.username = username;

    // add the client's username to the global list
    usernames[username] = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers,
      "username": username
    });

    // add the message to the log
    ++messageID;
    log[messageID] = socket.username + ' joined';

    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers,
      logMessage: log[messageID]
    });
    
    // Print it out on the server side
    console.log("numUsers: " + numUsers);
    console.log(username + " just joined the app");
    console.log(log);

  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    // remove the username from global usernames list
    if (addedUser) {
      delete usernames[socket.username];
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});

// Start Server
server.listen(port, function () {
  console.log('Server listening on port %d', port);
});