var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var TreeObj = require('../models/factory');

var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/');
}


module.exports = function(passport, treeObj){


	/* GET login page. */
	router.get('/', function(req, res) {
    	// Display the Login page with any flash message, if any
		res.render('index', { message: req.flash('message') });
	});

	/* Handle Login POST */
	router.post('/login', passport.authenticate('login', {
		successRedirect: '/home',
		failureRedirect: '/',
		failureFlash : true  
	}));

	/* GET Registration Page */
	router.get('/signup', function(req, res){
		res.render('register', {message: req.flash('message')});
	});

	/* Handle Registration POST */
	router.post('/signup', passport.authenticate('signup', {
		successRedirect: '/home',
		failureRedirect: '/signup',
		failureFlash : true  
	}));

	/* Handle Logout */
	router.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	/* GET Home Page */
	router.get('/home', isAuthenticated, function(req, res){

	  TreeObj.findOne({ 'name': 'main' }, function (err, treeObj) {
	    if (err) {
	      res.send(400, error);
	    }
	    else {
	      res.render('home', {user: req.user, 'treeData': treeObj.jstreeObject });
	    }
	  });

	});


	return router;
}





