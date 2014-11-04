/*
// Functions
*/

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

// Function to generate random numbers for a factory
function generateNumbers(numGen) {
	var treeID = $('#jstree').jstree().get_selected();
  
  // Only run the generator if we are in a factory (parent of current selection is the root)
  if ( $('#jstree').jstree().get_parent(treeID) == "1" ) {

  	// Pull the upper and lower bounds from the factory data
  	var factoryData = $('#jstree').jstree().get_json(treeID);
  	var dataStr = factoryData.data;
  	var dataStringSplit = dataStr.split(",");
  	var lowerBound = Number(dataStringSplit[0]);
  	var upperBound = Number(dataStringSplit[1]);
  	var randomNum = 0;

  	// Delete all previous numbers generated
  	var children = $('#jstree').jstree(). get_children_dom(treeID)
  	$.each(children, function(index, value) {
  		$('#jstree').jstree().delete_node(children[index].id)
  	});
  	// generate the requisite random numbers, and add them to the tree
  	for (i = 0; i < numGen; i++) {
  		randomNum = getRandomInt(lowerBound, upperBound);
  		$('#jstree').jstree().create_node(treeID, {"type":"file", "text": String(randomNum)});
  	}
  	var jsonData = $('#jstree').jstree("get_json");
  	socket.emit('tree change', jsonData);
  } else {
  	alert('You can only run the generator on a factory node!');
  }

};

// Delete a jstree node
function delete_node(id) {
	if (id != "1") {
		$('#jstree').jstree().delete_node(id)
		var jsonData = $('#jstree').jstree("get_json");
  	socket.emit('tree change', jsonData);
	} else {
		alert('That\'s the root node! You can\'t delete that one!');
	}
}

// Add a factory
function add_factory(id) {
	// Generate the random pool
	var round = 5; // What do we want our factories to be rounded to?
	var min = 1;
	var max = 1000 / round;
	var smaller = 0;
	var larger = 0;
	var randomNum1 = getRandomInt(min, max) * round;
	var randomNum2 = getRandomInt(min, max) * round;
	if (randomNum1 < randomNum2) {
		smaller = randomNum1;
		larger 	= randomNum2;
	} else {
		smaller = randomNum2;
		larger 	= randomNum1;
	}
	var string = "Factory: (" + smaller + "-" + larger + ")";
	var dataString = smaller + "," + larger;
	$('#jstree').jstree().create_node("1", {"type":"file", "text": string, "data": dataString});
	//socket.emit('factory added');
	var jsonData = $('#jstree').jstree("get_json");
  socket.emit('tree change', jsonData);
}

$(document).ready(function(){
	
	// Initialize Variables
	var socket = io();

	/*
  // home.html javascript
	*/
	// Register the modal, but keep it hidden
	$('.modal').modal('hide');
  
  // On the modal button click
  $('#modalOkayButton').click(function() {
    // Get the user input
    var str = $('#randNumField').val();
    // Check the user input
    var numGen = Number(str)

    if (numGen == NaN) {
    	alert('Try again, and input a valid integer between 1 and 15, please!');
    	$('.modal').modal('show');

    } else {
    	// We have a valid number, but check if it's an integer between 1 and 15
    	if (numGen < 16 && numGen > 0 && numGen % 1 == 0) {
    		generateNumbers(numGen);
    	} else {
    		alert('Try again, and input a valid number between 1 and 15, please!');
    		$('.modal').modal('show');
    	}
    }

    console.log('generate: ' + numGen + ' random numbers, please!');
  });


	/*
  // JS Tree Code
	*/

	// listen for jstree events
	$('#jstree').on("changed.jstree", function (e, data) {
	  jsonData = $('#jstree').jstree("get_json");
	  // console.log('client sending json on tree change: ' + jsonData);
		socket.emit('tree change', jsonData);
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
		divider: true
	},

	{
		text: 'Delete Factory',
		action: function(e) {
			var treeID = $('#jstree').jstree().get_selected();
			delete_node(treeID);
		}
	},

	{
		text: 'Add New Factory',
		action: function(e) {
			var treeID = $('#jstree').jstree().get_selected();
			add_factory(treeID);
		}
	},
	{
		text: 'Generate Random Numbers',
		action: function(e) {
			$('.modal').modal('show');
		}
	}

	];

	context.attach('#jstree', menuItems);



  /*
  // Socket.io Events
	*/



});