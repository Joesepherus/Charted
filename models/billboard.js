var mongoose = require('mongoose');

var schema = mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	author: {
		type: String,
		required: true
	},
});


var Billboard = module.exports = mongoose.model('billboard', schema, 'billboard');

module.exports.getAllSongs = function (callback, limit) {
	// Billboard.find(callback).limit(limit);

	Billboard.find(callback).limit();
}
