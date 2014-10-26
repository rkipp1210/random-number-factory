
var mongoose = require('mongoose');

module.exports = mongoose.model('jstree',{
	id: String,
	name: String,
	jstreeObject: []
});