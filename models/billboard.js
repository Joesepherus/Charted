var mongoose = require('mongoose');

var schema = mongoose.Schema({
	id: {
		type: Number,
		required: true
	},
	title: {
		type: String,
		required: true
	},
	author: {
		type: String,
		required: true
	},
}, { _id: false });


var Billboard = module.exports = mongoose.model('billboard', schema);

module.exports.getAllSongs = function (callback, limit) {
	// Billboard.find(callback).limit(limit);
	const songs = Billboard.find().fetch()
	console.log('songs: ', songs);

	Billboard.find(callback).limit();
}
