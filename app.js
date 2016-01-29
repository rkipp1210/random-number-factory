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
var TreeObj = require('./models/jstree');

// if there isn't alread a tree object, create one, otherwise just print out that we have one
TreeObj.findOne({ 'name': 'main' }, function (err, treeObj) {
    if (err) {
        return done(err);
    } else if (!treeObj) {
        var newTree = new TreeObj();
        newTree.name = 'main';
        newTree.jstreeObject = JSON.stringify(
                            [{ id: "1",
                              text: "Root Node",
                              icon: true,
                              li_attr: { id: "1" },
                              a_attr: { href: "#" },
                              state: { loaded: true, opened: false, selected: true, disabled: false },
                              data: null,
                              children: [] 
                            }]);
        newTree.numFactories = 0;
        newTree.save();
        console.log('No existing tree found.  Created a new tree.');
    } else {
        console.log('No new tree created.  Already have a tree object.');
    }
})

treeObj = TreeObj.findOne({ 'name': 'main' });

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

var routes = require('./routes/routes')(passport, treeObj);
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
io.on('connection', function (socket) {
    // when the client emits 'tree change', this listens and executes
    socket.on('tree change', function (updateData) {
        // Save the tree data to the database
        TreeObj.findOne({ name: 'main' }, function (err, treeObj) {
            if (err) {
                console.log('database save problem');
                return done(err);
            } else {
                treeObj.jstreeObject = JSON.stringify(updateData);
                treeObj.save();
                console.log('database save successful');
                // Broadcast the new data
                io.emit('update', { treeObject: treeObj.jstreeObject });
                // console.log('broadcast tree server update from server')
            }
        })
    });
});

// Start Server
server.listen(port, function () {
    console.log('Server listening at port %d', port);
});
