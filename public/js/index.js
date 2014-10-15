$(document).ready(function(){
	
	// Initialize Variables
	var socket = io();
	var treeState = {};
	var username;
  var connected = false;
  var numUsers = 0;
  var $window = $(window);
  var $usernameInput = $('#userNameInput');
  var $welcomeMessage = $('#welcomeMessage');
  var $userNameInputDiv = $('#userNameInputDiv');

	/*
  // JS Tree Code
	*/
	// Create a jstree instance
	$('#jstree').jstree({
		'core' : {
	      'data' : [
	        {"id" : 1, "text" : "Root Node"},
	        {"id" : 2, "text" : "Node 2"},
	      ]
	    },
  		"plugins" : ["dnd", "state"]
	});

	// listen for jstree events
	$('#jstree').on("changed.jstree", function (e, data) {
	  jsonData = $('#jstree').jstree("get_json");
	  console.log(jsonData);
		socket.emit('tree change', jsonData);
	});

	$('#jstree').on("create_node.jstree", function(e, data) {
		console.log(data.node);
	});

	// Add Node Button
	$('#addNode').on('click', function () {
	  console.log('add node button clicked');
	  $('#jstree').jstree().create_node();
	});

	/*
  // Right Click Code
	*/
	context.init({
		faceSpeed: 100,
		filter: function ($obj){},
		above: 'auto',
		preventDoubleContext: true,
		compress: false
	})

	var menuItems = [
	{
		header: 'Edit Number Tree'
	},
	{
		text: 'Delete Factory',
		href: '/',
		target: '_blank'
	},
	{
		text: 'Add New Factory',
		href: '/',
		target: '_blank'
	},
	{
		text: 'Generate Random Numbers',
		href: '/',
		target: '_blank'
	}

	];

	context.attach('#jstree', menuItems);


	/*
	// Button Functions
	*/
	$('#loginButton').click(function() {
		console.log('button clicked')
		console.log(setUsername());
	});


  // Sets the client's username
  function setUsername () {
    username = cleanInput($usernameInput.val().trim());

    // If the username is valid
    if (username) {

    	++numUsers;
      $userNameInputDiv.hide();
			$welcomeMessage.append('Hello, ' + username);
      $welcomeMessage.show();

      // Tell the server your username
      socket.emit('add user', username);
      return true
    }
    return false
  }

  // Sends a chat message
  function sendMessage () {
    var message = $inputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (message && connected) {
      $inputMessage.val('');
      addChatMessage({
        username: username,
        message: message
      });
      // tell server to execute 'new message' and send along one parameter
      socket.emit('new message', message);
    }
  }

  // Log a message
  function log (message) {
    $('#feed').prepend("<li>" + message + "</li>");
  }


  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).text();
  }

  // Updates the typing event
  function updateTreeData (treeData) {

  }

  // Updates the typing event
  function updateTreeView (treeData) {

  }




  /*
  // Socket.io Events
	*/
  // Whenever the server emits 'login', log the login message
  socket.on('login', function (data) {
    connected = true;
    // Display the welcome message
    var message = data['username'] + ' joined the app';
    log(message);
    // addParticipantsMessage(data);
  });

  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', function (data) {
    addChatMessage(data);
  });

  // Whenever the server emits 'user joined', log it in the chat body
  socket.on('user joined', function (data) {
    log(data.username + ' joined');
    $welcomeMessage
    // addParticipantsMessage(data);
  });

  // Whenever the server emits 'user left', log it in the chat body
  socket.on('user left', function (data) {
    log(data.username + ' left');
    // addParticipantsMessage(data);
    // removeChatTyping(data);
  });

  // Whenever the server emits 'typing', show the typing message
  socket.on('typing', function (data) {
    addChatTyping(data);
  });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', function (data) {
    removeChatTyping(data);
  });

});